import { z } from "zod";
import {
  audienceOptions,
  feedbackReasonCodes,
  toneOptions
} from "../platform/contracts.js";

export const sessionIdSchema = z
  .string()
  .min(8)
  .max(96)
  .regex(/^[A-Za-z0-9_-]+$/, "sessionId contains unsupported characters");

export const eventIdSchema = z
  .string()
  .min(8)
  .max(96)
  .regex(/^[A-Za-z0-9_-]+$/, "event id contains unsupported characters");

export const feedNextRequestSchema = z.object({
  sessionId: sessionIdSchema,
  currentId: z.string().max(160).nullable().optional(),
  seenIds: z.array(z.string().max(160)).max(50).optional()
});

export const feedbackRequestSchema = z.object({
  eventId: eventIdSchema,
  sessionId: sessionIdSchema,
  jokeId: z.string().min(1).max(160),
  vote: z.enum(["funny", "not_funny"]),
  reasonCode: z.enum(feedbackReasonCodes).nullable().optional(),
  dwellMs: z.number().int().min(0).max(3_600_000).nullable().optional()
});

export const comparisonVoteSchema = z
  .object({
    comparisonId: eventIdSchema,
    sessionId: sessionIdSchema,
    jokeAId: z.string().min(1).max(160),
    jokeBId: z.string().min(1).max(160),
    winnerId: z.string().min(1).max(160),
    reasonCode: z.enum(feedbackReasonCodes).nullable().optional()
  })
  .refine(
    (value) => value.winnerId === value.jokeAId || value.winnerId === value.jokeBId,
    { message: "winnerId must match one of the compared jokes", path: ["winnerId"] }
  );

export const generateJokeRequestSchema = z.object({
  sessionId: sessionIdSchema,
  scene: z.string().trim().min(4).max(500),
  audience: z.enum(audienceOptions),
  tone: z.enum(toneOptions)
});
