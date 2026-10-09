import type { ZodType } from "zod";
import { resolveBearerUserId } from "./wechat-auth.js";

export async function parseSessionBoundJson<T>(
  request: Request,
  schema: ZodType<T>
): Promise<T> {
  const body = (await request.json()) as Record<string, unknown>;
  const authenticatedUserId = await resolveBearerUserId(request);
  return schema.parse(
    authenticatedUserId ? { ...body, sessionId: authenticatedUserId } : body
  );
}
