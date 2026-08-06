import { getD1Binding } from "../../db/index.js";
import { ensureDatabaseSchema } from "../../db/runtime-schema.js";
import { createFeedbackMemory, recordFeedback, type FeedbackMemory } from "../web/joke-engine.js";
import { buildCultureJokeDeck } from "../pipeline/build-culture-joke-deck.js";
import { cultureCardSeeds } from "../data/culture-cards.js";
import type { CultureJoke, JokeQualityScores } from "../humor/types.js";
import type {
  ComparisonVoteRequest,
  FeedbackRequest,
  FeedSessionSummary,
  HumorLabMetrics
} from "../platform/contracts.js";
import { feedbackReasonCodes, type FeedbackReasonCode } from "../platform/contracts.js";
import { getHumorMechanism } from "../data/culture-humor-patterns.js";
import type { HumorMechanismId } from "../humor/types.js";
import { createId, hashSessionId } from "./session.js";

interface CandidateRow {
  id: string;
  setup_json: string;
  punchline: string;
  tag: string | null;
  emoji: string;
  mechanism_id: CultureJoke["mechanismId"];
  format: CultureJoke["format"];
  topics_json: string;
  emotional_truth: string;
  expected_reading: string;
  revealed_reading: string;
  palette: CultureJoke["palette"];
  label: string;
  quality_score: number;
  quality_json: string;
  fingerprint: string;
  global_funny: number;
  global_feedback: number;
}

interface FeedbackHistoryRow extends CandidateRow {
  vote: "funny" | "not_funny";
}

export interface RankedRepositoryCandidate {
  joke: CultureJoke;
  globalFunny: number;
  globalFeedback: number;
}

export interface StoredGenerationCandidate {
  joke: CultureJoke;
  provider: string;
  model: string | null;
  promptVersion: string;
  status: "published" | "private" | "rejected";
  source: string;
}

const candidateColumns = `
    c.id,
    c.setup_json,
    c.punchline,
    c.tag,
    c.emoji,
    c.mechanism_id,
    c.format,
    c.topics_json,
    c.emotional_truth,
    c.expected_reading,
    c.revealed_reading,
    c.palette,
    c.label,
    c.quality_score,
    c.quality_json,
    c.fingerprint,
    COALESCE(SUM(CASE WHEN f.vote = 'funny' THEN 1 ELSE 0 END), 0) AS global_funny,
    COUNT(f.id) AS global_feedback`;

const candidateFrom = `
  FROM joke_candidates c
  LEFT JOIN feedback_events f ON f.joke_id = c.id`;

const initializedRepositories = new WeakSet<object>();

export async function initializeRepository(): Promise<void> {
  await ensureDatabaseSchema();
  const binding = getD1Binding();
  if (initializedRepositories.has(binding)) return;

  const baseline = buildCultureJokeDeck();

  const statements = baseline.map((joke) =>
    binding
      .prepare(
        `INSERT INTO joke_candidates (
          id, setup_json, punchline, tag, emoji, mechanism_id, format, topics_json,
          emotional_truth, expected_reading, revealed_reading, palette, label,
          quality_score, quality_json, fingerprint, source, provider, model,
          prompt_version, status, visibility_session_id
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET
          setup_json = excluded.setup_json,
          punchline = excluded.punchline,
          tag = excluded.tag,
          emoji = excluded.emoji,
          mechanism_id = excluded.mechanism_id,
          format = excluded.format,
          topics_json = excluded.topics_json,
          emotional_truth = excluded.emotional_truth,
          expected_reading = excluded.expected_reading,
          revealed_reading = excluded.revealed_reading,
          palette = excluded.palette,
          label = excluded.label,
          quality_score = excluded.quality_score,
          quality_json = excluded.quality_json,
          fingerprint = excluded.fingerprint,
          prompt_version = excluded.prompt_version,
          updated_at = CURRENT_TIMESTAMP
        WHERE joke_candidates.source = 'baseline-v1'`
      )
      .bind(
        joke.id,
        JSON.stringify(joke.setup),
        joke.punchline,
        joke.tag ?? null,
        joke.emoji,
        joke.mechanismId,
        joke.format,
        JSON.stringify(joke.topics),
        joke.emotionalTruth,
        joke.expectedReading,
        joke.revealedReading,
        joke.palette,
        joke.label,
        joke.score,
        JSON.stringify(joke.quality),
        joke.fingerprint,
        "baseline-v1",
        "deterministic",
        null,
        "baseline-v1",
        "published",
        null
      )
  );

  for (let index = 0; index < statements.length; index += 16) {
    await binding.batch(statements.slice(index, index + 16));
  }

  const cultureStatements = cultureCardSeeds.map((card) =>
    binding
      .prepare(
        `INSERT INTO culture_cards (
          id, context, audience_json, relationship_json, shared_human_truth,
          emotions_json, mechanisms_json, source_kind, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, 'original', 'active')
        ON CONFLICT(id) DO NOTHING`
      )
      .bind(
        card.id,
        card.context,
        JSON.stringify([card.audience]),
        JSON.stringify(card.relationship),
        card.sharedHumanTruth,
        JSON.stringify(card.emotions),
        JSON.stringify(card.mechanisms)
      )
  );
  await binding.batch(cultureStatements);
  initializedRepositories.add(binding);
}

