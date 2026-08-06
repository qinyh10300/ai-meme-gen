import { apiErrorResponse } from "../../../src/server/http";
import { createId } from "../../../src/server/session";
import { getComparisonPair } from "../../../src/server/feed-service";
import { recordPairwiseVote } from "../../../src/server/joke-repository";
import { comparisonVoteSchema, sessionIdSchema } from "../../../src/server/validation";

export async function GET(request: Request): Promise<Response> {
  try {
    const url = new URL(request.url);
    const sessionId = sessionIdSchema.parse(url.searchParams.get("sessionId"));
    const pair = await getComparisonPair({ sessionId });
    return Response.json(
      { comparisonId: createId("cmp"), ...pair },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (error) {
    return apiErrorResponse(error);
  }
}

export async function POST(request: Request): Promise<Response> {
  try {
    const input = comparisonVoteSchema.parse(await request.json());
    await recordPairwiseVote(input);
    return Response.json({ saved: true, comparisonId: input.comparisonId }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
