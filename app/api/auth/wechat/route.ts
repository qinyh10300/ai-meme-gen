import { apiErrorResponse } from "../../../../src/server/http";
import { loginWithWechat } from "../../../../src/server/wechat-auth";
import { wechatLoginRequestSchema } from "../../../../src/server/validation";

export async function POST(request: Request): Promise<Response> {
  try {
    const input = wechatLoginRequestSchema.parse(await request.json());
    const session = await loginWithWechat(input.code);
    return Response.json(session, {
      status: 201,
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    return apiErrorResponse(error);
  }
}
