import { analyzeScene } from "../agents/scene-analyzer.js";
import { rankPunchlines } from "../agents/humor-critic.js";
import { writePunchlines } from "../agents/punchline-writer.js";
import type { HumorMechanismId, JokeFormat, JokePalette } from "../humor/types.js";
import type { GenerateJokeRequest } from "../platform/contracts.js";
import type { LifeSceneAnalysis, RatedPunchlineCandidate } from "../types.js";
import type { HumorGenerationProvider } from "./provider.js";
import {
  judgeOutputSchema,
  writerOutputSchema,
  type Critique,
  type PunchlinePlan,
  type SceneModel,
  type WriterOutput
} from "./schemas.js";

const mechanismOrder: HumorMechanismId[] = [
  "literal_obedience",
  "confidence_only",
  "context_reveal",
  "logic_overextension",
  "social_subtext",
  "commentary_tag",
  "bureaucratic_translation",
  "status_reversal"
];

const operatorMechanisms: Record<string, HumorMechanismId> = {
  blame_the_abstract: "literal_obedience",
  social_protocol_bug: "confidence_only",
  future_cancellation: "context_reveal",
  precise_measurement: "logic_overextension",
  inner_monologue: "social_subtext",
  understatement: "commentary_tag",
  fake_system_notice: "bureaucratic_translation",
  reverse_dignity: "status_reversal",
  object_transfer: "context_reveal",
  micro_rebellion: "status_reversal"
};

const mechanismAngles: Record<HumorMechanismId, string> = {
  literal_obedience: "把一句正常指令缩到最窄的字面意思",
  confidence_only: "事实不变，只把承认事实的态度升级",
  context_reveal: "在最后一拍补出改变前文含义的信息",
  logic_overextension: "沿着生活规则认真推到荒谬结论",
  social_subtext: "说出双方都懂但不会公开说的规则",
  commentary_tag: "像评论区一样用一行具体事实补刀",
  bureaucratic_translation: "把正式说法翻译成谁付出时间成本",
  status_reversal: "揭示真正掌握资源或规则的一方"
};

export class DeterministicHumorProvider implements HumorGenerationProvider {
  readonly metadata = {
    name: "deterministic" as const,
    model: null,
    promptVersion: "deterministic-v2"
  };

  async write(input: GenerateJokeRequest): Promise<WriterOutput> {
    const analysis = analyzeScene({ text: input.scene, audience: input.audience });
    const ranked = rankPunchlines(
      writePunchlines(analysis, { text: input.scene, audience: input.audience }),
      analysis
    );
    const sceneModel = toSceneModel(analysis);
    const candidates = mechanismOrder.map((mechanismId, index) =>
      toPlan(mechanismId, selectCandidate(ranked, mechanismId, index), analysis, input, index)
    );

    return writerOutputSchema.parse({ sceneModel, candidates });
  }

  async judge(_input: GenerateJokeRequest, output: WriterOutput) {
    const critiques: Critique[] = output.candidates.map((candidate) => {
      const length = [...candidate.punchline.replace(/\s+/g, "")].length;
      const rhythm = Math.max(62, Math.min(94, 98 - Math.max(0, length - 22) * 2));
      const traceability = candidate.expectedReading === candidate.revealedReading ? 35 : 88;
      const overall = Math.round(
        88 * 0.24 + 86 * 0.22 + traceability * 0.2 + rhythm * 0.14 + 80 * 0.12 + 98 * 0.08
      );

      return {
        candidateKey: candidate.candidateKey,
        sceneFit: 88,
        reversal: 86,
        traceability,
        rhythm,
        culturalTexture: 80,
        safety: 98,
        overall,
        decision: traceability >= 70 ? "accept" : "reject",
        reasonCodes: traceability >= 70 ? ["PASS"] : ["REVERSAL_FLAT"]
      };
    });

    return judgeOutputSchema.parse({
      critiques,
      rankedCandidateKeys: [...critiques]
        .sort((left, right) => right.overall - left.overall)
        .map((critique) => critique.candidateKey)
    });
  }
}

