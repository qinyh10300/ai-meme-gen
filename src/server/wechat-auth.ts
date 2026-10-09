import { env } from "cloudflare:workers";
import { getD1Binding } from "../../db/index.js";
import { ensureDatabaseSchema } from "../../db/runtime-schema.js";
import { ApiError } from "./http.js";
import { createId } from "./session.js";

const WECHAT_CODE_EXCHANGE_URL = "https://api.weixin.qq.com/sns/jscode2session";
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;

interface WechatCodeExchangeResponse {
  openid?: string;
  unionid?: string;
  errcode?: number;
  errmsg?: string;
}

export interface WechatLoginResult {
  token: string;
  expiresAt: string;
}

export async function loginWithWechat(code: string): Promise<WechatLoginResult> {
  const appId = env.WECHAT_APP_ID?.trim();
  const appSecret = env.WECHAT_APP_SECRET?.trim();
  if (!appId || !appSecret) {
    throw new ApiError(
      "微信登录尚未配置，请先使用开发体验模式。",
      503,
      "WECHAT_AUTH_NOT_CONFIGURED"
    );
  }

  const identity = await exchangeWechatCode({ appId, appSecret, code });
  await ensureDatabaseSchema();
  const db = getD1Binding();
  const openidHash = await hashCredential("openid", identity.openid);
  const unionidHash = identity.unionid
    ? await hashCredential("unionid", identity.unionid)
    : null;
  const proposedUserId = createId("wxu");

  await db
    .prepare(
      `INSERT INTO wechat_accounts (
        id, openid_hash, unionid_hash, created_at, last_login_at
      ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      ON CONFLICT(openid_hash) DO UPDATE SET
        unionid_hash = COALESCE(excluded.unionid_hash, wechat_accounts.unionid_hash),
        last_login_at = CURRENT_TIMESTAMP`
    )
    .bind(proposedUserId, openidHash, unionidHash)
    .run();

  const account = await db
    .prepare("SELECT id FROM wechat_accounts WHERE openid_hash = ? LIMIT 1")
    .bind(openidHash)
    .first<{ id: string }>();
  if (!account?.id) {
    throw new ApiError("微信账号绑定失败，请稍后重试。", 503, "AUTH_STORAGE_FAILED");
  }

  const token = createSessionToken();
  const tokenHash = await hashCredential("session", token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await db.batch([
    db
      .prepare(
        `INSERT INTO auth_sessions (
          token_hash, user_id, expires_at, created_at, last_seen_at
        ) VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(tokenHash, account.id, expiresAt),
    db
      .prepare(
        `DELETE FROM auth_sessions
         WHERE user_id = ? AND (expires_at <= ? OR revoked_at IS NOT NULL)`
      )
      .bind(account.id, new Date().toISOString())
  ]);

  return { token, expiresAt };
}

export async function resolveBearerUserId(request: Request): Promise<string | null> {
  const authorization = request.headers.get("Authorization");
  if (!authorization) return null;

  const match = /^Bearer\s+(wxt_[A-Za-z0-9_-]{32,96})$/.exec(authorization.trim());
  if (!match) {
    throw new ApiError("登录状态格式不正确，请重新登录。", 401, "INVALID_AUTH_TOKEN");
  }

  await ensureDatabaseSchema();
  const tokenHash = await hashCredential("session", match[1]);
  const now = new Date().toISOString();
  const session = await getD1Binding()
    .prepare(
      `SELECT user_id AS userId
       FROM auth_sessions
       WHERE token_hash = ?
         AND revoked_at IS NULL
         AND expires_at > ?
       LIMIT 1`
    )
    .bind(tokenHash, now)
    .first<{ userId: string }>();

  if (!session?.userId) {
    throw new ApiError("登录状态已过期，请重新登录。", 401, "AUTH_TOKEN_EXPIRED");
  }

  return session.userId;
}

async function exchangeWechatCode(input: {
  appId: string;
  appSecret: string;
  code: string;
}): Promise<{ openid: string; unionid?: string }> {
  const url = new URL(WECHAT_CODE_EXCHANGE_URL);
  url.searchParams.set("appid", input.appId);
  url.searchParams.set("secret", input.appSecret);
  url.searchParams.set("js_code", input.code);
  url.searchParams.set("grant_type", "authorization_code");

  let response: Response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(10_000) });
  } catch {
    throw new ApiError("微信登录服务暂时不可用，请稍后重试。", 502, "WECHAT_AUTH_UNAVAILABLE");
  }

  if (!response.ok) {
    throw new ApiError("微信登录服务暂时不可用，请稍后重试。", 502, "WECHAT_AUTH_UNAVAILABLE");
  }

  const payload = (await response.json()) as WechatCodeExchangeResponse;
  if (!payload.openid) {
    const invalidCode = payload.errcode === 40029 || payload.errcode === 40163;
    throw new ApiError(
      invalidCode ? "微信登录凭证已失效，请重新登录。" : "微信登录失败，请稍后重试。",
      invalidCode ? 401 : 502,
      invalidCode ? "WECHAT_CODE_INVALID" : "WECHAT_AUTH_FAILED"
    );
  }

  return { openid: payload.openid, unionid: payload.unionid };
}

function createSessionToken(): string {
  const random = `${crypto.randomUUID()}${crypto.randomUUID()}`.replaceAll("-", "");
  return `wxt_${random}`;
}

async function hashCredential(kind: "openid" | "unionid" | "session", value: string): Promise<string> {
  const bytes = new TextEncoder().encode(`memepop:wechat:v1:${kind}:${value}`);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
