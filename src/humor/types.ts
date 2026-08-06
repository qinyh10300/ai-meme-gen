export type JokePalette = "lime" | "coral" | "blue" | "yellow";

export type JokeFormat = "story" | "dialogue" | "comment" | "observation";

export type HumorMechanismId =
  | "literal_obedience"
  | "confidence_only"
  | "context_reveal"
  | "logic_overextension"
  | "social_subtext"
  | "commentary_tag"
  | "bureaucratic_translation"
  | "status_reversal";

export interface HumorSourceSignal {
  id: string;
  name: string;
  sourceUrl: string;
  sourceType: "platform" | "research";
  observedSignals: string[];
  usageBoundary: string;
}

export interface HumorMechanism {
  id: HumorMechanismId;
  name: string;
  shortLabel: string;
  expectedMove: string;
  revealMove: string;
  writingRules: string[];
  avoid: string[];
  sourceSignalIds: string[];
}

export interface OriginalJokeDraft {
  id: string;
  setup: string[];
  punchline: string;
  tag?: string;
  mechanismId: HumorMechanismId;
  format: JokeFormat;
  topics: string[];
  emotionalTruth: string;
  expectedReading: string;
  revealedReading: string;
  emoji: string;
  palette: JokePalette;
  editorialScore: number;
}

export interface JokeQualityScores {
  overall: number;
  setupTrust: number;
  reversal: number;
  clarity: number;
  rhythm: number;
  specificity: number;
  safety: number;
}

export interface CultureJoke extends OriginalJokeDraft {
  label: string;
  score: number;
  quality: JokeQualityScores;
  fingerprint: string;
}
