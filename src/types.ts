export type Platform =
  | "wechat"
  | "weibo"
  | "xiaohongshu"
  | "bilibili"
  | "douyin"
  | "generic";

export type Tone =
  | "dry"
  | "self_mocking"
  | "awkward"
  | "absurd"
  | "workplace"
  | "soft";

export interface LifeSceneInput {
  text: string;
  platform?: Platform;
  tone?: Tone;
  audience?: string;
  intensity?: 1 | 2 | 3 | 4 | 5;
}

export interface SceneMotifs {
  triggerObject: string;
  fragileAsset: string;
  imaginedEscape: string;
  publicAction: string;
  authorityFigure: string;
  stage: string;
  socialProtocol: string;
}

export interface TensionPair {
  surface: string;
  truth: string;
}

export interface LifeSceneAnalysis {
  scene: string;
  surfaceEvent: string;
  socialStakes: string[];
  hiddenEmotions: string[];
  publicMask: string;
  privateTruth: string;
  sharedMemory: string;
  comicTension: string;
  motifs: SceneMotifs;
  tensionPairs: TensionPair[];
  matchedSignals: string[];
}

export interface PunchlineOperator {
  id: string;
  name: string;
  description: string;
  bestFor: string[];
}

export interface PunchlineCandidate {
  id: string;
  text: string;
  operatorId: string;
  operatorName: string;
  mechanism: string;
  whyItWorks: string;
}

export interface PunchlineScores {
  overall: number;
  resonance: number;
  surprise: number;
  internetTexture: number;
  concision: number;
  safety: number;
}

export interface RatedPunchlineCandidate extends PunchlineCandidate {
  scores: PunchlineScores;
  critique: string;
  riskFlags: string[];
}

export interface MemeFormat {
  id: string;
  name: string;
  bestForOperators: string[];
  platformFit: Platform[];
  description: string;
  layoutBrief: string;
  textSlots: string[];
}

export interface MemeFormatSuggestion {
  format: MemeFormat;
  reason: string;
  primaryCaption: string;
  layoutNotes: string[];
}

export interface MemeBrief {
  input: LifeSceneInput;
  analysis: LifeSceneAnalysis;
  punchlines: RatedPunchlineCandidate[];
  topPunchlines: RatedPunchlineCandidate[];
  formatSuggestions: MemeFormatSuggestion[];
  generatedAt: string;
}
