import { getHumorMechanism } from "../data/culture-humor-patterns.js";
import {
  createJokeFingerprint,
  findNearDuplicate
} from "../agents/originality-guard.js";
import type { CultureJoke, OriginalJokeDraft } from "../humor/types.js";
import type {
  GeneratedJokeCandidate,
  GenerateJokeRequest,
  GenerateJokeResponse
} from "../platform/contracts.js";
import { runLocalCritics } from "../generation/local-critic.js";
import { HumorProviderError, type HumorGenerationProvider } from "../generation/provider.js";
import { selectGenerationProvider } from "../generation/provider-factory.js";
import type {
  Critique,
  CritiqueReasonCode,
  JudgeOutput,
  PunchlinePlan,
  WriterOutput
} from "../generation/schemas.js";
import {
  completeGenerationRun,
  getRecentGenerationCount,
  listFeedCandidates,
  saveGenerationCandidate,
  startGenerationRun
} from "./joke-repository.js";
import { createId } from "./session.js";
import { ApiError } from "./http.js";

interface ReviewedCandidate {
  joke: CultureJoke;
  draft: OriginalJokeDraft;
  accepted: boolean;
  review: Critique;
  reasonCodes: string[];
  modelRank: number;
}

interface GenerationOptions {
  acceptedStatus?: "private" | "published";
  source?: "studio" | "replenishment";
  skipRateLimit?: boolean;
}

export async function generateJokes(
  input: GenerateJokeRequest,
  options: GenerationOptions = {}
): Promise<GenerateJokeResponse> {
  const startedAt = Date.now();
  const runId = createId("run");
  const selection = selectGenerationProvider();
  let provider = selection.primary;
  let usedFallback = false;
  let providerErrorCode: string | null = null;

  if (!options.skipRateLimit) {
    const recentRuns = await getRecentGenerationCount(input.sessionId, 60);
    if (recentRuns >= 12) {
      throw new ApiError("这一小时已经写了很多轮，先挑挑现有候选，稍后再来。", 429, "RATE_LIMITED");
    }
  }

  await startGenerationRun({
    id: runId,
    sessionId: input.sessionId,
    scene: input.scene,
    audience: input.audience,
    tone: input.tone,
    provider: provider.metadata.name,
    model: provider.metadata.model,
    promptVersion: provider.metadata.promptVersion
  });

  let output: WriterOutput;
  let judgment: JudgeOutput;

  try {
    ({ output, judgment } = await runProvider(provider, input));
  } catch (error) {
    if (provider.metadata.name === "deterministic") {
      await failGenerationRun(runId, provider, startedAt, error);
      throw error;
    }

    providerErrorCode = getProviderErrorCode(error);
    provider = selection.fallback;
    usedFallback = true;
    ({ output, judgment } = await runProvider(provider, input));
  }

  const pool = (await listFeedCandidates(input.sessionId)).map((candidate) => candidate.joke);
  const reviewed = reviewCandidates(runId, output, judgment, pool);
  let accepted = reviewed.filter((candidate) => candidate.accepted);
  let notice: string | null = usedFallback
    ? "在线模型暂时不可用，已自动切换到本地原创规则生成。"
    : selection.modelConfigured
      ? null
      : "当前未配置模型密钥，正在使用本地原创规则生成。";

  for (const candidate of reviewed) {
    await saveGenerationCandidate(
      {
        joke: candidate.joke,
        provider: provider.metadata.name,
        model: provider.metadata.model,
        promptVersion: provider.metadata.promptVersion,
        status: candidate.accepted ? (options.acceptedStatus ?? "private") : "rejected",
        source: options.source ?? "studio"
      },
      input.sessionId
    );
  }

  if (accepted.length === 0) {
    accepted = pool.slice(0, 4).map((joke) => ({
      joke,
      draft: joke,
      accepted: true,
      review: fallbackCritique(joke),
      reasonCodes: ["REVIEWED_POOL_FALLBACK"],
      modelRank: 99
    }));
    notice = "这轮新候选没有通过质量门禁，已主动弃权并返回审核内容。";
    usedFallback = true;
  }

  accepted.sort((left, right) => right.review.overall - left.review.overall);
  const durationMs = Date.now() - startedAt;
  const rejected = reviewed.filter((candidate) => !candidate.accepted);

  await completeGenerationRun({
    id: runId,
    status: usedFallback ? "fallback" : "completed",
    provider: provider.metadata.name,
    model: provider.metadata.model,
    candidateCount: reviewed.length,
    acceptedCount: reviewed.length - rejected.length,
    durationMs,
    errorCode: providerErrorCode,
    trace: {
      traceVersion: "public-reasons-v1",
      candidateReasonCodes: reviewed.map((candidate) => ({
        id: candidate.joke.id,
        accepted: candidate.accepted,
        score: candidate.review.overall,
        reasonCodes: candidate.reasonCodes
      })),
      usedReviewedPoolFallback: reviewed.every((candidate) => !candidate.accepted)
    }
  });

  return {
    runId,
    provider: provider.metadata.name,
    model: provider.metadata.model,
    usedFallback,
    modelConfigured: selection.modelConfigured,
    sceneModel: output.sceneModel,
    candidates: accepted.slice(0, 6).map(toPublicCandidate),
    rejectedCount: rejected.length,
    notice
  };
}

async function runProvider(
  provider: HumorGenerationProvider,
  input: GenerateJokeRequest
): Promise<{ output: WriterOutput; judgment: JudgeOutput }> {
  const output = await provider.write(input);
  const judgment = await provider.judge(input, output);
  validateProviderResult(output, judgment);
  return { output, judgment };
}

