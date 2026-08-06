import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { evaluateHumorSystem, parseHumorScenes } from "../evaluation/humor-evaluator.js";

const datasetPath = resolve(process.cwd(), "evals/humor-scenes.jsonl");
const scenes = parseHumorScenes(await readFile(datasetPath, "utf8"));
const report = evaluateHumorSystem(scenes);

console.log(JSON.stringify(report, null, 2));

if (!report.passed) {
  process.exitCode = 1;
}
