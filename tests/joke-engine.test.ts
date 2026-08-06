import { describe, expect, it } from "vitest";
import {
  buildJokeDeck,
  chooseNextJoke,
  createFeedbackMemory,
  recordFeedback
} from "../src/web/joke-engine.js";
import { reviewJoke } from "../src/agents/joke-quality-controller.js";
import {
  findBatchNearDuplicates,
  findNearDuplicate,
  structureSimilarity
} from "../src/agents/originality-guard.js";
import { reviewContentSafety } from "../src/agents/content-safety.js";
import { originalJokeCorpus } from "../src/data/original-joke-corpus.js";
import { auditCultureJokeDeck } from "../src/pipeline/build-culture-joke-deck.js";
import { jokeQualityControllerThreshold } from "../src/settings.js";

describe("web joke engine", () => {
  it("builds a varied, reviewed deck with setup and punchline structure", () => {
    const deck = buildJokeDeck();

    expect(deck.length).toBeGreaterThanOrEqual(44);
    expect(new Set(deck.map((joke) => joke.mechanismId)).size).toBe(8);
    expect(deck.every((joke) => joke.emoji.length > 0)).toBe(true);
    expect(deck.every((joke) => joke.setup.length > 0 && joke.punchline.length > 0)).toBe(true);
    expect(
      deck.every((joke) => joke.score >= jokeQualityControllerThreshold)
    ).toBe(true);
  });

  it("learns mechanism, format, and topic preferences from a funny vote", () => {
    const joke = buildJokeDeck()[0];
    const memory = recordFeedback(createFeedbackMemory(), joke, "funny");

    expect(memory.total).toBe(1);
    expect(memory.funny).toBe(1);
    expect(memory.mechanismAffinity[joke.mechanismId]).toBeGreaterThan(0);
    expect(memory.formatAffinity[joke.format]).toBeGreaterThan(0);
    expect(memory.topicAffinity[joke.topics[0]]).toBeGreaterThan(0);
    expect(memory.seenIds).toContain(joke.id);
  });

  it("does not immediately repeat current or recently seen jokes", () => {
    const deck = buildJokeDeck();
    const current = deck[0];
    const memory = {
      ...createFeedbackMemory(),
      seenIds: deck.slice(1, 5).map((joke) => joke.id)
    };
    const next = chooseNextJoke(deck, current, memory, () => 0);

    expect(next.id).not.toBe(current.id);
    expect(memory.seenIds).not.toContain(next.id);
  });

  it("rejects explanatory AI-smelling copy", () => {
    const draft = {
      ...originalJokeCorpus[0],
      id: "ai-smell",
      punchline: "这个笑点在于巧妙反转，令人捧腹。"
    };
    const review = reviewJoke(draft);

    expect(review.accepted).toBe(false);
    expect(review.reasons).toContain("包含解释笑点的 AI 腔");
  });

  it("rejects a structurally flat joke even with a perfect editorial score", () => {
    const draft = {
      ...originalJokeCorpus[0],
      id: "flat-with-perfect-editorial-score",
      editorialScore: 100,
      expectedReading: "他真的需要别人帮忙",
      revealedReading: "他真的需要别人帮忙"
    };
    const review = reviewJoke(draft);

    expect(review.accepted).toBe(false);
    expect(review.reasons).toContain("预期理解和揭示理解没有形成有效错位");
  });

  it("does not let editorial score affect independent quality scores", () => {
    const draft = originalJokeCorpus[0];
    const lowEditorial = reviewJoke({ ...draft, editorialScore: 1 });
    const highEditorial = reviewJoke({ ...draft, editorialScore: 100 });

    expect(lowEditorial.scores).toEqual(highEditorial.scores);
    expect(lowEditorial.accepted).toBe(highEditorial.accepted);
  });

  it("catches copied or minimally changed corpus entries", () => {
    const original = originalJokeCorpus[0];
    const copied = { ...original, id: "copied" };
    const match = findNearDuplicate(copied, [original]);

    expect(match?.id).toBe(original.id);
    expect(match?.similarity).toBe(1);
  });

  it("catches structural rewrites even when surface wording changes", () => {
    const original = originalJokeCorpus[0];
    const structuralCopy = {
      ...original,
      id: "structural-copy",
      setup: ["路人拿着坏掉的袋子请我搭把手。"],
      punchline: "我就替他拿了五分钟。"
    };

    expect(structureSimilarity(structuralCopy, original)).toBeGreaterThan(0.75);
    expect(findBatchNearDuplicates([original, structuralCopy])).toHaveLength(1);
  });

  it("blocks identity attacks and real-harm text", () => {
    expect(reviewContentSafety("女人都不配学开车").safe).toBe(false);
    expect(reviewContentSafety("我准备写一份下毒方法").safe).toBe(false);
    expect(reviewContentSafety("小朋友说他不会跳舞").safe).toBe(true);
  });

  it("passes the full editorial corpus through both quality gates", () => {
    const audit = auditCultureJokeDeck();

    expect(audit.accepted).toHaveLength(originalJokeCorpus.length);
    expect(audit.rejected).toEqual([]);
  });
});