export async function listFeedCandidates(
  sessionId: string
): Promise<RankedRepositoryCandidate[]> {
  await initializeRepository();
  const hashedSessionId = await hashSessionId(sessionId);
  const result = await getD1Binding()
    .prepare(
      `SELECT ${candidateColumns}
       ${candidateFrom}
       WHERE c.status = 'published'
          OR (c.status = 'private' AND c.visibility_session_id = ?)
       GROUP BY c.id
       ORDER BY c.quality_score DESC, c.created_at DESC
       LIMIT 250`
    )
    .bind(hashedSessionId)
    .all<CandidateRow>();

  return result.results.map((row: CandidateRow) => ({
    joke: candidateRowToJoke(row),
    globalFunny: Number(row.global_funny),
    globalFeedback: Number(row.global_feedback)
  }));
}

export async function getSessionFeedbackMemory(
  sessionId: string
): Promise<{ memory: FeedbackMemory; summary: FeedSessionSummary }> {
  await initializeRepository();
  const hashedSessionId = await hashSessionId(sessionId);
  const result = await getD1Binding()
    .prepare(
      `SELECT ${candidateColumns}, f.vote AS vote
       ${candidateFrom}
       WHERE f.session_id = ?
       GROUP BY f.id
       ORDER BY f.created_at ASC
       LIMIT 300`
    )
    .bind(hashedSessionId)
    .all<FeedbackHistoryRow>();

  let memory = createFeedbackMemory();
  for (const row of result.results) {
    memory = recordFeedback(memory, candidateRowToJoke(row), row.vote);
  }

  return {
    memory,
    summary: {
      total: memory.total,
      funny: memory.funny,
      funnyRate: memory.total === 0 ? 0 : Math.round((memory.funny / memory.total) * 100)
    }
  };
}

