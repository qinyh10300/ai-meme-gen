import { describe, expect, it } from "vitest";
import { DeterministicHumorProvider } from "../src/generation/deterministic-provider.js";
import { runLocalCritics } from "../src/generation/local-critic.js";

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
});
