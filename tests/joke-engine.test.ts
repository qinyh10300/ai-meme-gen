import { describe, expect, it } from "vitest";
import {
  buildJokeDeck,
  chooseNextJoke,
  createFeedbackMemory,
  recordFeedback
} from "../src/web/joke-engine.js";

describe("web joke engine", () => {
  it("builds a varied emoji-decorated deck from the punchline pipeline", () => {
    const deck = buildJokeDeck();

    expect(deck.length).toBeGreaterThanOrEqual(30);
    expect(new Set(deck.map((joke) => joke.label)).size).toBeGreaterThanOrEqual(7);
    expect(deck.every((joke) => joke.emoji.length > 0)).toBe(true);
    expect(deck.every((joke) => joke.score >= 70)).toBe(true);
  });

  it("learns a preference for the operator behind a funny joke", () => {
    const joke = buildJokeDeck()[0];
    const memory = recordFeedback(createFeedbackMemory(), joke, "funny");

    expect(memory.total).toBe(1);
    expect(memory.funny).toBe(1);
    expect(memory.operatorAffinity[joke.operatorId]).toBeGreaterThan(0);
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
});
