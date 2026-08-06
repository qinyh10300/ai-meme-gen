import { describe, expect, it } from "vitest";
import { ratePunchline } from "../src/agents/humor-critic.js";
import { analyzeScene } from "../src/agents/scene-analyzer.js";
import { generateMemeBrief } from "../src/pipeline/generate-meme-brief.js";

describe("generateMemeBrief", () => {
  it("generates a structured brief with ranked punchlines", () => {
    const brief = generateMemeBrief({ text: "第一次和喜欢的人吃饭，把饮料洒了" });

    expect(brief.analysis.privateTruth).toContain("人设");
    expect(brief.punchlines.length).toBeGreaterThanOrEqual(20);
    expect(brief.topPunchlines).toHaveLength(10);
    expect(brief.formatSuggestions.length).toBeGreaterThanOrEqual(1);
    expect(brief.punchlines[0].scores.overall).toBeGreaterThanOrEqual(
      brief.punchlines[1].scores.overall
    );
  });

  it("captures Chinese internet social awkwardness in known scenes", () => {
    const brief = generateMemeBrief({ text: "把吐槽老板的话发错工作群了", platform: "wechat" });

    expect(brief.analysis.hiddenEmotions).toEqual(expect.arrayContaining(["社死"]));
    expect(brief.analysis.comicTension).toContain("假装没看见");
    expect(brief.topPunchlines.map((item) => item.text).join("\n")).toMatch(/撤回|公开|体面|未来/);
  });

  it("penalizes generic AI-smelling copy", () => {
    const analysis = analyzeScene({ text: "周一早上上班" });
    const good = ratePunchline(
      {
        id: "good",
        text: "身体打卡成功，灵魂还在周日晚上加载。",
        operatorId: "inner_monologue",
        operatorName: "内心旁白",
        mechanism: "表面和内心错位。",
        whyItWorks: "抓住周一上班的灵魂迟到。"
      },
      analysis
    );
    const bland = ratePunchline(
      {
        id: "bland",
        text: "周一上班真是令人难忘又非常搞笑。",
        operatorId: "inner_monologue",
        operatorName: "内心旁白",
        mechanism: "直接评价。",
        whyItWorks: "直接说搞笑。"
      },
      analysis
    );

    expect(good.scores.overall).toBeGreaterThan(bland.scores.overall);
  });
});
