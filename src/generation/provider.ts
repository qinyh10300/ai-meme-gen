import type { GenerateJokeRequest } from "../platform/contracts.js";
import type { JudgeOutput, WriterOutput } from "./schemas.js";

export interface HumorProviderMetadata {
  name: "deterministic" | "openai";
  model: string | null;
  promptVersion: string;
}

export interface HumorGenerationProvider {
  readonly metadata: HumorProviderMetadata;
  write(input: GenerateJokeRequest): Promise<WriterOutput>;
  judge(input: GenerateJokeRequest, output: WriterOutput): Promise<JudgeOutput>;
}

export class HumorProviderError extends Error {
  constructor(
    message: string,
    readonly code: "MODEL_REFUSAL" | "MODEL_TIMEOUT" | "MODEL_FORMAT" | "MODEL_UNAVAILABLE"
  ) {
    super(message);
  }
}
