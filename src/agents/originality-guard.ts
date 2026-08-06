import type { OriginalJokeDraft } from "../humor/types.js";

export interface DuplicateMatch {
  id: string;
  similarity: number;
  lexicalSimilarity: number;
  structuralSimilarity: number;
  reason: "lexical" | "structural";
}

export function findNearDuplicate(
  candidate: OriginalJokeDraft,
  accepted: OriginalJokeDraft[],
  threshold = 0.76
): DuplicateMatch | undefined {
  const candidateText = getFullText(candidate);
  const candidatePunchline = normalizeText(candidate.punchline);

  return accepted
    .map((joke) => {
      const fullSimilarity = ngramSimilarity(candidateText, getFullText(joke), 3);
      const punchlineSimilarity = ngramSimilarity(
        candidatePunchline,
        normalizeText(joke.punchline),
        2
      );
      const lexicalSimilarity = Math.max(fullSimilarity, punchlineSimilarity * 0.92);
      const structure = structureSimilarity(candidate, joke);
      const similarity = Math.max(lexicalSimilarity, structure);

      return {
        id: joke.id,
        similarity,
        lexicalSimilarity,
        structuralSimilarity: structure,
        reason: structure > lexicalSimilarity ? "structural" as const : "lexical" as const
      };
    })
    .filter((match) => match.similarity >= threshold)
    .sort((a, b) => b.similarity - a.similarity)[0];
}

export function findBatchNearDuplicates(
  candidates: OriginalJokeDraft[],
  threshold = 0.76
): Array<{ candidateId: string; match: DuplicateMatch }> {
  const accepted: OriginalJokeDraft[] = [];
  const duplicates: Array<{ candidateId: string; match: DuplicateMatch }> = [];

  for (const candidate of candidates) {
    const match = findNearDuplicate(candidate, accepted, threshold);
    if (match) {
      duplicates.push({ candidateId: candidate.id, match });
    } else {
      accepted.push(candidate);
    }
  }

  return duplicates;
}

export function structureSimilarity(
  left: OriginalJokeDraft,
  right: OriginalJokeDraft
): number {
  const expected = ngramSimilarity(left.expectedReading, right.expectedReading, 2);
  const revealed = ngramSimilarity(left.revealedReading, right.revealedReading, 2);
  const emotional = ngramSimilarity(left.emotionalTruth, right.emotionalTruth, 2);
  const mechanism = left.mechanismId === right.mechanismId ? 1 : 0;
  const format = left.format === right.format ? 1 : 0;

  return Number(
    (expected * 0.22 + revealed * 0.36 + emotional * 0.2 + mechanism * 0.16 + format * 0.06).toFixed(4)
  );
}

export function createJokeFingerprint(joke: OriginalJokeDraft): string {
  const text = `${getFullText(joke)}|${joke.mechanismId}`;
  let hash = 2166136261;

  for (const character of text) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0).toString(36);
}

export function ngramSimilarity(left: string, right: string, size: number): number {
  const leftGrams = createNgrams(normalizeText(left), size);
  const rightGrams = createNgrams(normalizeText(right), size);

  if (leftGrams.size === 0 || rightGrams.size === 0) {
    return left === right ? 1 : 0;
  }

  let intersection = 0;
  for (const gram of leftGrams) {
    if (rightGrams.has(gram)) {
      intersection += 1;
    }
  }

  const union = leftGrams.size + rightGrams.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function getFullText(joke: OriginalJokeDraft): string {
  return normalizeText([...joke.setup, joke.punchline, joke.tag ?? ""].join(""));
}

function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[\s，。！？；：“”‘’、,.!?;:'"()（）《》【】\[\]…—-]/g, "");
}

function createNgrams(text: string, size: number): Set<string> {
  const characters = [...text];
  if (characters.length < size) {
    return new Set(characters.length > 0 ? [characters.join("")] : []);
  }

  const grams = new Set<string>();
  for (let index = 0; index <= characters.length - size; index += 1) {
    grams.add(characters.slice(index, index + size).join(""));
  }
  return grams;
}
