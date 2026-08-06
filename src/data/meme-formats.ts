import type { MemeFormat } from "../types.js";

export const memeFormats: MemeFormat[] = [
  {
    id: "chat_screenshot",
    name: "聊天截图体",
    bestForOperators: ["inner_monologue", "social_protocol_bug", "future_cancellation"],
    platformFit: ["wechat", "weibo", "xiaohongshu", "generic"],
    description: "用对话气泡制造生活感，适合尴尬、误会、阴阳怪气。",
    layoutBrief: "白底聊天界面，两到三条短消息，最后一条作为 punchline。",
    textSlots: ["对方的一句正常话", "我的礼貌回复", "我的真实内心"]
  },
  {
    id: "reaction_caption",
    name: "表情包字幕体",
    bestForOperators: ["reverse_dignity", "understatement", "object_transfer"],
    platformFit: ["wechat", "weibo", "bilibili", "generic"],
    description: "一张强表情图配一句短 punchline，适合群聊传播。",
    layoutBrief: "人物表情占画面中心，底部白字黑边，字数控制在 18 字以内。",
    textSlots: ["短 punchline"]
  },
  {
    id: "fake_system_popup",
    name: "伪系统弹窗",
    bestForOperators: ["fake_system_notice", "precise_measurement", "blame_the_abstract"],
    platformFit: ["weibo", "bilibili", "generic"],
    description: "把情绪崩溃做成系统错误，适合程序员、打工人和抽象语气。",
    layoutBrief: "居中弹窗，标题像系统错误，按钮文案承担第二个笑点。",
    textSlots: ["错误标题", "错误说明", "按钮文案"]
  },
  {
    id: "four_panel_micro_story",
    name: "四格生活小剧场",
    bestForOperators: ["future_cancellation", "object_transfer", "inner_monologue"],
    platformFit: ["xiaohongshu", "weibo", "bilibili", "generic"],
    description: "适合有铺垫和转折的生活瞬间，让情绪递进更清楚。",
    layoutBrief: "四格：期待、事故、假装正常、内心塌方。",
    textSlots: ["铺垫", "事故", "体面动作", "punchline"]
  },
  {
    id: "workplace_dialogue",
    name: "职场对话体",
    bestForOperators: ["micro_rebellion", "fake_system_notice", "understatement"],
    platformFit: ["wechat", "weibo", "xiaohongshu", "generic"],
    description: "用老板/甲方/我的错位对话写打工人的不能明说。",
    layoutBrief: "左右两栏或聊天气泡，老板的话短，我的内心长但不能发出去。",
    textSlots: ["老板/甲方", "我实际回复", "我真实想法"]
  },
  {
    id: "voiceover_short",
    name: "魔音短视频旁白",
    bestForOperators: ["precise_measurement", "blame_the_abstract", "understatement"],
    platformFit: ["douyin", "bilibili", "generic"],
    description: "用严肃播报腔讲小崩溃，适合加重音、停顿和音效。",
    layoutBrief: "前三秒给场景，第四秒停顿，第五秒用 punchline 爆掉。",
    textSlots: ["开场旁白", "停顿前铺垫", "重音 punchline"]
  }
];
