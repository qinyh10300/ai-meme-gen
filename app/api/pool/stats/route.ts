import { apiErrorResponse } from "../../../../src/server/http";
import { getCandidatePoolStats } from "../../../../src/server/joke-repository";

export async function GET(): Promise<Response> {
  try {
    return Response.json(await getCandidatePoolStats(), {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
