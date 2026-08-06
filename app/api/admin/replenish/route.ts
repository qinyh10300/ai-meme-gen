import { z } from "zod";
import { requireAdmin } from "../../../../src/server/admin-auth";
import { replenishCandidatePool } from "../../../../src/server/candidate-pool-service";
import { apiErrorResponse } from "../../../../src/server/http";

const replenishRequestSchema = z.object({
  targetPublished: z.number().int().min(48).max(500).optional(),
  maxRuns: z.number().int().min(1).max(12).optional()
});

export async function POST(request: Request): Promise<Response> {
  try {
    await requireAdmin(request);
    const body = replenishRequestSchema.parse(await request.json().catch(() => ({})));
    const result = await replenishCandidatePool(body);
    return Response.json(result);
  } catch (error) {
    return apiErrorResponse(error);
  }
}
