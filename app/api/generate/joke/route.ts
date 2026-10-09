import { apiErrorResponse } from "../../../../src/server/http";
import { generateJokes } from "../../../../src/server/generation-service";
import { parseSessionBoundJson } from "../../../../src/server/request-session";
import { generateJokeRequestSchema } from "../../../../src/server/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const input = await parseSessionBoundJson(request, generateJokeRequestSchema);
    const result = await generateJokes(input);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
