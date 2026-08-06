import { sessionIdSchema } from "./validation.js";

export async function hashSessionId(rawSessionId: string): Promise<string> {
  const sessionId = sessionIdSchema.parse(rawSessionId);
  const bytes = new TextEncoder().encode(`memepop:v1:${sessionId}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function createId(prefix: string): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}
