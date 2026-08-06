import type {
  LifeSceneAnalysis,
  PunchlineCandidate,
  PunchlineScores,
  RatedPunchlineCandidate
} from "../types.js";

const internetTextureTerms = [
  "体面",
  "人设",
  "社死",
  "破防",
  "精神",
  "灵魂",
  "撤回",
  "加载",
  "系统",
  "人生",
  "空气",
  "离线",
  "维护",
  "省电",
  "静音",
  "公开处刑",
  "下班",
  "松弛感",
  "心动",
  "手抖",
  "查无此人",
  "开卷考试",
  "工牌"
];

const contrastTerms = ["不是", "是", "但", "表面", "内心", "只是", "已经", "没有", "而是"];
const aiSmellTerms = ["真是", "令人难忘", "有趣", "搞笑", "幽默", "啼笑皆非", "让人捧腹"];
const riskyTerms = ["死全家", "残疾", "弱智", "智障", "滚", "歧视"];

export function rankPunchlines(
  candidates: PunchlineCandidate[],
  analysis: LifeSceneAnalysis
): RatedPunchlineCandidate[] {
  return candidates
    .map((candidate) => ratePunchline(candidate, analysis))
    .sort((a, b) => b.scores.overall - a.scores.overall);
}

export function ratePunchline(
  candidate: PunchlineCandidate,
  analysis: LifeSceneAnalysis
): RatedPunchlineCandidate {
  const scores = scorePunchline(candidate.text, analysis);
  const riskFlags = riskyTerms.filter((term) => candidate.text.includes(term));

  return {
    ...candidate,
    scores,
    critique: buildCritique(candidate.text, scores, riskFlags),
    riskFlags
  };
}

function scorePunchline(text: string, analysis: LifeSceneAnalysis): PunchlineScores {
  const length = countReadableChars(text);
  const hasContrast = contrastTerms.some((term) => text.includes(term));
  const hasMotif =
    text.includes(analysis.motifs.triggerObject) ||
    text.includes(analysis.motifs.fragileAsset) ||
    text.includes(analysis.motifs.stage);
  const hasPrivateTruthTexture = internetTextureTerms.some((term) => text.includes(term));
  const hasEmotion =
    analysis.hiddenEmotions.some((emotion) => text.includes(emotion)) ||
    analysis.socialStakes.some((stake) => text.includes(stake));
  const aiSmellCount = aiSmellTerms.filter((term) => text.includes(term)).length;
  const riskCount = riskyTerms.filter((term) => text.includes(term)).length;
  const contextEcho = contextEchoBonus(text, analysis.scene);
  const compactWordplay = length <= 18 && (text.includes("变") || text.includes("不是"));

  const concision = clamp(
    length <= 28 ? 90 - Math.max(0, length - 18) : 82 - Math.max(0, length - 28) * 2,
    30,
    96
  );
  const resonance = clamp(
    52 +
      (hasMotif ? 18 : 0) +
      (hasEmotion ? 12 : 0) +
      (hasPrivateTruthTexture ? 10 : 0) +
      contextEcho,
    35,
    96
  );
  const surprise = clamp(
    48 +
      (hasContrast ? 18 : 0) +
      (hasPrivateTruthTexture ? 10 : 0) +
      metaphorBonus(text) +
      (compactWordplay ? 16 : 0),
    30,
    95
  );
  const internetTexture = clamp(
    45 +
      internetTextureTerms.filter((term) => text.includes(term)).length * 8 +
      Math.round(contextEcho / 2) +
      (text.includes("建议") ? 5 : 0) +
      (text.includes("系统") ? 5 : 0) -
      aiSmellCount * 20,
    20,
    96
  );
  const safety = clamp(96 - riskCount * 35, 10, 96);

  const overall = Math.round(
    resonance * 0.28 +
      surprise * 0.24 +
      internetTexture * 0.22 +
      concision * 0.16 +
      safety * 0.1 -
      aiSmellCount * 8
  );

  return {
    overall: clamp(overall, 0, 100),
    resonance: Math.round(resonance),
    surprise: Math.round(surprise),
    internetTexture: Math.round(internetTexture),
    concision: Math.round(concision),
    safety: Math.round(safety)
  };
}

function contextEchoBonus(text: string, scene: string): number {
  const contextPairs: Array<{ sceneTerms: string[]; textTerms: string[]; bonus: number }> = [
    {
      sceneTerms: ["喜欢", "约会", "相亲"],
      textTerms: ["心动", "手抖", "松弛感", "人设"],
      bonus: 28
    },
    {
      sceneTerms: ["发错", "工作群", "撤回"],
      textTerms: ["撤回", "工牌", "勇气", "公开"],
      bonus: 28
    },
    {
      sceneTerms: ["周一", "上班", "闹钟"],
      textTerms: ["闹钟", "工位", "灵魂", "周日", "响应"],
      bonus: 16
    },
    {
      sceneTerms: ["下班", "老板", "需求", "甲方"],
      textTerms: ["收到", "下班", "查无此人", "精神离职"],
      bonus: 16
    },
    {
      sceneTerms: ["随便", "都行", "吃什么"],
      textTerms: ["随便", "开卷考试", "判错权"],
      bonus: 16
    },
    {
      sceneTerms: ["已读", "不回", "消息"],
      textTerms: ["已读", "省略", "手机", "期待"],
      bonus: 16
    }
  ];

  const hit = contextPairs.find(
    (pair) =>
      pair.sceneTerms.some((term) => scene.includes(term)) &&
      pair.textTerms.some((term) => text.includes(term))
  );

  return hit?.bonus ?? 0;
}

function buildCritique(text: string, scores: PunchlineScores, riskFlags: string[]): string {
  if (riskFlags.length > 0) {
    return `有风险词「${riskFlags.join("、")}」，先不要直接发。`;
  }

  if (scores.overall >= 82) {
    return "共鸣、转义和网感都比较强，适合作为主 punchline。";
  }

  if (scores.internetTexture < 55) {
    return "意思能懂，但中文互联网质感偏弱，可以再压缩得更像评论区。";
  }

  if (scores.concision < 60) {
    return "句子偏长，做图时建议拆成两行或只保留后半句。";
  }

  if (aiSmellTerms.some((term) => text.includes(term))) {
    return "有一点 AI 解释感，建议减少直接评价好笑的词。";
  }

  return "可用，但还可以加一点更具体的生活物件或更狠的转义。";
}

function metaphorBonus(text: string): number {
  const terms = ["电量", "系统", "代码", "模式", "申请", "绑定", "维护", "二次确认"];
  return Math.min(18, terms.filter((term) => text.includes(term)).length * 6);
}

function countReadableChars(text: string): number {
  return text.replace(/\s+/g, "").length;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
