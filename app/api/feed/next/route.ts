import { apiErrorResponse } from "../../../../src/server/http";
import { getNextFeedJoke } from "../../../../src/server/feed-service";
import { feedNextRequestSchema } from "../../../../src/server/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const input = feedNextRequestSchema.parse(await request.json());
    const result = await getNextFeedJoke(input);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