function toSceneModel(analysis: LifeSceneAnalysis): SceneModel {
  return {
    scene: analysis.scene,
    people: [
      {
        role: "当事人",
        publicGoal: analysis.publicMask,
        privateGoal: analysis.privateTruth
      },
      {
        role: analysis.motifs.authorityFigure,
        publicGoal: `维持${analysis.motifs.socialProtocol}`,
        privateGoal: "让现场按默认规则继续"
      }
    ],
    relationship: analysis.socialStakes.slice(0, 3).join("、"),
    socialProtocol: analysis.motifs.socialProtocol,
    publicMeaning: analysis.publicMask,
    privateTruth: analysis.privateTruth,
    emotionalTensions: analysis.hiddenEmotions,
    culturalAnchors: [
      analysis.motifs.triggerObject,
      analysis.motifs.stage,
      analysis.motifs.fragileAsset
    ],
    forbiddenDirections: ["解释笑点", "攻击身份", "照搬流行热梗"]
  };
}

function selectCandidate(
  candidates: RatedPunchlineCandidate[],
  mechanismId: HumorMechanismId,
  fallbackIndex: number
): RatedPunchlineCandidate {
  return (
    candidates.find((candidate) => operatorMechanisms[candidate.operatorId] === mechanismId) ??
    candidates[fallbackIndex % candidates.length]
  );
}

function toPlan(
  mechanismId: HumorMechanismId,
  candidate: RatedPunchlineCandidate,
  analysis: LifeSceneAnalysis,
  input: GenerateJokeRequest,
  index: number
): PunchlinePlan {
  const setup = buildSetup(mechanismId, compact(input.scene, 92), analysis);
  const punchline =
    mechanismId === "confidence_only"
      ? "事情一点没变，但我现在敢用肯定句承认它了。"
      : candidate.text;

  return {
    candidateKey: `local-${index + 1}`,
    mechanismId,
    angle: mechanismAngles[mechanismId],
    setup,
    punchline: compact(punchline, 88),
    tag: null,
    format: chooseFormat(mechanismId),
    topics: unique([analysis.motifs.stage, ...analysis.hiddenEmotions]).slice(0, 4),
    emotionalTruth: analysis.privateTruth,
    expectedReading: ensureReading(
      analysis.publicMask,
      `表面上只是处理${analysis.motifs.triggerObject}`
    ),
    revealedReading: `${mechanismAngles[mechanismId]}：${punchline}`,
    emoji: chooseEmoji(index),
    palette: choosePalette(index)
  };
}

function buildSetup(
  mechanismId: HumorMechanismId,
  scene: string,
  analysis: LifeSceneAnalysis
): string[] {
  if (mechanismId === "literal_obedience") {
    return [scene, `${analysis.motifs.authorityFigure}让我先处理一下。`];
  }
  if (mechanismId === "confidence_only") {
    return [scene, "朋友劝我：“自信一点。”"];
  }
  return [scene];
}

function chooseFormat(mechanismId: HumorMechanismId): JokeFormat {
  if (mechanismId === "confidence_only" || mechanismId === "literal_obedience") return "dialogue";
  if (mechanismId === "commentary_tag" || mechanismId === "social_subtext") return "comment";
  if (mechanismId === "logic_overextension") return "observation";
  return "story";
}

function chooseEmoji(index: number): string {
  return ["🙂", "😅", "🙃", "🤨", "🥲", "😶", "🫠", "👀"][index] ?? "🙂";
}

function choosePalette(index: number): JokePalette {
  return (["yellow", "coral", "blue", "lime"] as const)[index % 4];
}

function compact(text: string, max: number): string {
  const characters = [...text.trim()];
  return characters.length <= max ? text.trim() : `${characters.slice(0, max - 1).join("")}…`;
}

function unique(values: string[]): string[] {
  return [...new Set(values.filter(Boolean))];
}

function ensureReading(value: string, fallback: string): string {
  return [...value.trim()].length >= 4 ? value.trim() : fallback;
}
