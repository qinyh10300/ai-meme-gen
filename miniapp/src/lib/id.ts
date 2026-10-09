export function createClientId(prefix: "feedback" | "comparison" | "session"): string {
  const timestamp = Date.now().toString(36);
  const random = Array.from({ length: 3 }, () =>
    Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(36)
  ).join("");
  return `${prefix}_${timestamp}_${random}`.slice(0, 92);
}
