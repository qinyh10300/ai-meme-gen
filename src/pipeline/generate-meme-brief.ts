import { analyzeScene } from "../agents/scene-analyzer.js";
import { rankPunchlines } from "../agents/humor-critic.js";
import { suggestMemeFormats } from "../agents/meme-director.js";
import { writePunchlines } from "../agents/punchline-writer.js";
import type { LifeSceneInput, MemeBrief } from "../types.js";

export function generateMemeBrief(input: LifeSceneInput): MemeBrief {
  if (!input.text.trim()) {
    throw new Error("Scene text is required.");
  }

  const normalizedInput: LifeSceneInput = {
    platform: "generic",
    tone: "dry",
    intensity: 3,
    ...input,
    text: input.text.trim()
  };

  const analysis = analyzeScene(normalizedInput);
  const punchlineDrafts = writePunchlines(analysis, normalizedInput);
  const punchlines = rankPunchlines(punchlineDrafts, analysis);
  const formatSuggestions = suggestMemeFormats(analysis, punchlines, normalizedInput);

  return {
    input: normalizedInput,
    analysis,
    punchlines,
    topPunchlines: punchlines.slice(0, 10),
    formatSuggestions,
    generatedAt: new Date().toISOString()
  };
}
