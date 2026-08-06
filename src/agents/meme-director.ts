import { memeFormats } from "../data/meme-formats.js";
import type {
  LifeSceneAnalysis,
  LifeSceneInput,
  MemeFormat,
  MemeFormatSuggestion,
  Platform,
  RatedPunchlineCandidate
} from "../types.js";

export function suggestMemeFormats(
  analysis: LifeSceneAnalysis,
  punchlines: RatedPunchlineCandidate[],
  input: LifeSceneInput
): MemeFormatSuggestion[] {
  const platform = input.platform ?? "generic";
  const topPunchlines = punchlines.slice(0, 5);
  const isWorkScene = detectWorkScene(analysis);

  return memeFormats
    .filter((format) => format.id !== "workplace_dialogue" || isWorkScene)
    .map((format) => ({
      format,
      score: scoreFormat(format, topPunchlines, platform, analysis, isWorkScene)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ format }) => buildSuggestion(format, analysis, pickPunchlineForFormat(format, topPunchlines)));
}

function scoreFormat(
  format: MemeFormat,
  punchlines: RatedPunchlineCandidate[],
  platform: Platform,
  analysis: LifeSceneAnalysis,
  isWorkScene: boolean
): number {
  const operatorFit = punchlines.reduce(
    (sum, punchline) =>
      sum + (format.bestForOperators.includes(punchline.operatorId) ? punchline.scores.overall : 0),
    0
  );
  const platformFit = format.platformFit.includes(platform) ? 30 : 0;
  const workplaceFit =
    format.id === "workplace_dialogue" && isWorkScene ? 45 : 0;
  const chatFit =
    format.id === "chat_screenshot" && analysis.motifs.stage.includes("聊天") ? 35 : 0;
  const fourPanelFit =
    format.id === "four_panel_micro_story" && analysis.hiddenEmotions.includes("羞耻") ? 30 : 0;

  return operatorFit + platformFit + workplaceFit + chatFit + fourPanelFit;
}

function detectWorkScene(analysis: LifeSceneAnalysis): boolean {
  return (
    analysis.hiddenEmotions.includes("打工疲惫") ||
    analysis.motifs.stage.includes("工位") ||
    analysis.motifs.stage.includes("工作群")
  );
}

function pickPunchlineForFormat(
  format: MemeFormat,
  punchlines: RatedPunchlineCandidate[]
): RatedPunchlineCandidate {
  return (
    punchlines.find((punchline) => format.bestForOperators.includes(punchline.operatorId)) ??
    punchlines[0]
  );
}

function buildSuggestion(
  format: MemeFormat,
  analysis: LifeSceneAnalysis,
  punchline: RatedPunchlineCandidate
): MemeFormatSuggestion {
  return {
    format,
    reason: `${format.name}适合「${punchline.operatorName}」：${punchline.mechanism}`,
    primaryCaption: punchline.text,
    layoutNotes: [
      format.layoutBrief,
      `视觉重点放在「${analysis.motifs.stage}」和「${analysis.motifs.triggerObject}」的冲突上。`,
      `不要解释笑点，最后一个文字槽只放 punchline。`
    ]
  };
}
