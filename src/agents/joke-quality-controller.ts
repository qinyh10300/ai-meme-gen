import type {
  JokeQualityScores,
  OriginalJokeDraft
} from "../humor/types.js";
import { jokeQualityControllerThreshold } from "../settings.js";

const aiExplanationTerms = [
  "笑点在于",
  "幽默之处",
  "令人捧腹",
  "忍俊不禁",
  "非常搞笑",
  "巧妙反转"
];

const riskyTerms = [
  "死全家",
  "智障",
  "残疾人",
  "地域黑",
  "种族",
  "强奸",
  "恋童"
];

const concreteTerms = [
  "老板",
  "工资",
  "手机",
  "电池",
  "外卖",
  "椅子",
  "桌面",
  "文件",
  "会议",
  "信用卡",
  "招聘",
  "老师",
  "小朋友",
  "亲戚",
  "纸巾",
  "锅",
  "猫",
  "客服",
  "短信"
];

export interface JokeReview {
  accepted: boolean;
  scores: JokeQualityScores;
  reasons: string[];
}

export function reviewJoke(
  draft: OriginalJokeDraft,
  threshold = jokeQualityControllerThreshold
): JokeReview {
  const setupText = draft.setup.join("");
  const fullText = `${setupText}${draft.punchline}${draft.tag ?? ""}`;
  const setupLength = readableLength(setupText);
  const punchlineLength = readableLength(draft.punchline);
  const aiSmellCount = aiExplanationTerms.filter((term) => fullText.includes(term)).length;
  const riskCount = riskyTerms.filter((term) => fullText.includes(term)).length;
  const concreteCount = concreteTerms.filter((term) => fullText.includes(term)).length;
  const hasDialogue = /[“”]/.test(setupText);
  const interpretationsDiffer =
    normalize(draft.expectedReading) !== normalize(draft.revealedReading);

  const setupTrust = clamp(
    65 +
      (draft.setup.length >= 2 ? 9 : 4) +
      (hasDialogue ? 7 : 0) +
      Math.min(10, concreteCount * 2) +
      Math.round((draft.editorialScore - 80) * 0.35),
    40,
    98
  );
  const reversal = clamp(
    64 +
      (interpretationsDiffer ? 18 : 0) +
      (punchlineLength <= 28 ? 7 : 2) +
      Math.round((draft.editorialScore - 80) * 0.45) -
      aiSmellCount * 24,
    20,
    99
  );
  const clarity = clamp(
    92 -
      Math.max(0, setupLength - 100) * 0.35 -
      Math.max(0, punchlineLength - 36) * 1.2 -
      aiSmellCount * 18,
    35,
    97
  );
  const rhythm = clamp(
    72 +
      (draft.setup.length === 2 ? 10 : 5) +
      (punchlineLength >= 7 && punchlineLength <= 28 ? 12 : 3) -
      Math.max(0, setupLength - 88) * 0.25,
    40,
    98
  );
  const specificity = clamp(
    62 + Math.min(18, concreteCount * 4) + (hasDialogue ? 8 : 0) + (draft.topics.length >= 2 ? 6 : 0),
    40,
    96
  );
  const safety = clamp(98 - riskCount * 45, 5, 98);
  const overall = Math.round(
    setupTrust * 0.16 +
      reversal * 0.27 +
      clarity * 0.16 +
      rhythm * 0.16 +
      specificity * 0.1 +
      safety * 0.08 +
      draft.editorialScore * 0.07
  );

  const reasons: string[] = [];
  if (!interpretationsDiffer) reasons.push("预期理解和揭示理解没有形成有效错位");
  if (punchlineLength > 42) reasons.push("包袱过长");
  if (setupLength > 125) reasons.push("铺垫过长");
  if (aiSmellCount > 0) reasons.push("包含解释笑点的 AI 腔");
  if (riskCount > 0) reasons.push("包含高风险攻击性表达");
  if (overall < threshold) reasons.push(`综合分 ${overall} 低于门槛 ${threshold}`);

  return {
    accepted: reasons.length === 0,
    scores: {
      overall,
      setupTrust: Math.round(setupTrust),
      reversal: Math.round(reversal),
      clarity: Math.round(clarity),
      rhythm: Math.round(rhythm),
      specificity: Math.round(specificity),
      safety: Math.round(safety)
    },
    reasons
  };
}

function readableLength(text: string): number {
  return [...text.replace(/\s+/g, "")].length;
}

function normalize(text: string): string {
  return text.replace(/[\s，。！？；、“”‘’]/g, "");
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
