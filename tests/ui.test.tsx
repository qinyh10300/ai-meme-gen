import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { HumorLab } from "../app/components/HumorLab.js";
import { MemeMachine } from "../app/components/MemeMachine.js";
import { getOrCreateClientSession } from "../src/web/client-session.js";
import { wechatLoginRequestSchema } from "../src/server/validation.js";

describe("critical web surfaces", () => {
  it("keeps the primary joke and two large vote actions on the first screen", () => {
    const html = renderToStaticMarkup(<MemeMachine />);

    expect(html).toContain("MemePop");
    expect(html).toContain("不好笑，下一个");
    expect(html).toContain("好笑，下一个");
    expect(html).toContain("我的场景");
    expect(html).toContain("实验室");
    expect(html).toContain("aria-live=\"polite\"");
  });

  it("renders aggregate metrics and the blind comparison surface", () => {
    const html = renderToStaticMarkup(<HumorLab />);

    expect(html).toContain("笑点实验室");
    expect(html).toContain("二选一");
    expect(html).toContain("机制表现");
    expect(html).toContain("反馈原因");
  });

  it("reuses a valid anonymous session and replaces an invalid one", () => {
    const values = new Map<string, string>();
    const storage = {
      getItem: (key: string) => values.get(key) ?? null,
      setItem: (key: string, value: string) => values.set(key, value)
    };
    const first = getOrCreateClientSession(storage, () => "12345678-1234-1234-1234-123456789abc");
    const second = getOrCreateClientSession(storage, () => "unused");

    expect(first).toBe("web_12345678123412341234123456789abc");
    expect(second).toBe(first);

    values.set("memepop-session-v1", "bad id");
    expect(getOrCreateClientSession(storage, () => "abcdef00-0000-0000-0000-000000000000"))
      .toBe("web_abcdef00000000000000000000000000");
  });

  it("validates one-time WeChat login codes before contacting WeChat", () => {
    expect(wechatLoginRequestSchema.parse({ code: "  temporary-code  " })).toEqual({
      code: "temporary-code"
    });
    expect(() => wechatLoginRequestSchema.parse({ code: "bad" })).toThrow();
  });
});
