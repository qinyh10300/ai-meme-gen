import type { CultureJoke } from "./contracts";

const quality = {
  overall: 90,
  setupTrust: 90,
  reversal: 92,
  clarity: 93,
  rhythm: 90,
  specificity: 87,
  safety: 100
};

export const fallbackJokes: CultureJoke[] = [
  {
    id: "mini-bowl-help",
    setup: [
      "一个乞丐端着破碗走到我跟前：“求求你，帮我个忙吧。”",
      "他的手一直在抖。我犹豫了一下，于是……"
    ],
    punchline: "帮他端了一会儿。",
    mechanismId: "literal_obedience",
    format: "story",
    topics: ["日常", "误解", "请求"],
    emotionalTruth: "人会用最省力的方式证明自己确实帮过忙。",
    expectedReading: "给钱或解决困难。",
    revealedReading: "只替对方端住碗。",
    emoji: "🥣🫴",
    palette: "yellow",
    editorialScore: 96,
    label: "字面拐弯",
    score: 96,
    quality,
    fingerprint: "mini-bowl-help"
  },
  {
    id: "mini-project-forward",
    setup: ["老板说：“这个项目进度太慢，你再往前推一推。”", "散会后我立刻执行。"],
    punchline: "我把项目文件从桌面第五排拖到了第一排。",
    mechanismId: "literal_obedience",
    format: "story",
    topics: ["职场", "电脑", "执行"],
    emotionalTruth: "面对模糊指令，最低成本的完成方式最有诱惑力。",
    expectedReading: "推进项目进度。",
    revealedReading: "移动桌面文件的位置。",
    emoji: "🗂️➡️",
    palette: "blue",
    editorialScore: 94,
    label: "字面拐弯",
    score: 94,
    quality,
    fingerprint: "mini-project-forward"
  },
  {
    id: "mini-confident-intern",
    setup: ["实习生汇报时一直说“可能、大概、也许”。", "领导鼓励他：“年轻人说话要自信！”"],
    punchline: "他清了清嗓子：“这个方案肯定做不完。”",
    mechanismId: "confidence_only",
    format: "dialogue",
    topics: ["职场", "实习生", "自信"],
    emotionalTruth: "自信不一定服务于积极结论。",
    expectedReading: "更坚定地承诺完成。",
    revealedReading: "坚定地宣布做不完。",
    emoji: "📊✅",
    palette: "coral",
    editorialScore: 95,
    label: "态度升级",
    score: 95,
    quality,
    fingerprint: "mini-confident-intern"
  },
  {
    id: "mini-eight-hour-sleep",
    setup: ["医生叮嘱我：“每天一定要睡够八小时。”", "我严格执行了一个月。"],
    punchline: "上班睡六小时，回家再补两小时。",
    mechanismId: "literal_obedience",
    format: "observation",
    topics: ["上班", "健康", "偷懒"],
    emotionalTruth: "成年人擅长让健康建议适配工作。",
    expectedReading: "夜间连续睡眠。",
    revealedReading: "把工作时间算进睡眠指标。",
    emoji: "😴🕗",
    palette: "lime",
    editorialScore: 90,
    label: "字面拐弯",
    score: 90,
    quality,
    fingerprint: "mini-eight-hour-sleep"
  }
];
