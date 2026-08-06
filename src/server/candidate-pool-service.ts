import { cultureCardSeeds } from "../data/culture-cards.js";
import type { JokeAudience, JokeTone } from "../platform/contracts.js";
import { generateJokes } from "./generation-service.js";
import { getCandidatePoolStats, recordRuntimeMetric } from "./joke-repository.js";

export interface ReplenishmentResult {
  before: number;
  after: number;
  target: number;
  runs: number;
  added: number;
  reachedTarget: boolean;
}

export async function replenishCandidatePool(options: {
  targetPublished?: number;
  maxRuns?: number;
} = {}): Promise<ReplenishmentResult> {
  const target = clamp(options.targetPublished ?? 80, 48, 500);
  const maxRuns = clamp(options.maxRuns ?? 3, 1, 12);
  const beforeStats = await getCandidatePoolStats();
  let current = beforeStats.published;
  let runs = 0;

  while (current < target && runs < maxRuns) {
    const cardIndex = (current + runs * 3) % cultureCardSeeds.length;
    const card = cultureCardSeeds[cardIndex];
    await generateJokes(
      {
        sessionId: "system_replenisher",
        scene: card.context,
        audience: card.audience as JokeAudience,
        tone: card.tone as JokeTone
      },
      { acceptedStatus: "published", source: "replenishment", skipRateLimit: true }
    );
    runs += 1;
    current = (await getCandidatePoolStats()).published;
  }

  const result: ReplenishmentResult = {
    before: beforeStats.published,
    after: current,
    target,
    runs,
    added: current - beforeStats.published,
    reachedTarget: current >= target
  };
  await recordRuntimeMetric({
    name: "candidate_pool_replenishment",
    value: result.added,
    dimensions: { runs, reachedTarget: result.reachedTarget, target }
  });

  return result;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, Math.round(value)));
}
