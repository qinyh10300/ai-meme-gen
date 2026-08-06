import { findCopyQualityMarkers, reviewContentSafety } from "../agents/content-safety.js";
import { reviewJoke } from "../agents/joke-quality-controller.js";
import type { OriginalJokeDraft } from "../humor/types.js";
import type { Critique, CritiqueReasonCode, SceneModel } from "./schemas.js";

export interface LocalCriticResult {
  accepted: boolean;
  critique: Critique;
  qualityReview: ReturnType<typeof reviewJoke>;
  safetyReview: ReturnType<typeof reviewContentSafety>;
  markerTerms: string[];
}

export function runLocalCritics(
  draft: OriginalJokeDraft,
  sceneModel: SceneModel
): LocalCriticResult {
  const fullText = [...draft.setup, draft.punchline, draft.tag ?? ""].join("");
  const qualityReview = reviewJoke(draft);
  const safetyReview = reviewContentSafety(fullText);
  const markers = findCopyQualityMarkers(fullText);
  const severeMarkers = markers.filter((marker) => marker.kind !== "templateReuse");
  const sceneFit = scoreSceneFit(fullText, sceneModel);
  const traceability = scoreTraceability(draft);
  const culturalTexture = Math.round(
    qualityReview.scores.specificity * 0.65 + Math.min(100, sceneModel.culturalAnchors.length * 18) * 0.35
  );
  const reasonCodes: CritiqueReasonCode[] = [];

  if (sceneFit < 62) reasonCodes.push("SCENE_FIT_LOW");
  if (qualityReview.scores.reversal < 70) reasonCodes.push("REVERSAL_FLAT");
  if (traceability < 65) reasonCodes.push("TRACEABILITY_LOW");
  if (qualityReview.scores.rhythm < 68) reasonCodes.push("RHYTHM_SLOW");
  if (culturalTexture < 58) reasonCodes.push("CULTURE_GENERIC");
  if (markers.some((marker) => marker.kind === "aiExplanation")) reasonCodes.push("AI_SMELL");
  if (markers.some((marker) => marker.kind === "staleSlang")) reasonCodes.push("STALE_SLANG");
  if (markers.some((marker) => marker.kind === "templateReuse")) reasonCodes.push("TEMPLATE_REUSE");
  if (!safetyReview.safe) reasonCodes.push("SAFETY_RISK");

  const overall = Math.round(
    sceneFit * 0.22 +
      qualityReview.scores.reversal * 0.22 +
      traceability * 0.18 +
      qualityReview.scores.rhythm * 0.14 +
      culturalTexture * 0.14 +
      safetyReview.score * 0.1
  );
  const blockingReasons = reasonCodes.filter((reason) => reason !== "TEMPLATE_REUSE");
  const accepted =
    qualityReview.accepted &&
    safetyReview.safe &&
    severeMarkers.length === 0 &&
    sceneFit >= 62 &&
    traceability >= 65 &&
    overall >= 74;

  return {
    accepted,
    critique: {
      candidateKey: draft.id,
      sceneFit,
      reversal: qualityReview.scores.reversal,
      traceability,
      rhythm: qualityReview.scores.rhythm,
      culturalTexture,
      safety: safetyReview.score,
      overall,
      decision: accepted ? "accept" : "reject",
      reasonCodes: blockingReasons.length === 0 ? ["PASS"] : unique(blockingReasons)
    },
    qualityReview,
    safetyReview,
    markerTerms: markers.map((marker) => marker.term)
  };
}

function scoreSceneFit(text: string, scene: SceneModel): number {
  const anchors = [scene.scene, ...scene.culturalAnchors]
    .flatMap((value) => splitUsefulTerms(value))
    .filter((term) => term.length >= 2);
  const hitCount = new Set(anchors.filter((term) => text.includes(term))).size;
  const exactScene = text.includes(scene.scene) ? 26 : 0;

  return clamp(52 + exactScene + Math.min(22, hitCount * 5), 0, 98);
}

function scoreTraceability(draft: OriginalJokeDraft): number {
  const differs = normalize(draft.expectedReading) !== normalize(draft.revealedReading);
  const punchlineInReveal = draft.revealedReading.includes(draft.punchline.slice(0, 8));
  return clamp(45 + (differs ? 30 : 0) + (punchlineInReveal ? 13 : 4), 0, 96);
}

function splitUsefulTerms(text: string): string[] {
  return text.split(/[\s，。！？；：、“”‘’、,.!?;:'"()（）《》【】\[\]…—-]+/).filter(Boolean);
}

function normalize(text: string): string {
  return text.replace(/[\s，。！？；：“”‘’、]/g, "");
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
