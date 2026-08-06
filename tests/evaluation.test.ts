import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateHumorSystem, parseHumorScenes } from "../src/evaluation/humor-evaluator.js";

describe("humor evaluation baseline", () => {
  const dataset = readFileSync(resolve(process.cwd(), "evals/humor-scenes.jsonl"), "utf8");

  it("validates the 100-scene Chinese life benchmark", () => {
    const scenes = parseHumorScenes(dataset);

    expect(scenes).toHaveLength(100);
    expect(new Set(scenes.map((scene) => scene.category)).size).toBeGreaterThanOrEqual(7);
  });

  it("passes all repeatable baseline checks", () => {
    const report = evaluateHumorSystem(parseHumorScenes(dataset));

    expect(report.checks.filter((check) => !check.passed)).toEqual([]);
    expect(report.passed).toBe(true);
  });
});
