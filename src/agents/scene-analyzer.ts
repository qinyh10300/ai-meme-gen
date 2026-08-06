import { matchEmotionSignals } from "../data/emotion-taxonomy.js";
import type { LifeSceneAnalysis, LifeSceneInput, SceneMotifs } from "../types.js";

interface SceneProfile {
  id: string;
  keywords: string[];
  surfaceEvent: string;
  socialStakes: string[];
  hiddenEmotions: string[];
  publicMask: string;
  privateTruth: string;
  sharedMemory: string;
  comicTension: string;
  motifs: SceneMotifs;
}

const sceneProfiles: SceneProfile[] = [
  {
    id: "wrong_group",
    keywords: ["发错群", "发错", "工作群", "撤回", "群里"],
    surfaceEvent: "把不该公开的话发到了不该公开的地方。",
    socialStakes: ["体面", "上下级关系", "不可撤回", "全员目击"],
    hiddenEmotions: ["社死", "惊恐", "表面稳定"],
    publicMask: "哈哈发错了，大家忽略。",
    privateTruth: "撤回的不是消息，是我在这个组织里的未来。",
    sharedMemory: "每个人都经历过发错群、撤回失败、空气突然安静。",
    comicTension: "所有人都看见了，但所有人都在维持一种假装没看见的文明。",
    motifs: {
      triggerObject: "那条消息",
      fragileAsset: "我在公司的未来",
      imaginedEscape: "研究异地社保",
      publicAction: "假装是在测试群功能",
      authorityFigure: "老板",
      stage: "工作群",
      socialProtocol: "撤回失败后的礼貌性装死"
    }
  },
  {
    id: "monday_work",
    keywords: ["周一", "上班", "早八", "闹钟", "开工"],
    surfaceEvent: "周一早上被闹钟强制带回工位。",
    socialStakes: ["精神离职", "成年人自控", "工资和尊严的拉扯"],
    hiddenEmotions: ["打工疲惫", "表面稳定", "成年人塌方"],
    publicMask: "已到工位，正在进入工作状态。",
    privateTruth: "身体打卡成功，灵魂还在周日晚上加载。",
    sharedMemory: "大家都懂周一不是一天，而是一种系统重启失败。",
    comicTension: "人已经坐在公司，但精神上还没有同意今天开始。",
    motifs: {
      triggerObject: "闹钟",
      fragileAsset: "周末",
      imaginedEscape: "申请灵魂调休",
      publicAction: "打开电脑",
      authorityFigure: "公司",
      stage: "工位",
      socialProtocol: "周一早会前的低电量营业"
    }
  },
  {
    id: "crush_date_spill",
    keywords: ["喜欢的人", "约会", "相亲", "第一次吃饭", "饮料洒", "洒了", "出丑"],
    surfaceEvent: "想表现自然，结果把狼狈展示得很完整。",
    socialStakes: ["人设管理", "亲密关系里的自我展示", "羞耻不能外露"],
    hiddenEmotions: ["羞耻", "社死", "表面稳定"],
    publicMask: "我平时不这样的，哈哈。",
    privateTruth: "这杯饮料洒的不是桌子，是我精心经营的人设。",
    sharedMemory: "人在喜欢的人面前越想优雅，越容易被身体背刺。",
    comicTension: "表面是在擦桌子，实际是在抢救人设。",
    motifs: {
      triggerObject: "那杯饮料",
      fragileAsset: "人设",
      imaginedEscape: "把未来剧情取消",
      publicAction: "笑得很开朗",
      authorityFigure: "喜欢的人",
      stage: "餐桌",
      socialProtocol: "出丑后的礼貌性自我介绍"
    }
  },
  {
    id: "late_boss_request",
    keywords: ["老板", "下班", "改需求", "临下班", "加班", "甲方"],
    surfaceEvent: "快下班时收到新的需求或修改意见。",
    socialStakes: ["职业性配合", "不能明说的不满", "下班幻想破灭"],
    hiddenEmotions: ["打工疲惫", "阴阳怪气", "微型崩溃"],
    publicMask: "收到，我看一下。",
    privateTruth: "我回复的是收到，内心提交的是辞职预览版。",
    sharedMemory: "打工人都懂临下班的需求不是需求，是对灵魂的抽检。",
    comicTension: "嘴上是协作，心里已经在开离职欢送会。",
    motifs: {
      triggerObject: "那个需求",
      fragileAsset: "下班幻想",
      imaginedEscape: "精神离职",
      publicAction: "回复收到",
      authorityFigure: "老板",
      stage: "工位",
      socialProtocol: "临下班收到消息后的职业性微笑"
    }
  },
  {
    id: "casual_but_not",
    keywords: ["随便", "都行", "你看着办", "朋友", "对象", "吃什么"],
    surfaceEvent: "对方说随便，但随便里有明确的隐藏答案。",
    socialStakes: ["关系维护", "话里有话", "不能显得不懂事"],
    hiddenEmotions: ["阴阳怪气", "过度脑补", "表面稳定"],
    publicMask: "好，那我来定。",
    privateTruth: "这不是选择题，是一场没有题干的考试。",
    sharedMemory: "中文语境里的随便，常常是最不随便的指令。",
    comicTension: "对方给了自由，但同时保留了判错权。",
    motifs: {
      triggerObject: "随便两个字",
      fragileAsset: "关系里的求生欲",
      imaginedEscape: "申请场外观众投票",
      publicAction: "认真搜索附近餐厅",
      authorityFigure: "说随便的人",
      stage: "聊天框",
      socialProtocol: "读懂潜台词的成人考试"
    }
  },
  {
    id: "seen_no_reply",
    keywords: ["已读不回", "不回", "已读", "等消息", "消息"],
    surfaceEvent: "消息被看见了，但回应没有出现。",
    socialStakes: ["自尊和期待拉扯", "不能显得太在乎", "关系不确定"],
    hiddenEmotions: ["过度脑补", "嘴硬", "假装不在乎"],
    publicMask: "我也没等，刚好看手机。",
    privateTruth: "三个字的已读，让我写完了一部长篇心理小说。",
    sharedMemory: "很多人都在等消息时装作没等，但手机一亮就破功。",
    comicTension: "嘴上说无所谓，身体已经把通知声音训练成条件反射。",
    motifs: {
      triggerObject: "已读",
      fragileAsset: "我的自尊",
      imaginedEscape: "撤回期待",
      publicAction: "假装顺手看手机",
      authorityFigure: "对方",
      stage: "聊天框",
      socialProtocol: "不主动追问但疯狂刷新"
    }
  },
  {
    id: "new_year_relatives",
    keywords: ["过年", "亲戚", "催婚", "工资", "对象", "盘问"],
    surfaceEvent: "过年被亲戚用关心的语气做人生审计。",
    socialStakes: ["家庭秩序", "成年人绩效", "不能当场翻脸"],
    hiddenEmotions: ["成年人塌方", "阴阳怪气", "表面稳定"],
    publicMask: "还行，还在看机会。",
    privateTruth: "这不是聊天，是没有退出按钮的人生答辩。",
    sharedMemory: "每到过年，很多人都会被工资、对象、房子轮流点名。",
    comicTension: "表面是寒暄，实际是跨部门 KPI 复盘。",
    motifs: {
      triggerObject: "亲戚的问题",
      fragileAsset: "成年人绩效",
      imaginedEscape: "躲进厨房洗碗",
      publicAction: "礼貌微笑",
      authorityFigure: "亲戚",
      stage: "年夜饭桌",
      socialProtocol: "过年期间的人生答辩"
    }
  },
  {
    id: "gym_day_one",
    keywords: ["健身", "减肥", "自律", "第一天", "跑步", "运动"],
    surfaceEvent: "刚开始自律，身体就提出了反对意见。",
    socialStakes: ["自我管理", "计划和执行的落差", "朋友圈人设"],
    hiddenEmotions: ["成年人塌方", "嘴硬", "轻微羞耻"],
    publicMask: "今天只是热身，慢慢来。",
    privateTruth: "计划很完整，人完全没跟上。",
    sharedMemory: "大家都懂自律最难的不是开始，是开始后的五分钟。",
    comicTension: "脑子已经成为健身博主，身体还在申请观察期。",
    motifs: {
      triggerObject: "第一组动作",
      fragileAsset: "自律人设",
      imaginedEscape: "回去奖励一顿夜宵",
      publicAction: "打开运动 App",
      authorityFigure: "镜子里的自己",
      stage: "健身房",
      socialProtocol: "自律第一天的嘴硬营业"
    }
  }
];

