import type { PunchlineOperator } from "../types.js";

export const punchlineOperators: PunchlineOperator[] = [
  {
    id: "reverse_dignity",
    name: "反向体面",
    description: "把努力维持体面的动作，反过来写成体面已经崩掉。",
    bestFor: ["社死", "羞耻", "表面稳定"]
  },
  {
    id: "inner_monologue",
    name: "内心旁白",
    description: "说出当事人不能说出口，但所有人都懂的内心真实反应。",
    bestFor: ["过度脑补", "社死", "打工疲惫"]
  },
  {
    id: "precise_measurement",
    name: "过度精确",
    description: "把模糊情绪写成像仪表盘或技术指标一样荒诞精确。",
    bestFor: ["表面稳定", "成年人塌方", "打工疲惫"]
  },
  {
    id: "understatement",
    name: "轻描淡写",
    description: "越大的崩溃越轻声说，制造克制反差。",
    bestFor: ["成年人塌方", "打工疲惫", "羞耻"]
  },
  {
    id: "object_transfer",
    name: "对象转义",
    description: "把具体物品转义成尊严、人设、未来、周末等抽象资产。",
    bestFor: ["羞耻", "社死", "打工疲惫"]
  },
  {
    id: "blame_the_abstract",
    name: "甩锅给抽象对象",
    description: "不承认是自己出错，而是归因给命运、系统、宇宙或人生。",
    bestFor: ["社死", "成年人塌方", "过度脑补"]
  },
  {
    id: "fake_system_notice",
    name: "伪系统通知",
    description: "用系统报错、公告、审批流来写生活崩溃。",
    bestFor: ["打工疲惫", "成年人塌方", "表面稳定"]
  },
  {
    id: "social_protocol_bug",
    name: "社交流程报错",
    description: "把人情世故写成一个流程 bug。",
    bestFor: ["阴阳怪气", "羞耻", "社死"]
  },
  {
    id: "future_cancellation",
    name: "未来撤回",
    description: "把眼前小事故夸张成未来规划被取消。",
    bestFor: ["羞耻", "过度脑补", "社死"]
  },
  {
    id: "micro_rebellion",
    name: "微型叛逆",
    description: "在不能反抗的处境里，写一个小到可怜的精神反抗。",
    bestFor: ["打工疲惫", "阴阳怪气", "成年人塌方"]
  }
];

export function getPunchlineOperator(id: string): PunchlineOperator {
  const operator = punchlineOperators.find((item) => item.id === id);

  if (!operator) {
    throw new Error(`Unknown punchline operator: ${id}`);
  }

  return operator;
}
