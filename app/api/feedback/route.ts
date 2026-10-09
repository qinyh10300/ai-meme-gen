import { apiErrorResponse } from "../../../src/server/http";
import { upsertFeedback } from "../../../src/server/joke-repository";
import { parseSessionBoundJson } from "../../../src/server/request-session";
import { feedbackRequestSchema } from "../../../src/server/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const input = await parseSessionBoundJson(request, feedbackRequestSchema);
    await upsertFeedback(input);
    return Response.json({ saved: true, eventId: input.eventId }, { status: 201 });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