export function analyzeScene(input: LifeSceneInput): LifeSceneAnalysis {
  const text = input.text.trim();
  const profile = findBestProfile(text);
  const matchedSignals = matchEmotionSignals(text);
  const sceneAnchor = compactSceneAnchor(text);

  const hiddenEmotions = unique([
    ...(profile?.hiddenEmotions ?? []),
    ...matchedSignals.map((signal) => signal.label)
  ]).slice(0, 5);

  const socialStakes = unique([
    ...(profile?.socialStakes ?? []),
    ...matchedSignals.flatMap((signal) => signal.socialStakes)
  ]).slice(0, 6);

  const motifs = profile?.motifs ?? inferGenericMotifs(text);
  const publicMask = profile?.publicMask ?? firstOrFallback(
    matchedSignals.flatMap((signal) => signal.masks),
    `我只是想把「${sceneAnchor}」正常处理完。`
  );
  const privateTruth = profile?.privateTruth ?? firstOrFallback(
    matchedSignals.flatMap((signal) => signal.privateTruths),
    `真正让我在意的不是「${sceneAnchor}」本身，而是${motifs.fragileAsset}突然不够用了。`
  );

  return {
    scene: text,
    surfaceEvent: profile?.surfaceEvent ?? `发生了「${text}」这种生活小事故。`,
    socialStakes: socialStakes.length > 0 ? socialStakes : ["体面", "自尊", "关系维护"],
    hiddenEmotions: hiddenEmotions.length > 0 ? hiddenEmotions : ["表面稳定", "轻微崩溃", "嘴硬"],
    publicMask,
    privateTruth,
    sharedMemory:
      profile?.sharedMemory ??
      "这类瞬间好笑，是因为大家都经历过：表面说没事，心里已经开始复盘。",
    comicTension:
      profile?.comicTension ??
      `表面是在处理${motifs.triggerObject}，实际是在抢救${motifs.fragileAsset}。`,
    motifs,
    tensionPairs: [
      { surface: publicMask, truth: privateTruth },
      {
        surface: `我只是正常面对${motifs.stage}里的一个小场面。`,
        truth: `其实${motifs.fragileAsset}正在被${motifs.triggerObject}公开处刑。`
      },
      {
        surface: `我看起来还在遵守${motifs.socialProtocol}。`,
        truth: `内心已经开始${motifs.imaginedEscape}。`
      }
    ],
    matchedSignals: matchedSignals.map((signal) => signal.id)
  };
}

