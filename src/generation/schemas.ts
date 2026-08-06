import { z } from "zod";

export const humorMechanismIds = [
  "literal_obedience",
  "confidence_only",
  "context_reveal",
  "logic_overextension",
  "social_subtext",
  "commentary_tag",
  "bureaucratic_translation",
  "status_reversal"
] as const;

export const jokeFormatIds = ["story", "dialogue", "comment", "observation"] as const;
export const jokePaletteIds = ["lime", "coral", "blue", "yellow"] as const;

export const sceneModelSchema = z.object({
  scene: z.string().min(4).max(500),
  people: z
    .array(
      z.object({
        role: z.string().min(1).max(30),
        publicGoal: z.string().min(2).max(80),
        privateGoal: z.string().min(2).max(80)
      })
    )
    .min(1)
    .max(5),
  relationship: z.string().min(2).max(80),
  socialProtocol: z.string().min(2).max(100),
  publicMeaning: z.string().min(2).max(120),
  privateTruth: z.string().min(2).max(120),
  emotionalTensions: z.array(z.string().min(1).max(30)).min(1).max(6),
  culturalAnchors: z.array(z.string().min(1).max(40)).min(1).max(8),
  forbiddenDirections: z.array(z.string().min(1).max(80)).min(1).max(8)
});

export const punchlinePlanSchema = z.object({
  candidateKey: z.string().min(1).max(40),
  mechanismId: z.enum(humorMechanismIds),
  angle: z.string().min(2).max(80),
  setup: z.array(z.string().min(1).max(140)).min(1).max(3),
  punchline: z.string().min(3).max(90),
  tag: z.string().max(50).nullable(),
  format: z.enum(jokeFormatIds),
  topics: z.array(z.string().min(1).max(24)).min(1).max(5),
  emotionalTruth: z.string().min(4).max(120),
  expectedReading: z.string().min(4).max(120),
  revealedReading: z.string().min(4).max(120),
  emoji: z.string().min(1).max(12),
  palette: z.enum(jokePaletteIds)
});

export const writerOutputSchema = z.object({
  sceneModel: sceneModelSchema,
  candidates: z.array(punchlinePlanSchema).min(8).max(12)
});

export const critiqueReasonCodes = [
  "PASS",
  "SCENE_FIT_LOW",
  "REVERSAL_FLAT",
  "TRACEABILITY_LOW",
  "RHYTHM_SLOW",
  "CULTURE_GENERIC",
  "AI_SMELL",
  "STALE_SLANG",
  "TEMPLATE_REUSE",
  "NEAR_DUPLICATE",
  "SAFETY_RISK"
] as const;

export const critiqueSchema = z.object({
  candidateKey: z.string().min(1).max(40),
  sceneFit: z.number().int().min(0).max(100),
  reversal: z.number().int().min(0).max(100),
  traceability: z.number().int().min(0).max(100),
  rhythm: z.number().int().min(0).max(100),
  culturalTexture: z.number().int().min(0).max(100),
  safety: z.number().int().min(0).max(100),
  overall: z.number().int().min(0).max(100),
  decision: z.enum(["accept", "reject"]),
  reasonCodes: z.array(z.enum(critiqueReasonCodes)).min(1).max(6)
});

export const judgeOutputSchema = z.object({
  critiques: z.array(critiqueSchema).min(1).max(12),
  rankedCandidateKeys: z.array(z.string().min(1).max(40)).min(1).max(12)
});

export type SceneModel = z.infer<typeof sceneModelSchema>;
export type PunchlinePlan = z.infer<typeof punchlinePlanSchema>;
export type WriterOutput = z.infer<typeof writerOutputSchema>;
export type Critique = z.infer<typeof critiqueSchema>;
export type JudgeOutput = z.infer<typeof judgeOutputSchema>;
export type CritiqueReasonCode = (typeof critiqueReasonCodes)[number];
