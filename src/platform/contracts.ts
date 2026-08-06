import type { CultureJoke } from "../humor/types.js";
import type { Critique, SceneModel } from "../generation/schemas.js";

export const feedbackReasonOptions = {
  funny: [
    { code: "REAL_LIFE", label: "太真实了" },
    { code: "CLEVER_TURN", label: "拐得妙" },
    { code: "SHARE_WORTHY", label: "想转发" }
  ],
  not_funny: [
    { code: "AI_SMELL", label: "太像 AI" },
    { code: "STALE", label: "太老了" },
    { code: "CONFUSING", label: "没看懂" },
    { code: "FORCED", label: "太硬拗" },
    { code: "NOT_RELATABLE", label: "不贴生活" },
    { code: "SLOW", label: "节奏慢" },
    { code: "OFFENSIVE", label: "有点冒犯" },
    { code: "TOO_SIMILAR", label: "像抄的" }
  ]
} as const;

export const feedbackReasonCodes = [
  "REAL_LIFE",
  "CLEVER_TURN",
  "SHARE_WORTHY",
  "AI_SMELL",
  "STALE",
  "CONFUSING",
  "FORCED",
  "NOT_RELATABLE",
  "SLOW",
  "OFFENSIVE",
  "TOO_SIMILAR"
] as const;

export type JokeVote = keyof typeof feedbackReasonOptions;
export type FeedbackReasonCode = (typeof feedbackReasonCodes)[number];

export const audienceOptions = ["通用", "年轻职场人", "大学生", "情侣", "朋友群聊"] as const;
export type JokeAudience = (typeof audienceOptions)[number];

export const toneOptions = ["冷面", "生活流", "轻微冒犯", "温和自嘲"] as const;
export type JokeTone = (typeof toneOptions)[number];

export interface FeedNextRequest {
  sessionId: string;
  currentId?: string | null;
  seenIds?: string[];
}

export interface FeedSessionSummary {
  total: number;
  funny: number;
  funnyRate: number;
}

export interface FeedNextResponse {
  joke: CultureJoke;
  session: FeedSessionSummary;
  selection: "quality" | "personalized" | "explore" | "fallback";
}

export interface FeedbackRequest {
  eventId: string;
  sessionId: string;
  jokeId: string;
  vote: JokeVote;
  reasonCode?: FeedbackReasonCode | null;
  dwellMs?: number | null;
}

export interface ComparisonPair {
  comparisonId: string;
  jokeA: CultureJoke;
  jokeB: CultureJoke;
}

export interface ComparisonVoteRequest {
  comparisonId: string;
  sessionId: string;
  jokeAId: string;
  jokeBId: string;
  winnerId: string;
  reasonCode?: FeedbackReasonCode | null;
}

export interface GenerateJokeRequest {
  sessionId: string;
  scene: string;
  audience: JokeAudience;
  tone: JokeTone;
}

export interface GeneratedJokeCandidate {
  joke: CultureJoke;
  review: Pick<
    Critique,
    | "sceneFit"
    | "reversal"
    | "traceability"
    | "rhythm"
    | "culturalTexture"
    | "overall"
    | "reasonCodes"
  >;
}

export interface GenerateJokeResponse {
  runId: string;
  provider: "deterministic" | "openai";
  model: string | null;
  usedFallback: boolean;
  modelConfigured: boolean;
  sceneModel: SceneModel;
  candidates: GeneratedJokeCandidate[];
  rejectedCount: number;
  notice: string | null;
}

export interface HumorLabMetrics {
  overview: {
    impressions: number;
    feedback: number;
    funny: number;
    funnyRate: number;
    comparisons: number;
  };
  pool: {
    published: number;
    private: number;
    rejected: number;
    averagePublishedScore: number;
  };
  feedbackReasons: Array<{
    reasonCode: FeedbackReasonCode;
    count: number;
  }>;
  mechanisms: Array<{
    mechanismId: string;
    label: string;
    feedback: number;
    funny: number;
    funnyRate: number;
    averageQuality: number;
  }>;
  generation: {
    runs: number;
    successRate: number;
    averageDurationMs: number;
    acceptedRate: number;
    providers: Array<{ provider: string; runs: number }>;
  };
  updatedAt: string;
}
