import Taro from "@tarojs/taro";
import { WECHAT_SESSION_STORAGE_KEY, removeStorage } from "./storage";

const API_BASE_URL = (process.env.TARO_APP_API_BASE_URL ?? "").replace(/\/$/, "");
let reauthenticationScheduled = false;

export interface RequestIdentity {
  token?: string;
  sessionId?: string;
}

interface ApiErrorBody {
  error?: string;
  code?: string;
}

export class ApiRequestError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message);
    this.name = "ApiRequestError";
  }
}

export async function requestJson<T>(
  path: string,
  options: {
    method?: "GET" | "POST";
    data?: Record<string, unknown>;
    identity?: RequestIdentity;
    timeout?: number;
  } = {}
): Promise<T> {
  const method = options.method ?? "GET";
  const identity = options.identity;
  const data =
    method === "POST" && identity?.sessionId
      ? { ...(options.data ?? {}), sessionId: identity.sessionId }
      : options.data;

  let response;
  try {
    response = await Taro.request({
      url: `${API_BASE_URL}${path}`,
      method,
      data,
      timeout: options.timeout ?? 20000,
      header: {
        "Content-Type": "application/json",
        ...(identity?.token ? { Authorization: `Bearer ${identity.token}` } : {})
      }
    });
  } catch {
    throw new ApiRequestError("网络连接失败，请检查网络后重试。", 0, "NETWORK_ERROR");
  }

  if (response.statusCode < 200 || response.statusCode >= 300) {
    const body = response.data as ApiErrorBody;
    if (response.statusCode === 401 && identity?.token) {
      scheduleReauthentication();
    }
    throw new ApiRequestError(
      response.statusCode === 401 && identity?.token
        ? "登录状态已过期，正在重新登录。"
        : body?.error ?? `请求失败 (${response.statusCode})`,
      response.statusCode,
      body?.code ?? "REQUEST_FAILED"
    );
  }

  return response.data as T;
}

export function getApiBaseUrl(): string {
  return API_BASE_URL;
}

function scheduleReauthentication(): void {
  removeStorage(WECHAT_SESSION_STORAGE_KEY);
  if (reauthenticationScheduled) return;
  reauthenticationScheduled = true;
  setTimeout(() => {
    void Taro.reLaunch({ url: "/pages/feed/index" }).finally(() => {
      reauthenticationScheduled = false;
    });
  }, 0);
}
