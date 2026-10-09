export {};

declare global {
  namespace Cloudflare {
    interface Env {
      DB: D1Database;
      OPENAI_API_KEY?: string;
      OPENAI_MODEL?: string;
      OPENAI_JUDGE_MODEL?: string;
      MEMEPOP_ADMIN_SECRET?: string;
      WECHAT_APP_ID?: string;
      WECHAT_APP_SECRET?: string;
    }
  }
}
