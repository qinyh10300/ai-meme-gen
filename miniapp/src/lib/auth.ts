import Taro from "@tarojs/taro";
import { createClientId } from "./id";
import { getApiBaseUrl, requestJson, type RequestIdentity } from "./http";
import {
  MOCK_SESSION_STORAGE_KEY,
  WECHAT_SESSION_STORAGE_KEY,
  readStorage,
  removeStorage,
  writeStorage
} from "./storage";

export type AuthSession =
  | {
      mode: "mock";
      sessionId: string;
    }
  | {
      mode: "wechat";
      token: string;
      expiresAt: string;
    };

interface WechatAuthResponse {
  token: string;
  expiresAt: string;
}

export async function initializeAuth(force = false): Promise<AuthSession> {
  const mode = process.env.TARO_APP_AUTH_MODE === "wechat" ? "wechat" : "mock";
  if (mode === "mock") return initializeMockSession(force);
  return initializeWechatSession(force);
}

export function toRequestIdentity(session: AuthSession): RequestIdentity {
  return session.mode === "wechat"
    ? { token: session.token }
    : { sessionId: session.sessionId };
}

function initializeMockSession(force: boolean): AuthSession {
  if (!force) {
    const stored = readStorage<string>(MOCK_SESSION_STORAGE_KEY);
    if (stored && /^[A-Za-z0-9_-]{8,96}$/.test(stored)) {
      return { mode: "mock", sessionId: stored };
    }
  }

  const sessionId = `mp_dev_${createClientId("session").replaceAll("-", "_")}`.slice(0, 92);
  writeStorage(MOCK_SESSION_STORAGE_KEY, sessionId);
  return { mode: "mock", sessionId };
}

async function initializeWechatSession(force: boolean): Promise<AuthSession> {
  if (force) removeStorage(WECHAT_SESSION_STORAGE_KEY);
  const stored = readStorage<AuthSession>(WECHAT_SESSION_STORAGE_KEY);
  if (stored?.mode === "wechat" && !isExpiring(stored.expiresAt)) return stored;

  const login = await Taro.login({ timeout: 10000 });
  if (!login.code) throw new Error("微信没有返回登录凭证，请重新打开小程序再试。");

  const response = await requestJson<WechatAuthResponse>("/api/auth/wechat", {
    method: "POST",
    data: { code: login.code },
    timeout: 20000
  });
  const session: AuthSession = {
    mode: "wechat",
    token: response.token,
    expiresAt: response.expiresAt
  };
  if (!writeStorage(WECHAT_SESSION_STORAGE_KEY, session)) {
    throw new Error("登录成功，但无法保存登录状态，请清理微信存储空间后重试。");
  }
  return session;
}

function isExpiring(expiresAt: string): boolean {
  const timestamp = Date.parse(expiresAt);
  return !Number.isFinite(timestamp) || timestamp - Date.now() < 5 * 60 * 1000;
}

export function authModeLabel(session: AuthSession | null): string {
  if (!session) return "连接中";
  return session.mode === "wechat" ? "微信已登录" : "开发体验模式";
}

export function authDebugSummary(session: AuthSession | null): string {
  if (!session) return `API ${getApiBaseUrl()}`;
  return session.mode === "wechat" ? "数据会跟随微信账号" : "数据仅保存在当前开发设备";
}
