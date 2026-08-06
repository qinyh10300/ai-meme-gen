import { env } from "cloudflare:workers";
import { ApiError } from "./http.js";

export async function requireAdmin(request: Request): Promise<void> {
  const configured = env.MEMEPOP_ADMIN_SECRET?.trim();
  if (!configured) {
    throw new ApiError("补货接口尚未配置管理员密钥。", 503, "ADMIN_SECRET_NOT_CONFIGURED");
  }

  const authorization = request.headers.get("authorization") ?? "";
  const provided = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length).trim()
    : "";
  const matches = await constantTimeEqual(provided, configured);
  if (!matches) {
    throw new ApiError("管理员凭证无效。", 401, "UNAUTHORIZED");
  }
}

async function constantTimeEqual(left: string, right: string): Promise<boolean> {
  const [leftHash, rightHash] = await Promise.all([digest(left), digest(right)]);
  let mismatch = leftHash.length ^ rightHash.length;
  const length = Math.max(leftHash.length, rightHash.length);
  for (let index = 0; index < length; index += 1) {
    mismatch |= (leftHash[index] ?? 0) ^ (rightHash[index] ?? 0);
  }
  return mismatch === 0;
}

async function digest(value: string): Promise<Uint8Array> {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)));
}
