import type { CultureJoke } from "../shared/contracts";

export function formatJoke(joke: CultureJoke): string {
  return [...joke.setup, joke.punchline, joke.tag ?? ""].filter(Boolean).join("\n") + ` ${joke.emoji}`;
}

export function compactShareTitle(joke: CultureJoke): string {
  const text = `${joke.punchline} ${joke.emoji}`;
  return [...text].slice(0, 34).join("");
}
