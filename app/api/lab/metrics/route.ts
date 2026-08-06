import { apiErrorResponse } from "../../../../src/server/http";
import { getHumorLabMetrics } from "../../../../src/server/joke-repository";

export async function GET(): Promise<Response> {
  try {
    return Response.json(await getHumorLabMetrics(), {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
