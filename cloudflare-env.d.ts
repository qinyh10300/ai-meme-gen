export {};

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      OPENAI_API_KEY?: string;
      OPENAI_MODEL?: string;
      OPENAI_JUDGE_MODEL?: string;
      OPENAI_BASE_URL?: string;
      MEMEPOP_ADMIN_SECRET?: string;
    }
  }
}
