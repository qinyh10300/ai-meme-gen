import { z } from "zod";
import { auditCultureJokeDeck } from "../pipeline/build-culture-joke-deck.js";
import { generateMemeBrief } from "../pipeline/generate-meme-brief.js";
import { baselineV1Manifest } from "./baseline-v1.js";

const categorySchema = z.enum([
  "职场",
  "家庭",
  "恋爱",
  "校园",
  "朋友",
  "消费服务",
  "社交媒体",
  "日常自我"
]);

const mechanismSchema = z.enum([
  "literal_obedience",
  "confidence_only",
  "context_reveal",
  "logic_overextension",
  "social_subtext",
  "commentary_tag",
  "bureaucratic_translation",
  "status_reversal"
]);

export const humorSceneSchema = z.object({
  id: z.string().min(3),
  category: categorySchema,
  scene: z.string().min(8).max(120),
  relationship: z.array(z.string().min(1)).min(1),
  emotions: z.array(z.string().min(1)).min(1),
  expectedMechanisms: z.array(mechanismSchema).min(1),
  avoid: z.array(z.string().min(1)).min(1)
});

export type HumorScene = z.infer<typeof humorSceneSchema>;

export interface HumorEvaluationReport {
  passed: boolean;
  checks: Array<{ name: string; passed: boolean; actual: number; expected: string }>;
  dataset: {
    scenes: number;
    categories: number;
    uniqueSceneRate: number;
    annotationCompletionRate: number;
  };
  baseline: {
    version: string;
    accepted: number;
    rejected: number;
    averageScore: number;
    uniqueTextRate: number;
    mechanismCount: number;
    aiSmellRate: number;
    riskRate: number;
  };
  deterministicGeneration: {
    candidates: number;
    uniqueTextRate: number;
    operatorCount: number;
    aiSmellRate: number;
    riskRate: number;
  };
}

const aiSmellTerms = ["笑点在于", "幽默之处", "令人捧腹", "忍俊不禁", "非常搞笑", "巧妙反转"];
const riskTerms = ["死全家", "智障", "残疾人", "地域黑", "种族", "强奸", "恋童"];

export function parseHumorScenes(jsonl: string): HumorScene[] {
  return jsonl
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      try {
        return humorSceneSchema.parse(JSON.parse(line));
      } catch (error) {
        throw new Error(`黄金集第 ${index + 1} 行无效`, { cause: error });
      }
    });
}

export function evaluateHumorSystem(scenes: HumorScene[]): HumorEvaluationReport {
  const audit = auditCultureJokeDeck();
  const baselineTexts = audit.accepted.map((joke) =>
    normalizeText([...joke.setup, joke.punchline, joke.tag ?? ""].join(""))
  );
  const generated = scenes.flatMap((scene) =>
    generateMemeBrief({ text: scene.scene }).topPunchlines
  );
  const generatedTexts = generated.map((item) => normalizeText(item.text));
  const annotationComplete = scenes.filter(
    (scene) =>
      scene.relationship.length > 0 &&
      scene.emotions.length > 0 &&
      scene.expectedMechanisms.length > 0 &&
      scene.avoid.length > 0
  ).length;
  const baselineIds = audit.accepted.map((joke) => joke.id);
  const baselineManifestMatches =
    baselineIds.length === baselineV1Manifest.ids.length &&
    baselineIds.every((id, index) => id === baselineV1Manifest.ids[index]);

  const dataset = {
    scenes: scenes.length,
    categories: new Set(scenes.map((scene) => scene.category)).size,
    uniqueSceneRate: rateUnique(scenes.map((scene) => normalizeText(scene.scene))),
    annotationCompletionRate: ratio(annotationComplete, scenes.length)
  };
  const baseline = {
    version: baselineV1Manifest.version,
    accepted: audit.accepted.length,
    rejected: audit.rejected.length,
    averageScore: average(audit.accepted.map((joke) => joke.score)),
    uniqueTextRate: rateUnique(baselineTexts),
    mechanismCount: new Set(audit.accepted.map((joke) => joke.mechanismId)).size,
    aiSmellRate: termRate(baselineTexts, aiSmellTerms),
    riskRate: termRate(baselineTexts, riskTerms)
  };
  const deterministicGeneration = {
    candidates: generated.length,
    uniqueTextRate: rateUnique(generatedTexts),
    operatorCount: new Set(generated.map((item) => item.operatorId)).size,
    aiSmellRate: termRate(generatedTexts, aiSmellTerms),
    riskRate: termRate(generatedTexts, riskTerms)
  };

  const checks = [
    check("黄金集恰好 100 条", dataset.scenes, "= 100", dataset.scenes === 100),
    check("黄金集场景不重复", dataset.uniqueSceneRate, "= 1", dataset.uniqueSceneRate === 1),
    check("覆盖至少七类生活场景", dataset.categories, ">= 7", dataset.categories >= 7),
    check(
      "黄金集标注完整",
      dataset.annotationCompletionRate,
      "= 1",
      dataset.annotationCompletionRate === 1
    ),
    check(
      "baseline-v1 清单未漂移",
      baselineManifestMatches ? 1 : 0,
      "= 1",
      baselineManifestMatches
    ),
    check(
      "baseline-v1 全部通过独立门禁",
      baseline.accepted,
      `= ${baselineV1Manifest.expectedCount}`,
      baseline.accepted === baselineV1Manifest.expectedCount && baseline.rejected === 0
    ),
    check("baseline-v1 文案不重复", baseline.uniqueTextRate, "= 1", baseline.uniqueTextRate === 1),
    check("baseline-v1 覆盖八种机制", baseline.mechanismCount, "= 8", baseline.mechanismCount === 8),
    check("baseline-v1 无 AI 解释腔", baseline.aiSmellRate, "= 0", baseline.aiSmellRate === 0),
    check("baseline-v1 无高风险词", baseline.riskRate, "= 0", baseline.riskRate === 0),
    check(
      "确定性生成结构完整",
      deterministicGeneration.candidates,
      `= ${scenes.length * 10}`,
      deterministicGeneration.candidates === scenes.length * 10
    ),
    check(
      "确定性生成具备机制多样性",
      deterministicGeneration.operatorCount,
      ">= 8",
      deterministicGeneration.operatorCount >= 8
    ),
    check(
      "确定性生成无 AI 解释腔",
      deterministicGeneration.aiSmellRate,
      "= 0",
      deterministicGeneration.aiSmellRate === 0
    ),
    check("确定性生成无高风险词", deterministicGeneration.riskRate, "= 0", deterministicGeneration.riskRate === 0)
  ];

  return {
    passed: checks.every((item) => item.passed),
    checks,
    dataset,
    baseline,
    deterministicGeneration
  };
}

function check(name: string, actual: number, expected: string, passed: boolean) {
  return { name, actual, expected, passed };
}

function normalizeText(text: string): string {
  return text.toLowerCase().replace(/[\s，。！？；：“”‘’、,.!?;:'"()（）《》【】\[\]…—-]/g, "");
}

function termRate(texts: string[], terms: string[]): number {
  return ratio(texts.filter((text) => terms.some((term) => text.includes(term))).length, texts.length);
}

function rateUnique(values: string[]): number {
  return ratio(new Set(values).size, values.length);
}

function ratio(value: number, total: number): number {
  return total === 0 ? 0 : Number((value / total).toFixed(4));
}

function average(values: number[]): number {
  return values.length === 0
    ? 0
    : Number((values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2));
}
