import { auditCultureJokeDeck } from "../pipeline/build-culture-joke-deck.js";

const audit = auditCultureJokeDeck();
const averageScore = Math.round(
  audit.accepted.reduce((sum, joke) => sum + joke.score, 0) /
    Math.max(1, audit.accepted.length)
);
const mechanisms = Object.fromEntries(
  [...new Set(audit.accepted.map((joke) => joke.mechanismId))].map((mechanismId) => [
    mechanismId,
    audit.accepted.filter((joke) => joke.mechanismId === mechanismId).length
  ])
);

console.log(
  JSON.stringify(
    {
      accepted: audit.accepted.length,
      rejected: audit.rejected.length,
      averageScore,
      mechanisms,
      rejectedItems: audit.rejected
    },
    null,
    2
  )
);

if (audit.rejected.length > 0) {
  process.exitCode = 1;
}
