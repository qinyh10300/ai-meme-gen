#!/usr/bin/env node
import { generateMemeBrief } from "./pipeline/generate-meme-brief.js";
import type { LifeSceneInput, Platform, Tone } from "./types.js";

const platformOptions: Platform[] = ["wechat", "weibo", "xiaohongshu", "bilibili", "douyin", "generic"];
const toneOptions: Tone[] = ["dry", "self_mocking", "awkward", "absurd", "workplace", "soft"];

function main(): void {
  const args = process.argv.slice(2);

  if (args.includes("--help") || args.length === 0) {
    printHelp();
    return;
  }

  const { input, asJson } = parseArgs(args);
  const brief = generateMemeBrief(input);

  if (asJson) {
    console.log(JSON.stringify(brief, null, 2));
    return;
  }

  console.log(formatBriefAsMarkdown(brief));
}

function parseArgs(args: string[]): { input: LifeSceneInput; asJson: boolean } {
  const sceneParts: string[] = [];
  let platform: Platform | undefined;
  let tone: Tone | undefined;
  let audience: string | undefined;
  let asJson = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--json") {
      asJson = true;
      continue;
    }

    if (arg === "--platform") {
      const value = args[index + 1] as Platform | undefined;
      if (!value || !platformOptions.includes(value)) {
        throw new Error(`--platform must be one of: ${platformOptions.join(", ")}`);
      }
      platform = value;
      index += 1;
      continue;
    }

    if (arg === "--tone") {
      const value = args[index + 1] as Tone | undefined;
      if (!value || !toneOptions.includes(value)) {
        throw new Error(`--tone must be one of: ${toneOptions.join(", ")}`);
      }
      tone = value;
      index += 1;
      continue;
    }

    if (arg === "--audience") {
      const value = args[index + 1];
      if (!value) {
        throw new Error("--audience requires a value.");
      }
      audience = value;
      index += 1;
      continue;
    }

    sceneParts.push(arg);
  }

  const text = sceneParts.join(" ").trim();
  if (!text) {
    throw new Error("Please provide a life scene, e.g. npm run meme -- \"周一早上上班\"");
  }

  return {
    input: { text, platform, tone, audience },
    asJson
  };
}

function formatBriefAsMarkdown(brief: ReturnType<typeof generateMemeBrief>): string {
  const { analysis } = brief;
  const lines: string[] = [];

  lines.push(`# MemePop Brief`);
  lines.push("");
  lines.push(`输入：${brief.input.text}`);
  lines.push(`平台：${brief.input.platform ?? "generic"}  语气：${brief.input.tone ?? "dry"}`);
  lines.push("");
  lines.push(`## 生活语境`);
  lines.push(`- 表面事件：${analysis.surfaceEvent}`);
  lines.push(`- 社交压力：${analysis.socialStakes.join(" / ")}`);
  lines.push(`- 隐藏情绪：${analysis.hiddenEmotions.join(" / ")}`);
  lines.push(`- 体面面具：${analysis.publicMask}`);
  lines.push(`- 情绪真相：${analysis.privateTruth}`);
  lines.push(`- 喜剧张力：${analysis.comicTension}`);
  lines.push("");
  lines.push(`## Top Punchlines`);

  brief.topPunchlines.slice(0, 10).forEach((candidate, index) => {
    lines.push(
      `${index + 1}. ${candidate.text}  ` +
        `(${candidate.scores.overall}/100，${candidate.operatorName})`
    );
    lines.push(`   - 为什么成立：${candidate.whyItWorks}`);
    lines.push(`   - 评审：${candidate.critique}`);
  });

  lines.push("");
  lines.push(`## 梗图方案`);
  brief.formatSuggestions.forEach((suggestion, index) => {
    lines.push(`${index + 1}. ${suggestion.format.name}`);
    lines.push(`   - 主文案：${suggestion.primaryCaption}`);
    lines.push(`   - 原因：${suggestion.reason}`);
    lines.push(`   - 排版：${suggestion.layoutNotes.join(" ")}`);
  });

  return lines.join("\n");
}

function printHelp(): void {
  console.log(`MemePop CLI

Usage:
  npm run meme -- "周一早上上班"
  npm run meme -- "发错工作群" --platform wechat --tone awkward
  npm run meme -- "老板临下班改需求" --json

Options:
  --platform   ${platformOptions.join(" | ")}
  --tone       ${toneOptions.join(" | ")}
  --audience   Optional target audience
  --json       Print structured JSON
`);
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
