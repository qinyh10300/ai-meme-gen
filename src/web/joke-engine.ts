import { generateMemeBrief } from "../pipeline/generate-meme-brief.js";
import type { Tone } from "../types.js";

export type JokePalette = "lime" | "coral" | "blue" | "yellow";
export type JokeVote = "funny" | "not_funny";

interface SceneSeed {
  id: string;
  text: string;
  label: string;
  tone: Tone;
  emojis: string[];
  palette: JokePalette;
}

export interface JokeCard {
  id: string;
  text: string;
  emoji: string;
  scene: string;
  label: string;
  palette: JokePalette;
  operatorId: string;
  score: number;
}

export interface FeedbackMemory {
  total: number;
  funny: number;
  operatorAffinity: Record<string, number>;
  seenIds: string[];
}

const sceneSeeds: SceneSeed[] = [
  {
    id: "date-spill",
    text: "第一次和喜欢的人吃饭，一紧张把饮料洒了",
    label: "暧昧翻车",
    tone: "awkward",
    emojis: ["💘🥤", "😳💦", "🫠🥤", "🫣💘"],
    palette: "coral"
  },
  {
    id: "wrong-group",
    text: "把吐槽老板的话发错工作群了",
    label: "社死现场",
    tone: "awkward",
    emojis: ["📱😨", "🫥💼", "🚨📲", "😶‍🌫️🔥"],
    palette: "blue"
  },
  {
    id: "monday",
    text: "周一早上闹钟响了又要上班",
    label: "周一开机",
    tone: "workplace",
    emojis: ["⏰🫠", "☕️😵", "🪫💼", "😮‍💨📎"],
    palette: "lime"
  },
  {
    id: "late-request",
    text: "老板在下班前一分钟发来一句需求再改改",
    label: "打工文学",
    tone: "workplace",
    emojis: ["💼💔", "🕕🫥", "📎😮‍💨", "🧑‍💻🪦"],
    palette: "yellow"
  },
  {
    id: "casual-choice",
    text: "问对象吃什么，对方说随便都行",
    label: "潜台词考试",
    tone: "dry",
    emojis: ["🍜📝", "🙂❓", "🥘🫣", "🧠🍽️"],
    palette: "coral"
  },
  {
    id: "seen-no-reply",
    text: "给在意的人发消息，对方已读不回",
    label: "消息焦虑",
    tone: "self_mocking",
    emojis: ["📱👀", "🫠💬", "🔕🥲", "🧠📲"],
    palette: "blue"
  },
  {
    id: "new-year",
    text: "过年被亲戚轮流问工资对象和买房",
    label: "人生答辩",
    tone: "dry",
    emojis: ["🧧🫠", "🍊📋", "🙂‍↕️🧨", "🏠❓"],
    palette: "yellow"
  },
  {
    id: "gym-day-one",
    text: "办完健身卡第一天，热身五分钟就想回家",
    label: "自律观察期",
    tone: "self_mocking",
    emojis: ["🏋️‍♀️🫠", "💪🍗", "🏃‍♂️🛋️", "📅😮‍💨"],
    palette: "lime"
  }
];

export function createFeedbackMemory(): FeedbackMemory {
  return {
    total: 0,
    funny: 0,
    operatorAffinity: {},
    seenIds: []
  };
}

export function buildJokeDeck(): JokeCard[] {
  const seenText = new Set<string>();

  return sceneSeeds.flatMap((seed) => {
    const brief = generateMemeBrief({
      text: seed.text,
      platform: "generic",
      tone: seed.tone
    });

    return brief.punchlines
      .filter((candidate) => candidate.riskFlags.length === 0 && candidate.scores.overall >= 70)
      .slice(0, 7)
      .flatMap((candidate, index) => {
        if (seenText.has(candidate.text)) {
          return [];
        }

        seenText.add(candidate.text);
        return [
          {
            id: `${seed.id}-${candidate.id}`,
            text: candidate.text,
            emoji: seed.emojis[index % seed.emojis.length],
            scene: seed.text,
            label: seed.label,
            palette: seed.palette,
            operatorId: candidate.operatorId,
            score: candidate.scores.overall
          }
        ];
      });
  });
}

export function recordFeedback(
  memory: FeedbackMemory,
  joke: JokeCard,
  vote: JokeVote
): FeedbackMemory {
  const affinityDelta = vote === "funny" ? 1 : -0.65;
  const previousAffinity = memory.operatorAffinity[joke.operatorId] ?? 0;

  return {
    total: memory.total + 1,
    funny: memory.funny + (vote === "funny" ? 1 : 0),
    operatorAffinity: {
      ...memory.operatorAffinity,
      [joke.operatorId]: clamp(previousAffinity + affinityDelta, -3, 4)
    },
    seenIds: [...memory.seenIds, joke.id].slice(-28)
  };
}

export function chooseNextJoke(
  deck: JokeCard[],
  current: JokeCard,
  memory: FeedbackMemory,
  random: () => number = Math.random
): JokeCard {
  const recentIds = new Set(memory.seenIds.slice(-16));
  let candidates = deck.filter(
    (joke) => joke.id !== current.id && !recentIds.has(joke.id)
  );

  if (candidates.length === 0) {
    candidates = deck.filter((joke) => joke.id !== current.id);
  }

  const weighted = candidates.map((joke) => {
    const qualityWeight = Math.max(3, joke.score - 64);
    const affinity = memory.operatorAffinity[joke.operatorId] ?? 0;
    const affinityWeight = clamp(1 + affinity * 0.16, 0.38, 1.75);
    const sceneVariety = joke.label === current.label ? 0.45 : 1;

    return {
      joke,
      weight: qualityWeight * affinityWeight * sceneVariety
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
    total: typeof candidate.total === "number" ? Math.max(0, candidate.total) : 0,
    funny: typeof candidate.funny === "number" ? Math.max(0, candidate.funny) : 0,
    operatorAffinity:
      candidate.operatorAffinity && typeof candidate.operatorAffinity === "object"
        ? candidate.operatorAffinity
        : {},
    seenIds: Array.isArray(candidate.seenIds)
      ? candidate.seenIds.filter((id): id is string => typeof id === "string").slice(-28)
      : []
  };
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
