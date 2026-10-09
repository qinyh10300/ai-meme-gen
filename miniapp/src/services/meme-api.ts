import { requestJson, type RequestIdentity } from "../lib/http";
import type {
  FeedbackReasonCode,
  FeedNextResponse,
  GenerateJokeResponse,
  JokeAudience,
  JokeTone,
  JokeVote
} from "../shared/contracts";

export function getNextJoke(
  identity: RequestIdentity,
  input: { currentId?: string | null; seenIds?: string[] }
): Promise<FeedNextResponse> {
  return requestJson<FeedNextResponse>("/api/feed/next", {
    method: "POST",
    data: input,
    identity
  });
}

export function saveFeedback(
  identity: RequestIdentity,
  input: {
    eventId: string;
    jokeId: string;
    vote: JokeVote;
    reasonCode?: FeedbackReasonCode;
    dwellMs: number;
  }
): Promise<{ saved: boolean; eventId: string }> {
  return requestJson("/api/feedback", {
    method: "POST",
    data: input,
    identity
  });
}

export function generateJokes(
  identity: RequestIdentity,
  input: { scene: string; audience: JokeAudience; tone: JokeTone }
): Promise<GenerateJokeResponse> {
  return requestJson<GenerateJokeResponse>("/api/generate/joke", {
    method: "POST",
    data: input,
    identity,
    timeout: 110000
  });
}
