import { jokeQualityControllerThreshold } from "../settings.js";
import { reviewJoke } from "../agents/joke-quality-controller.js";
import {
  createJokeFingerprint,
  findNearDuplicate
} from "../agents/originality-guard.js";
import { getHumorMechanism } from "../data/culture-humor-patterns.js";
import { originalJokeCorpus } from "../data/original-joke-corpus.js";
import type { CultureJoke, OriginalJokeDraft } from "../humor/types.js";

export interface RejectedJoke {
  id: string;
  reasons: string[];
}

export interface CultureDeckAudit {
  accepted: CultureJoke[];
  rejected: RejectedJoke[];
}

export function auditCultureJokeDeck(): CultureDeckAudit {
  const acceptedDrafts: OriginalJokeDraft[] = [];
  const accepted: CultureJoke[] = [];
  const rejected: RejectedJoke[] = [];

  for (const draft of originalJokeCorpus) {
    const review = reviewJoke(draft, jokeQualityControllerThreshold);
    if (!review.accepted) {
      rejected.push({ id: draft.id, reasons: review.reasons });
      continue;
    }

    const duplicate = findNearDuplicate(draft, acceptedDrafts);
    if (duplicate) {
      rejected.push({
        id: draft.id,
        reasons: [`与 ${duplicate.id} 过于相似 (${duplicate.similarity.toFixed(2)})`]
      });
      continue;
    }

    const mechanism = getHumorMechanism(draft.mechanismId);
    acceptedDrafts.push(draft);
    accepted.push({
      ...draft,
      label: mechanism.shortLabel,
      score: review.scores.overall,
      quality: review.scores,
      fingerprint: createJokeFingerprint(draft)
    });
  }

  return { accepted, rejected };
}

export function buildCultureJokeDeck(): CultureJoke[] {
  return auditCultureJokeDeck().accepted;
}