export async function recordImpression(input: {
  sessionId: string;
  jokeId: string;
  surface: "feed" | "compare" | "studio";
  position?: number;
}): Promise<void> {
  await initializeRepository();
  const hashedSessionId = await hashSessionId(input.sessionId);
  await getD1Binding()
    .prepare(
      `INSERT INTO impression_events (id, session_id, joke_id, surface, position)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind(
      createId("imp"),
      hashedSessionId,
      input.jokeId,
      input.surface,
      input.position ?? 0
    )
    .run();
}

export async function upsertFeedback(input: FeedbackRequest): Promise<void> {
  await initializeRepository();
  const hashedSessionId = await hashSessionId(input.sessionId);
  const reasonCode = input.reasonCode ?? null;
  const dwellMs = input.dwellMs ?? null;

  await getD1Binding()
    .prepare(
      `INSERT INTO feedback_events (
        id, session_id, joke_id, vote, reason_code, dwell_ms
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        reason_code = excluded.reason_code,
        dwell_ms = COALESCE(excluded.dwell_ms, feedback_events.dwell_ms),
        updated_at = CURRENT_TIMESTAMP`
    )
    .bind(input.eventId, hashedSessionId, input.jokeId, input.vote, reasonCode, dwellMs)
    .run();
}

export async function recordPairwiseVote(input: ComparisonVoteRequest): Promise<void> {
  await initializeRepository();
  const hashedSessionId = await hashSessionId(input.sessionId);
  await getD1Binding()
    .prepare(
      `INSERT INTO pairwise_events (
        id, session_id, joke_a_id, joke_b_id, winner_id, reason_code
      ) VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO NOTHING`
    )
    .bind(
      input.comparisonId,
      hashedSessionId,
      input.jokeAId,
      input.jokeBId,
      input.winnerId,
      input.reasonCode ?? null
    )
    .run();
}

export async function saveGenerationCandidate(
  input: StoredGenerationCandidate,
  sessionId: string
): Promise<void> {
  await initializeRepository();
  const hashedSessionId = await hashSessionId(sessionId);
  const { joke } = input;

  await getD1Binding()
    .prepare(
      `INSERT INTO joke_candidates (
        id, setup_json, punchline, tag, emoji, mechanism_id, format, topics_json,
        emotional_truth, expected_reading, revealed_reading, palette, label,
        quality_score, quality_json, fingerprint, source, provider, model,
        prompt_version, status, visibility_session_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        quality_score = excluded.quality_score,
        quality_json = excluded.quality_json,
        status = excluded.status,
        updated_at = CURRENT_TIMESTAMP`
    )
    .bind(
      joke.id,
      JSON.stringify(joke.setup),
      joke.punchline,
      joke.tag ?? null,
      joke.emoji,
      joke.mechanismId,
      joke.format,
      JSON.stringify(joke.topics),
      joke.emotionalTruth,
      joke.expectedReading,
      joke.revealedReading,
      joke.palette,
      joke.label,
      joke.score,
      JSON.stringify(joke.quality),
      joke.fingerprint,
      input.source,
      input.provider,
      input.model,
      input.promptVersion,
      input.status,
      input.status === "private" ? hashedSessionId : null
    )
    .run();
}

export async function startGenerationRun(input: {
  id: string;
  sessionId: string;
  scene: string;
  audience: string;
  tone: string;
  provider: string;
  model: string | null;
  promptVersion: string;
}): Promise<void> {
  await initializeRepository();
  const hashedSessionId = await hashSessionId(input.sessionId);
  await getD1Binding()
    .prepare(
      `INSERT INTO generation_runs (
        id, session_id, scene, audience, tone, provider, model, prompt_version, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'running')`
    )
    .bind(
      input.id,
      hashedSessionId,
      input.scene,
      input.audience,
      input.tone,
      input.provider,
      input.model,
      input.promptVersion
    )
    .run();
}

export async function completeGenerationRun(input: {
  id: string;
  status: "completed" | "fallback" | "failed";
  provider: string;
  model: string | null;
  candidateCount: number;
  acceptedCount: number;
  durationMs: number;
  trace: Record<string, unknown>;
  errorCode?: string | null;
}): Promise<void> {
  await initializeRepository();
  await getD1Binding()
    .prepare(
      `UPDATE generation_runs SET
        status = ?, provider = ?, model = ?, candidate_count = ?, accepted_count = ?,
        duration_ms = ?, trace_json = ?, error_code = ?, completed_at = CURRENT_TIMESTAMP
       WHERE id = ?`
    )
    .bind(
      input.status,
      input.provider,
      input.model,
      input.candidateCount,
      input.acceptedCount,
      input.durationMs,
      JSON.stringify(input.trace),
      input.errorCode ?? null,
      input.id
    )
    .run();
}

export async function getRepositoryCounts(): Promise<{
  candidates: number;
  feedback: number;
  comparisons: number;
  impressions: number;
}> {
  await initializeRepository();
  const binding = getD1Binding();
  const [candidates, feedback, comparisons, impressions] = await Promise.all([
    countRows(binding, "joke_candidates"),
    countRows(binding, "feedback_events"),
    countRows(binding, "pairwise_events"),
    countRows(binding, "impression_events")
  ]);

  return { candidates, feedback, comparisons, impressions };
}

export interface CandidatePoolStats {
  total: number;
  published: number;
  private: number;
  rejected: number;
  averagePublishedScore: number;
  mechanisms: Array<{ mechanismId: string; count: number; averageScore: number }>;
}

export async function getCandidatePoolStats(): Promise<CandidatePoolStats> {
  await initializeRepository();
  const binding = getD1Binding();
  const [statusResult, mechanismResult] = await Promise.all([
    binding
      .prepare(
        `SELECT status, COUNT(*) AS count,
          AVG(CASE WHEN status = 'published' THEN quality_score END) AS average_score
         FROM joke_candidates
         GROUP BY status`
      )
      .all<{ status: string; count: number; average_score: number | null }>(),
    binding
      .prepare(
        `SELECT mechanism_id, COUNT(*) AS count, AVG(quality_score) AS average_score
         FROM joke_candidates
         WHERE status = 'published'
         GROUP BY mechanism_id
         ORDER BY count DESC, mechanism_id ASC`
      )
      .all<{ mechanism_id: string; count: number; average_score: number }>()
  ]);
  const statusCounts = Object.fromEntries(
    statusResult.results.map((row) => [row.status, Number(row.count)])
  );
  const publishedRow = statusResult.results.find((row) => row.status === "published");

  return {
    total: statusResult.results.reduce((sum, row) => sum + Number(row.count), 0),
    published: statusCounts.published ?? 0,
    private: statusCounts.private ?? 0,
    rejected: statusCounts.rejected ?? 0,
    averagePublishedScore: Number(Number(publishedRow?.average_score ?? 0).toFixed(2)),
    mechanisms: mechanismResult.results.map((row) => ({
      mechanismId: row.mechanism_id,
      count: Number(row.count),
      averageScore: Number(Number(row.average_score).toFixed(2))
    }))
  };
}

export async function recordRuntimeMetric(input: {
  name: string;
  value: number;
  dimensions?: Record<string, string | number | boolean | null>;
}): Promise<void> {
  await initializeRepository();
  await getD1Binding()
    .prepare(
      `INSERT INTO runtime_metrics (name, value, dimensions_json)
       VALUES (?, ?, ?)`
    )
    .bind(input.name, input.value, JSON.stringify(input.dimensions ?? {}))
    .run();
}

export async function getRecentGenerationCount(
  sessionId: string,
  windowMinutes = 60
): Promise<number> {
  await initializeRepository();
  const hashedSessionId = await hashSessionId(sessionId);
  const safeWindow = Math.max(1, Math.min(1_440, Math.round(windowMinutes)));
  const row = await getD1Binding()
    .prepare(
      `SELECT COUNT(*) AS count
       FROM generation_runs
       WHERE session_id = ?
         AND created_at >= datetime('now', ?)`
    )
    .bind(hashedSessionId, `-${safeWindow} minutes`)
    .first<{ count: number }>();
  return Number(row?.count ?? 0);
}

export async function getHumorLabMetrics(): Promise<HumorLabMetrics> {
  await initializeRepository();
  const binding = getD1Binding();
  const [overview, reasons, mechanisms, generation, providers, pool] = await Promise.all([
    binding
      .prepare(
        `SELECT
          (SELECT COUNT(*) FROM impression_events) AS impressions,
          (SELECT COUNT(*) FROM feedback_events) AS feedback,
          (SELECT COUNT(*) FROM feedback_events WHERE vote = 'funny') AS funny,
          (SELECT COUNT(*) FROM pairwise_events) AS comparisons`
      )
      .first<{ impressions: number; feedback: number; funny: number; comparisons: number }>(),
    binding
      .prepare(
        `SELECT reason_code, COUNT(*) AS count
         FROM feedback_events
         WHERE reason_code IS NOT NULL
         GROUP BY reason_code
         ORDER BY count DESC`
      )
      .all<{ reason_code: string; count: number }>(),
    binding
      .prepare(
        `SELECT c.mechanism_id,
          COUNT(f.id) AS feedback,
          COALESCE(SUM(CASE WHEN f.vote = 'funny' THEN 1 ELSE 0 END), 0) AS funny,
          AVG(c.quality_score) AS average_quality
         FROM joke_candidates c
         LEFT JOIN feedback_events f ON f.joke_id = c.id
         WHERE c.status = 'published'
         GROUP BY c.mechanism_id
         ORDER BY feedback DESC, c.mechanism_id ASC`
      )
      .all<{
        mechanism_id: string;
        feedback: number;
        funny: number;
        average_quality: number;
      }>(),
    binding
      .prepare(
        `SELECT COUNT(*) AS runs,
          COALESCE(SUM(CASE WHEN status IN ('completed', 'fallback') THEN 1 ELSE 0 END), 0) AS successful,
          COALESCE(AVG(duration_ms), 0) AS average_duration_ms,
          COALESCE(SUM(candidate_count), 0) AS candidates,
          COALESCE(SUM(accepted_count), 0) AS accepted
         FROM generation_runs`
      )
      .first<{
        runs: number;
        successful: number;
        average_duration_ms: number;
        candidates: number;
        accepted: number;
      }>(),
    binding
      .prepare(
        `SELECT provider, COUNT(*) AS runs
         FROM generation_runs
         GROUP BY provider
         ORDER BY runs DESC`
      )
      .all<{ provider: string; runs: number }>(),
    getCandidatePoolStats()
  ]);
  const feedback = Number(overview?.feedback ?? 0);
  const funny = Number(overview?.funny ?? 0);
  const runs = Number(generation?.runs ?? 0);
  const candidates = Number(generation?.candidates ?? 0);

  return {
    overview: {
      impressions: Number(overview?.impressions ?? 0),
      feedback,
      funny,
      funnyRate: percent(funny, feedback),
      comparisons: Number(overview?.comparisons ?? 0)
    },
    pool: {
      published: pool.published,
      private: pool.private,
      rejected: pool.rejected,
      averagePublishedScore: pool.averagePublishedScore
    },
    feedbackReasons: reasons.results
      .filter((row): row is { reason_code: FeedbackReasonCode; count: number } =>
        feedbackReasonCodes.includes(row.reason_code as FeedbackReasonCode)
      )
      .map((row) => ({ reasonCode: row.reason_code, count: Number(row.count) })),
    mechanisms: mechanisms.results.map((row) => {
      const mechanismId = row.mechanism_id as HumorMechanismId;
      const mechanismFeedback = Number(row.feedback);
      const mechanismFunny = Number(row.funny);
      return {
        mechanismId,
        label: getHumorMechanism(mechanismId).shortLabel,
        feedback: mechanismFeedback,
        funny: mechanismFunny,
        funnyRate: percent(mechanismFunny, mechanismFeedback),
        averageQuality: Number(Number(row.average_quality ?? 0).toFixed(2))
      };
    }),
    generation: {
      runs,
      successRate: percent(Number(generation?.successful ?? 0), runs),
      averageDurationMs: Math.round(Number(generation?.average_duration_ms ?? 0)),
      acceptedRate: percent(Number(generation?.accepted ?? 0), candidates),
      providers: providers.results.map((row) => ({
        provider: row.provider,
        runs: Number(row.runs)
      }))
    },
    updatedAt: new Date().toISOString()
  };
}

function candidateRowToJoke(row: CandidateRow): CultureJoke {
  const quality = parseJson<JokeQualityScores>(row.quality_json, {
    overall: row.quality_score,
    setupTrust: row.quality_score,
    reversal: row.quality_score,
    clarity: row.quality_score,
    rhythm: row.quality_score,
    specificity: row.quality_score,
    safety: 96
  });

  return {
    id: row.id,
    setup: parseJson<string[]>(row.setup_json, []),
    punchline: row.punchline,
    tag: row.tag ?? undefined,
    emoji: row.emoji,
    mechanismId: row.mechanism_id,
    format: row.format,
    topics: parseJson<string[]>(row.topics_json, []),
    emotionalTruth: row.emotional_truth,
    expectedReading: row.expected_reading,
    revealedReading: row.revealed_reading,
    palette: row.palette,
    editorialScore: row.quality_score,
    label: row.label,
    score: row.quality_score,
    quality,
    fingerprint: row.fingerprint
  };
}

function parseJson<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

function percent(value: number, total: number): number {
  return total === 0 ? 0 : Number(((value / total) * 100).toFixed(1));
}

async function countRows(
  binding: ReturnType<typeof getD1Binding>,
  table: "joke_candidates" | "feedback_events" | "pairwise_events" | "impression_events"
): Promise<number> {
  const row = await binding.prepare(`SELECT COUNT(*) AS count FROM ${table}`).first<{ count: number }>();
  return Number(row?.count ?? 0);
}
