import type { CultureJoke } from "../humor/types.js";
import type { FeedNextResponse } from "../platform/contracts.js";
import {
  getSessionFeedbackMemory,
  listFeedCandidates,
  recordImpression,
  type RankedRepositoryCandidate
} from "./joke-repository.js";

export async function getNextFeedJoke(input: {
  sessionId: string;
  currentId?: string | null;
  seenIds?: string[];
  random?: () => number;
}): Promise<FeedNextResponse> {
  const [candidates, session] = await Promise.all([
    listFeedCandidates(input.sessionId),
    getSessionFeedbackMemory(input.sessionId)
  ]);

  if (candidates.length === 0) {
    throw new Error("No published joke candidates are available.");
  }

  const random = input.random ?? Math.random;
  const seenIds = new Set(input.seenIds ?? []);
  const eligible = candidates.filter(
    (candidate) => candidate.joke.id !== input.currentId && !seenIds.has(candidate.joke.id)
  );
  const pool = eligible.length > 0
    ? eligible
    : candidates.filter((candidate) => candidate.joke.id !== input.currentId);
  const selectionPool = pool.length > 0 ? pool : candidates;
  const explore = random() < 0.1;
  const selected = explore
    ? selectionPool[Math.floor(random() * selectionPool.length)]
    : weightedPick(selectionPool, session.memory, input.currentId, random);

  await recordImpression({
    sessionId: input.sessionId,
    jokeId: selected.joke.id,
    surface: "feed",
    position: session.summary.total + 1
  });

  return {
    joke: selected.joke,
    session: session.summary,
    selection: explore
      ? "explore"
      : session.summary.total > 0
        ? "personalized"
        : "quality"
  };
}

export async function getComparisonPair(input: {
  sessionId: string;
  random?: () => number;
}): Promise<{ jokeA: CultureJoke; jokeB: CultureJoke }> {
  const candidates = await listFeedCandidates(input.sessionId);
  if (candidates.length < 2) {
    throw new Error("At least two candidates are required for comparison.");
  }

  const random = input.random ?? Math.random;
  const jokeA = candidates[Math.floor(random() * candidates.length)].joke;
  const distinctMechanisms = candidates.filter(
    (candidate) =>
      candidate.joke.id !== jokeA.id && candidate.joke.mechanismId !== jokeA.mechanismId
  );
  const secondPool = distinctMechanisms.length > 0
    ? distinctMechanisms
    : candidates.filter((candidate) => candidate.joke.id !== jokeA.id);
  const jokeB = secondPool[Math.floor(random() * secondPool.length)].joke;

  await Promise.all([
    recordImpression({ sessionId: input.sessionId, jokeId: jokeA.id, surface: "compare" }),
    recordImpression({ sessionId: input.sessionId, jokeId: jokeB.id, surface: "compare" })
  ]);

  return { jokeA, jokeB };
}

function weightedPick(
  candidates: RankedRepositoryCandidate[],
  memory: Awaited<ReturnType<typeof getSessionFeedbackMemory>>["memory"],
  currentId: string | null | undefined,
  random: () => number
): RankedRepositoryCandidate {
  const current = candidates.find((candidate) => candidate.joke.id === currentId)?.joke;
  const weighted = candidates.map((candidate) => {
    const joke = candidate.joke;
    const mechanismAffinity = memory.mechanismAffinity[joke.mechanismId] ?? 0;
    const formatAffinity = memory.formatAffinity[joke.format] ?? 0;
    const topicAffinity = average(joke.topics.map((topic) => memory.topicAffinity[topic] ?? 0));
    const globalRate = (candidate.globalFunny + 3) / (candidate.globalFeedback + 6);
    const qualityWeight = Math.max(5, joke.score - 70);
    const affinityWeight = clamp(
      1 + mechanismAffinity * 0.16 + formatAffinity * 0.09 + topicAffinity * 0.07,
      0.34,
      1.9
    );
    const globalWeight = 0.72 + globalRate * 0.56;
    const mechanismVariety = current?.mechanismId === joke.mechanismId ? 0.56 : 1;
    const topicVariety = current?.topics.some((topic) => joke.topics.includes(topic)) ? 0.76 : 1;

    return {
      candidate,
      weight: qualityWeight * affinityWeight * globalWeight * mechanismVariety * topicVariety
    };
  });

  const total = weighted.reduce((sum, item) => sum + item.weight, 0);
  let cursor = random() * total;
  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.candidate;
    }
  }

  return weighted.at(-1)?.candidate ?? candidates[0];
}

function average(values: number[]): number {
  return values.length === 0 ? 0 : values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
