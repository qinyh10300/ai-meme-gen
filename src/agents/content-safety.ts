export type SafetyRiskCategory =
  | "identity_attack"
  | "minor_safety"
  | "real_harm"
  | "explicit_content";

export interface SafetyFlag {
  category: SafetyRiskCategory;
  severity: "medium" | "high";
  reasonCode: string;
}

export interface ContentSafetyReview {
  safe: boolean;
  score: number;
  flags: SafetyFlag[];
}

const identityAttackTerms = ["地域黑", "种族低劣", "女人都", "男人都", "残疾人都", "同性恋都"];
const minorRiskPatterns = [/(小孩|儿童|未成年).{0,8}(色情|性行为|裸照)/, /(恋童|幼女色情)/];
const realHarmTerms = ["杀了你", "自杀教程", "下毒方法", "炸掉学校", "弄死他"];
const explicitTerms = ["强奸细节", "露骨性交", "色情描写"];

export function reviewContentSafety(text: string): ContentSafetyReview {
  const flags: SafetyFlag[] = [];

  if (identityAttackTerms.some((term) => text.includes(term))) {
    flags.push({ category: "identity_attack", severity: "high", reasonCode: "IDENTITY_ATTACK" });
  }
  if (minorRiskPatterns.some((pattern) => pattern.test(text))) {
    flags.push({ category: "minor_safety", severity: "high", reasonCode: "MINOR_SEXUALIZATION" });
  }
  if (realHarmTerms.some((term) => text.includes(term))) {
    flags.push({ category: "real_harm", severity: "high", reasonCode: "REAL_HARM" });
  }
  if (explicitTerms.some((term) => text.includes(term))) {
    flags.push({ category: "explicit_content", severity: "high", reasonCode: "EXPLICIT_CONTENT" });
  }

  return {
    safe: flags.length === 0,
    score: flags.length === 0 ? 100 : Math.max(0, 100 - flags.length * 55),
    flags
  };
}

export const copyQualityMarkers = {
  aiExplanation: ["笑点在于", "幽默之处", "令人捧腹", "忍俊不禁", "非常搞笑", "巧妙反转"],
  staleSlang: ["家人们谁懂啊", "绝绝子", "栓Q", "我真的会谢", "YYDS", "退退退"],
  templateReuse: ["表面：", "内心：建议重开", "不是我失误，是命运"]
} as const;

export function findCopyQualityMarkers(text: string): Array<{
  kind: keyof typeof copyQualityMarkers;
  term: string;
}> {
  return Object.entries(copyQualityMarkers).flatMap(([kind, terms]) =>
    terms
      .filter((term) => text.includes(term))
      .map((term) => ({ kind: kind as keyof typeof copyQualityMarkers, term }))
  );
}
