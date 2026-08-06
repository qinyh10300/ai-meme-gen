import { env } from "cloudflare:workers";
import { getRepositoryCounts } from "../../../src/server/joke-repository";

export async function GET(): Promise<Response> {
  const checkedAt = new Date().toISOString();
  try {
    const counts = await getRepositoryCounts();
    return Response.json(
      {
        status: "ok",
        checkedAt,
        database: "connected",
        model: {
          configured: Boolean(env.OPENAI_API_KEY?.trim()),
          name: env.OPENAI_MODEL?.trim() || "gpt-5.6"
        },
        counts
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch {
    return Response.json(
      {
        status: "unhealthy",
        checkedAt,
        database: "unavailable",
        model: { configured: Boolean(env.OPENAI_API_KEY?.trim()) }
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }
}
