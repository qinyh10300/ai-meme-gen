import { ZodError } from "zod";

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: string
  ) {
    super(message);
  }
}

export function apiErrorResponse(error: unknown): Response {
  if (error instanceof ZodError) {
    return Response.json(
      {
        error: "请求内容不完整或格式不正确。",
        code: "INVALID_REQUEST",
        issues: error.issues.map((issue) => ({ path: issue.path.join("."), message: issue.message }))
      },
      { status: 400 }
    );
  }

  if (error instanceof ApiError) {
    return Response.json({ error: error.message, code: error.code }, { status: error.status });
  }

  const message = error instanceof Error ? error.message : "Unexpected server error";
  const isDatabaseError =
    message.includes("D1 binding") ||
    message.includes("no such table") ||
    message.includes("database");

  return Response.json(
    {
      error: isDatabaseError
        ? "反馈数据库暂时不可用，本次操作没有被保存。"
        : "服务暂时无法完成这次操作。",
      code: isDatabaseError ? "DATABASE_UNAVAILABLE" : "INTERNAL_ERROR"
    },
    { status: isDatabaseError ? 503 : 500 }
  );
}
