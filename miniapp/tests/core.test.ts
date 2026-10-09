import { describe, expect, it } from "vitest";
import { createClientId } from "../src/lib/id";
import { compactShareTitle, formatJoke } from "../src/lib/joke-text";

const joke = {
  id: "test-joke",
  setup: ["第一行", "第二行"],
  punchline: "这是包袱。",
  tag: "#测试",
  emoji: "🙂"
};

describe("mini program core helpers", () => {
  it("creates request ids accepted by the server contract", () => {
    const first = createClientId("feedback");
    const second = createClientId("feedback");

    expect(first).toMatch(/^feedback_[A-Za-z0-9_]+$/);
    expect(first.length).toBeLessThanOrEqual(92);
    expect(second).not.toBe(first);
  });

  it("formats copied jokes without losing setup, tag or emoji", () => {
    expect(formatJoke(joke as Parameters<typeof formatJoke>[0])).toBe(
      "第一行\n第二行\n这是包袱。\n#测试 🙂"
    );
  });

  it("keeps share titles within the WeChat-friendly character budget", () => {
    const longJoke = { ...joke, punchline: "很长的结尾".repeat(20) };
    expect([
      ...compactShareTitle(longJoke as Parameters<typeof compactShareTitle>[0])
    ]).toHaveLength(34);
  });
});
