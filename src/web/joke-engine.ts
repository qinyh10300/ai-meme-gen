import { buildCultureJokeDeck } from "../pipeline/build-culture-joke-deck.js";
import type {
  CultureJoke,
  HumorMechanismId,
  JokeFormat
} from "../humor/types.js";

export type JokeVote = "funny" | "not_funny";
export type JokeCard = CultureJoke;

export interface FeedbackMemory {
  total: number;
  funny: number;
  mechanismAffinity: Partial<Record<HumorMechanismId, number>>;
  formatAffinity: Partial<Record<JokeFormat, number>>;
  topicAffinity: Partial<Record<string, number>>;
  seenIds: string[];
}

export function createFeedbackMemory(): FeedbackMemory {
  return {
    total: 0,
    funny: 0,
    mechanismAffinity: {},
    formatAffinity: {},
    topicAffinity: {},
    seenIds: []
  };
}

export function buildJokeDeck(): JokeCard[] {
  return buildCultureJokeDeck();
}

export function recordFeedback(
  memory: FeedbackMemory,
  joke: JokeCard,
  vote: JokeVote
): FeedbackMemory {
  const mechanismDelta = vote === "funny" ? 1 : -0.7;
  const formatDelta = vote === "funny" ? 0.55 : -0.35;
  const topicDelta = vote === "funny" ? 0.24 : -0.14;

  const topicAffinity = { ...memory.topicAffinity };
  for (const topic of joke.topics) {
    topicAffinity[topic] = clamp((topicAffinity[topic] ?? 0) + topicDelta, -2, 3);
  }

  return {
    total: memory.total + 1,
    funny: memory.funny + (vote === "funny" ? 1 : 0),
    mechanismAffinity: {
      ...memory.mechanismAffinity,
      [joke.mechanismId]: clamp(
        (memory.mechanismAffinity[joke.mechanismId] ?? 0) + mechanismDelta,
        -3,
        4
      )
    },
    formatAffinity: {
      ...memory.formatAffinity,
      [joke.format]: clamp(
        (memory.formatAffinity[joke.format] ?? 0) + formatDelta,
        -2,
        3
      )
    },
    topicAffinity,
    seenIds: [...memory.seenIds, joke.id].slice(-36)
  };
}

export function chooseNextJoke(
  deck: JokeCard[],
  current: JokeCard,
  memory: FeedbackMemory,
  random: () => number = Math.random
): JokeCard {
  const recentIds = new Set(memory.seenIds.slice(-20));
  let candidates = deck.filter(
    (joke) => joke.id !== current.id && !recentIds.has(joke.id)
  );

  if (candidates.length === 0) {
    candidates = deck.filter((joke) => joke.id !== current.id);
  }

  const weighted = candidates.map((joke) => {
    const qualityWeight = Math.max(5, joke.score - 74);
    const mechanismAffinity = memory.mechanismAffinity[joke.mechanismId] ?? 0;
    const formatAffinity = memory.formatAffinity[joke.format] ?? 0;
    const topicAffinity = average(
      joke.topics.map((topic) => memory.topicAffinity[topic] ?? 0)
    );
    const affinityWeight = clamp(
      1 + mechanismAffinity * 0.16 + formatAffinity * 0.09 + topicAffinity * 0.07,
      0.34,
      1.9
    );
    const mechanismVariety = joke.mechanismId === current.mechanismId ? 0.56 : 1;
    const topicOverlap = joke.topics.some((topic) => current.topics.includes(topic)) ? 0.76 : 1;

    return {
      joke,
      weight: qualityWeight * affinityWeight * mechanismVariety * topicOverlap
    };
  });

  const totalWeight = weighted.reduce((sum, item) => sum + item.weight, 0);
  let cursor = random() * totalWeight;

  for (const item of weighted) {
    cursor -= item.weight;
    if (cursor <= 0) {
      return item.joke;
    }
  }

  return weighted.at(-1)?.joke ?? current;
}

export function sanitizeFeedbackMemory(value: unknown): FeedbackMemory {
  if (!value || typeof value !== "object") {
    return createFeedbackMemory();
  }

  const candidate = value as Partial<FeedbackMemory>;
  return {
    total: isFiniteNumber(candidate.total) ? Math.max(0, candidate.total) : 0,
    funny: isFiniteNumber(candidate.funny) ? Math.max(0, candidate.funny) : 0,
    mechanismAffinity: sanitizeNumberMap(candidate.mechanismAffinity),
    formatAffinity: sanitizeNumberMap(candidate.formatAffinity),
    topicAffinity: sanitizeNumberMap(candidate.topicAffinity),
    seenIds: Array.isArray(candidate.seenIds)
      ? candidate.seenIds.filter((id): id is string => typeof id === "string").slice(-36)
      : []
  };
}

function sanitizeNumberMap<T extends string>(value: unknown): Partial<Record<T, number>> {
  if (!value || typeof value !== "object") {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).filter((entry): entry is [string, number] => isFiniteNumber(entry[1]))
  ) as Partial<Record<T, number>>;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
