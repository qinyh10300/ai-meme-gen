import { env } from "cloudflare:workers";
import { DeterministicHumorProvider } from "./deterministic-provider.js";
import { OpenAIHumorProvider } from "./openai-provider.js";
import type { HumorGenerationProvider } from "./provider.js";

export interface ProviderSelection {
  primary: HumorGenerationProvider;
  fallback: DeterministicHumorProvider;
  modelConfigured: boolean;
}

export function selectGenerationProvider(): ProviderSelection {
  const fallback = new DeterministicHumorProvider();
  const apiKey = env.OPENAI_API_KEY?.trim();

  if (!apiKey) {
    return { primary: fallback, fallback, modelConfigured: false };
  }

  const model = env.OPENAI_MODEL?.trim() || "gpt-5.6";
  const judgeModel = env.OPENAI_JUDGE_MODEL?.trim() || model;

  return {
    primary: new OpenAIHumorProvider({ apiKey, model, judgeModel }),
    fallback,
    modelConfigured: true
  };
}