function reviewCandidates(
  runId: string,
  output: WriterOutput,
  judgment: JudgeOutput,
  pool: CultureJoke[]
): ReviewedCandidate[] {
  const modelCritiques = new Map(judgment.critiques.map((critique) => [critique.candidateKey, critique]));
  const rank = new Map(judgment.rankedCandidateKeys.map((key, index) => [key, index]));
  const priorDrafts: OriginalJokeDraft[] = [];
  const acceptedMechanisms = new Set<string>();

  return output.candidates
    .map((plan, index) => {
      const draft = planToDraft(plan, runId, index);
      const local = runLocalCritics(draft, output.sceneModel);
      const model = modelCritiques.get(plan.candidateKey);
      const duplicate = findNearDuplicate(draft, [...pool, ...priorDrafts], 0.78);
      const repeatedMechanism = acceptedMechanisms.has(draft.mechanismId);
      const rawReasonCodes: CritiqueReasonCode[] = [
        ...local.critique.reasonCodes.filter((reason) => reason !== "PASS"),
        ...(model?.reasonCodes ?? []).filter((reason) => reason !== "PASS")
      ];
      if (duplicate) rawReasonCodes.push("NEAR_DUPLICATE");
      if (repeatedMechanism) rawReasonCodes.push("TEMPLATE_REUSE");
      const reasonCodes = unique(rawReasonCodes);
      const accepted =
        local.accepted &&
        model?.decision !== "reject" &&
        !duplicate &&
        !repeatedMechanism;
      const modelOverall = model?.overall ?? local.critique.overall;
      const combinedOverall = Math.round(local.critique.overall * 0.65 + modelOverall * 0.35);
      const review: Critique = {
        ...local.critique,
        overall: combinedOverall,
        decision: accepted ? "accept" : "reject",
        reasonCodes: reasonCodes.length === 0 ? ["PASS"] : reasonCodes
      };
      const joke = draftToCultureJoke(draft, local.qualityReview.scores, combinedOverall);

      priorDrafts.push(draft);
      if (accepted) {
        acceptedMechanisms.add(draft.mechanismId);
      }

      return {
        joke,
        draft,
        accepted,
        review,
        reasonCodes: review.reasonCodes,
        modelRank: rank.get(plan.candidateKey) ?? 99
      };
    })
    .sort((left, right) => left.modelRank - right.modelRank || right.review.overall - left.review.overall);
}

function validateProviderResult(output: WriterOutput, judgment: JudgeOutput): void {
  const candidateKeys = output.candidates.map((candidate) => candidate.candidateKey);
  const critiqueKeys = judgment.critiques.map((critique) => critique.candidateKey);
  const rankedKeys = judgment.rankedCandidateKeys;
  const mechanisms = new Set(output.candidates.map((candidate) => candidate.mechanismId));
  const expectedKeys = new Set(candidateKeys);
  const hasExactKeys =
    expectedKeys.size === candidateKeys.length &&
    new Set(critiqueKeys).size === expectedKeys.size &&
    new Set(rankedKeys).size === expectedKeys.size &&
    critiqueKeys.every((key) => expectedKeys.has(key)) &&
    rankedKeys.every((key) => expectedKeys.has(key));

  if (!hasExactKeys || mechanisms.size !== 8) {
    throw new HumorProviderError(
      "Provider output did not cover every candidate and humor mechanism exactly once",
      "MODEL_FORMAT"
    );
  }
}

function planToDraft(plan: PunchlinePlan, runId: string, index: number): OriginalJokeDraft {
  return {
    id: `gen_${runId.slice(-16)}_${index + 1}`,
    setup: plan.setup,
    punchline: plan.punchline,
    tag: plan.tag ?? undefined,
    mechanismId: plan.mechanismId,
    format: plan.format,
    topics: plan.topics,
    emotionalTruth: plan.emotionalTruth,
    expectedReading: plan.expectedReading,
    revealedReading: plan.revealedReading,
    emoji: plan.emoji,
    palette: plan.palette,
    editorialScore: 0
  };
}

function draftToCultureJoke(
  draft: OriginalJokeDraft,
  quality: CultureJoke["quality"],
  score: number
): CultureJoke {
  return {
    ...draft,
    editorialScore: score,
    label: getHumorMechanism(draft.mechanismId).shortLabel,
    score,
    quality: { ...quality, overall: score },
    fingerprint: createJokeFingerprint(draft)
  };
}

function fallbackCritique(joke: CultureJoke): Critique {
  return {
    candidateKey: joke.id,
    sceneFit: joke.quality.setupTrust,
    reversal: joke.quality.reversal,
    traceability: joke.quality.clarity,
    rhythm: joke.quality.rhythm,
    culturalTexture: joke.quality.specificity,
    safety: joke.quality.safety,
    overall: joke.score,
    decision: "accept",
    reasonCodes: ["PASS"]
  };
}

function toPublicCandidate(candidate: ReviewedCandidate): GeneratedJokeCandidate {
  const { sceneFit, reversal, traceability, rhythm, culturalTexture, overall, reasonCodes } =
    candidate.review;
  return {
    joke: candidate.joke,
    review: { sceneFit, reversal, traceability, rhythm, culturalTexture, overall, reasonCodes }
  };
}

async function failGenerationRun(
  runId: string,
  provider: HumorGenerationProvider,
  startedAt: number,
  error: unknown
): Promise<void> {
  await completeGenerationRun({
    id: runId,
    status: "failed",
    provider: provider.metadata.name,
    model: provider.metadata.model,
    candidateCount: 0,
    acceptedCount: 0,
    durationMs: Date.now() - startedAt,
    trace: { traceVersion: "public-reasons-v1" },
    errorCode: getProviderErrorCode(error)
  });
}

function getProviderErrorCode(error: unknown): string {
  return error instanceof HumorProviderError ? error.code : "PROVIDER_ERROR";
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
