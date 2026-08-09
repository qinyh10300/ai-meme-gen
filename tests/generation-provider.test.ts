import { describe, expect, it } from "vitest";
import { DeterministicHumorProvider } from "../src/generation/deterministic-provider.js";
import { runLocalCritics } from "../src/generation/local-critic.js";
import { selectCultureCards } from "../src/generation/openai-provider.js";
import type { CandidateRevision } from "../src/generation/provider.js";
import type { Critique } from "../src/generation/schemas.js";

function makeRevision(
  candidateKey: string,
  mechanismId: string,
  reasonCodes: Critique["reasonCodes"]
): CandidateRevision {
  return {
    candidateKey,
    mechanismId,
    reasonCodes,
    critique: {
      candidateKey,
      sceneFit: 88,
      reversal: 45,
      traceability: 35,
      rhythm: 70,
      culturalTexture: 80,
      safety: 98,
      overall: 62,
      decision: "reject",
      reasonCodes
    }
  };
}

describe("structured humor generation", () => {
  const input = {
    sessionId: "session_test_1234",
    scene: "把吐槽老板的话发错工作群了",
    audience: "年轻职场人" as const,
    tone: "冷面" as const
  };

  it("builds a scene model and eight mechanism-distinct candidates", async () => {
    const provider = new DeterministicHumorProvider();
    const output = await provider.write(input);
    const judgment = await provider.judge(input, output);

    expect(output.sceneModel.privateTruth).toContain("未来");
    expect(output.candidates).toHaveLength(8);
    expect(new Set(output.candidates.map((candidate) => candidate.mechanismId)).size).toBe(8);
    expect(judgment.rankedCandidateKeys).toHaveLength(8);
  });

  it("runs independent scene, reversal, rhythm, culture and safety critics", async () => {
    const provider = new DeterministicHumorProvider();
    const output = await provider.write(input);
    const candidate = output.candidates[0];
    const review = runLocalCritics(
      {
        id: candidate.candidateKey,
        setup: candidate.setup,
        punchline: candidate.punchline,
        tag: candidate.tag ?? undefined,
        mechanismId: candidate.mechanismId,
        format: candidate.format,
        topics: candidate.topics,
        emotionalTruth: candidate.emotionalTruth,
        expectedReading: candidate.expectedReading,
        revealedReading: candidate.revealedReading,
        emoji: candidate.emoji,
        palette: candidate.palette,
        editorialScore: 100
      },
      output.sceneModel
    );

    expect(review.critique.sceneFit).toBeGreaterThanOrEqual(62);
    expect(review.critique.safety).toBe(100);
    expect(review.qualityReview.scores.overall).toBeGreaterThan(0);
  });

  it("revises only the failing candidates and keeps the rest unchanged", async () => {
    const provider = new DeterministicHumorProvider();
    const output = await provider.write(input);
    const failingIndexes = [2, 4];
    const revisions = failingIndexes.map((index) =>
      makeRevision(
        output.candidates[index].candidateKey,
        output.candidates[index].mechanismId,
        ["REVERSAL_FLAT", "TRACEABILITY_LOW"]
      )
    );

    const revised = await provider.revise(input, output, revisions);

    expect(revised).not.toBeNull();
    expect(revised!.candidates).toHaveLength(8);
    expect(new Set(revised!.candidates.map((candidate) => candidate.mechanismId)).size).toBe(8);
    for (const index of failingIndexes) {
      expect(revised!.candidates[index].candidateKey).toBe(output.candidates[index].candidateKey);
      expect(revised!.candidates[index].punchline).not.toBe(output.candidates[index].punchline);
    }
    expect(revised!.candidates[0].punchline).toBe(output.candidates[0].punchline);
    expect(revised!.candidates[1].punchline).toBe(output.candidates[1].punchline);
  });

  it("returns null when a candidate has no alternative variant to try", async () => {
    const provider = new DeterministicHumorProvider();
    const output = await provider.write(input);
    const confidenceCandidate = output.candidates.find(
      (candidate) => candidate.mechanismId === "confidence_only"
    );
    expect(confidenceCandidate).toBeDefined();

    const revised = await provider.revise(input, output, [
      makeRevision(confidenceCandidate!.candidateKey, "confidence_only", ["RHYTHM_SLOW"])
    ]);

    expect(revised).toBeNull();
  });

  it("selects culture cards that match the scene", () => {
    const cards = selectCultureCards(
      "下班前老板说只占用五分钟，五分钟后他开始共享一份四十页文档",
      "年轻职场人"
    );

    expect(cards.length).toBeGreaterThan(0);
    expect(cards.some((card) => card.id === "card-work-late-task")).toBe(true);
  });
});