function findBestProfile(text: string): SceneProfile | undefined {
  return sceneProfiles
    .map((profile) => ({
      profile,
      score: profile.keywords.filter((keyword) => text.includes(keyword)).length
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)[0]?.profile;
}

function inferGenericMotifs(text: string): SceneMotifs {
  const triggerObject = inferTriggerObject(text);

  return {
    triggerObject,
    fragileAsset: inferFragileAsset(text),
    imaginedEscape: "在脑内换一种人生",
    publicAction: "礼貌性保持正常",
    authorityFigure: "现场所有人",
    stage: inferStage(text),
    socialProtocol: "成年人假装没事的流程"
  };
}

function inferTriggerObject(text: string): string {
  if (text.includes("消息")) return "那条消息";
  if (text.includes("需求")) return "那个需求";
  if (text.includes("闹钟")) return "闹钟";
  if (text.includes("饮料")) return "那杯饮料";
  if (text.includes("会议")) return "那场会议";
  return "这个瞬间";
}

function inferFragileAsset(text: string): string {
  if (text.includes("上班") || text.includes("老板") || text.includes("需求")) return "下班幻想";
  if (text.includes("喜欢") || text.includes("约会") || text.includes("相亲")) return "人设";
  if (text.includes("消息") || text.includes("已读")) return "我的自尊";
  if (text.includes("亲戚") || text.includes("过年")) return "成年人绩效";
  return "最后一点体面";
}

function inferStage(text: string): string {
  if (text.includes("群") || text.includes("消息") || text.includes("已读")) return "聊天框";
  if (text.includes("公司") || text.includes("老板") || text.includes("上班")) return "工位";
  if (text.includes("吃饭") || text.includes("相亲") || text.includes("约会")) return "餐桌";
  if (text.includes("过年") || text.includes("亲戚")) return "饭桌";
  return "现场";
}

function unique<T>(items: T[]): T[] {
  return [...new Set(items)];
}

function firstOrFallback(items: string[], fallback: string): string {
  return items.find(Boolean) ?? fallback;
}

function compactSceneAnchor(text: string): string {
  const normalized = text.replace(/[。！？!?]+$/g, "").trim();
  const characters = [...normalized];
  return characters.length <= 24
    ? normalized
    : `${characters.slice(0, 23).join("")}…`;
}
