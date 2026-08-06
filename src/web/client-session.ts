const SESSION_STORAGE_KEY = "memepop-session-v1";

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
}

export function getOrCreateClientSession(
  storage: StorageLike,
  randomUuid: () => string
): string {
  const stored = storage.getItem(SESSION_STORAGE_KEY);
  if (stored && /^[A-Za-z0-9_-]{8,96}$/.test(stored)) {
    return stored;
  }

  const sessionId = `web_${randomUuid().replaceAll("-", "")}`;
  storage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function createClientEventId(prefix: "feedback" | "comparison"): string {
  return `${prefix}_${crypto.randomUUID().replaceAll("-", "")}`;
}
