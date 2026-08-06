import { getD1Binding } from "./index";

const initializedBindings = new WeakSet<object>();

const schemaStatements = [
  `CREATE TABLE IF NOT EXISTS joke_candidates (
    id TEXT PRIMARY KEY NOT NULL,
    setup_json TEXT NOT NULL,
    punchline TEXT NOT NULL,
    tag TEXT,
    emoji TEXT NOT NULL DEFAULT '🙂',
    mechanism_id TEXT NOT NULL,
    format TEXT NOT NULL,
    topics_json TEXT NOT NULL DEFAULT '[]',
    emotional_truth TEXT NOT NULL,
    expected_reading TEXT NOT NULL,
    revealed_reading TEXT NOT NULL,
    palette TEXT NOT NULL DEFAULT 'yellow',
    label TEXT NOT NULL,
    quality_score INTEGER NOT NULL,
    quality_json TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    source TEXT NOT NULL DEFAULT 'baseline',
    provider TEXT NOT NULL DEFAULT 'deterministic',
    model TEXT,
    prompt_version TEXT NOT NULL DEFAULT 'baseline-v1',
    status TEXT NOT NULL DEFAULT 'published',
    visibility_session_id TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_joke_candidates_status_quality
    ON joke_candidates(status, quality_score)`,
  `CREATE INDEX IF NOT EXISTS idx_joke_candidates_visibility
    ON joke_candidates(visibility_session_id, status)`,
  `CREATE INDEX IF NOT EXISTS idx_joke_candidates_mechanism
    ON joke_candidates(mechanism_id)`,
  `CREATE TABLE IF NOT EXISTS impression_events (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    joke_id TEXT NOT NULL,
    surface TEXT NOT NULL DEFAULT 'feed',
    position INTEGER NOT NULL DEFAULT 0,
    served_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_impressions_session_time
    ON impression_events(session_id, served_at)`,
  `CREATE INDEX IF NOT EXISTS idx_impressions_joke
    ON impression_events(joke_id)`,
  `CREATE TABLE IF NOT EXISTS feedback_events (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    joke_id TEXT NOT NULL,
    vote TEXT NOT NULL,
    reason_code TEXT,
    dwell_ms INTEGER,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_feedback_session_time
    ON feedback_events(session_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_feedback_joke_vote
    ON feedback_events(joke_id, vote)`,
  `CREATE INDEX IF NOT EXISTS idx_feedback_reason
    ON feedback_events(reason_code)`,
  `CREATE TABLE IF NOT EXISTS pairwise_events (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    joke_a_id TEXT NOT NULL,
    joke_b_id TEXT NOT NULL,
    winner_id TEXT NOT NULL,
    reason_code TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_pairwise_session_time
    ON pairwise_events(session_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_pairwise_winner
    ON pairwise_events(winner_id)`,
  `CREATE TABLE IF NOT EXISTS generation_runs (
    id TEXT PRIMARY KEY NOT NULL,
    session_id TEXT NOT NULL,
    scene TEXT NOT NULL,
    audience TEXT NOT NULL,
    tone TEXT NOT NULL,
    provider TEXT NOT NULL,
    model TEXT,
    prompt_version TEXT NOT NULL,
    status TEXT NOT NULL,
    candidate_count INTEGER NOT NULL DEFAULT 0,
    accepted_count INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER,
    trace_json TEXT NOT NULL DEFAULT '{}',
    error_code TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_generation_session_time
    ON generation_runs(session_id, created_at)`,
  `CREATE INDEX IF NOT EXISTS idx_generation_status
    ON generation_runs(status)`,
  `CREATE TABLE IF NOT EXISTS culture_cards (
    id TEXT PRIMARY KEY NOT NULL,
    context TEXT NOT NULL,
    audience_json TEXT NOT NULL DEFAULT '[]',
    relationship_json TEXT NOT NULL DEFAULT '[]',
    shared_human_truth TEXT NOT NULL,
    emotions_json TEXT NOT NULL DEFAULT '[]',
    mechanisms_json TEXT NOT NULL DEFAULT '[]',
    source_kind TEXT NOT NULL DEFAULT 'original',
    stale_after TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_culture_cards_status_stale
    ON culture_cards(status, stale_after)`,
  `CREATE TABLE IF NOT EXISTS runtime_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
    name TEXT NOT NULL,
    value REAL NOT NULL,
    dimensions_json TEXT NOT NULL DEFAULT '{}',
    recorded_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS idx_runtime_metrics_name_time
    ON runtime_metrics(name, recorded_at)`
] as const;

export async function ensureDatabaseSchema(): Promise<void> {
  const binding = getD1Binding();
  if (initializedBindings.has(binding)) {
    return;
  }

  await binding.batch(schemaStatements.map((statement) => binding.prepare(statement)));
  await binding.prepare("PRAGMA optimize").run();
  initializedBindings.add(binding);
}
