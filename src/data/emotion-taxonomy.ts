export interface EmotionSignal {
  id: string;
  label: string;
  triggers: string[];
  socialStakes: string[];
  lexicon: string[];
  masks: string[];
  privateTruths: string[];
}

export const emotionTaxonomy: EmotionSignal[] = [
  {
    id: "social_death",
    label: "社死",
    triggers: ["发错", "撤回", "群", "老板", "公开", "全员", "误发", "尴尬"],
    socialStakes: ["体面", "不可撤回", "被熟人目击", "关系里的权力差"],
    lexicon: ["社死", "脚趾施工", "当场消失", "全员可见", "空气凝固"],
    masks: ["哈哈发错了", "没事没事", "我刚刚在测试"],
    privateTruths: ["已经在脑内搬家", "开始回放人生错误集锦"]
  },
  {
    id: "performative_calm",
    label: "表面稳定",
    triggers: ["假装", "没事", "体面", "笑", "冷静", "稳住"],
    socialStakes: ["成年人必须看起来正常", "情绪不能当场塌方"],
    lexicon: ["表面稳定", "礼貌性微笑", "端着", "装作无事发生"],
    masks: ["我可以", "问题不大", "都行"],
    privateTruths: ["内心已经走完一生", "精神状态正在后台重启"]
  },
  {
    id: "shame",
    label: "羞耻",
    triggers: ["喜欢", "相亲", "约会", "摔", "洒", "出丑", "第一次"],
    socialStakes: ["人设管理", "亲密关系里的自我展示", "想优雅但身体不配合"],
    lexicon: ["人设崩塌", "脸上没事心里报警", "想换城市生活"],
    masks: ["我平时不这样的", "哈哈小问题", "谢谢你帮我拿纸"],
    privateTruths: ["已经把未来剧情取消", "开始质疑自己是否适合人类社交"]
  },
  {
    id: "work_fatigue",
    label: "打工疲惫",
    triggers: ["上班", "周一", "老板", "需求", "会议", "加班", "工位", "下班"],
    socialStakes: ["工资和尊严的拉扯", "职业性配合", "精神离职"],
    lexicon: ["精神离职", "工位开机", "灵魂迟到", "班味", "已读乱回"],
    masks: ["收到", "好的老板", "我看一下", "马上"],
    privateTruths: ["灵魂还在周末", "身体在工位，脑子在请假"]
  },
  {
    id: "passive_aggression",
    label: "阴阳怪气",
    triggers: ["随便", "都行", "朋友", "对象", "甲方", "改", "建议", "你看着办"],
    socialStakes: ["不能明说的不满", "关系维护", "话里有话"],
    lexicon: ["懂的都懂", "你开心就好", "我没意见但我有情绪", "礼貌性破防"],
    masks: ["都可以", "我没事", "你决定就好"],
    privateTruths: ["其实已经把对方每个字都做了阅读理解", "心里开了十场复盘会"]
  },
  {
    id: "overthinking",
    label: "过度脑补",
    triggers: ["已读", "不回", "消息", "朋友圈", "点赞", "暧昧", "等"],
    socialStakes: ["不确定关系", "自尊和期待互相拉扯", "不能显得太在乎"],
    lexicon: ["已读乱想", "脑内小剧场", "撤回期待", "假装不在乎"],
    masks: ["我也没等", "刚好看到", "没关系"],
    privateTruths: ["已经把三个标点符号分析到天亮", "手机每亮一次都像命运敲门"]
  },
  {
    id: "adulting_collapse",
    label: "成年人塌方",
    triggers: ["账单", "房租", "外卖", "减肥", "健身", "失眠", "过年", "亲戚"],
    socialStakes: ["成年人要自洽", "生活管理失败", "自我期待和现实冲突"],
    lexicon: ["人生加载失败", "自律撤回", "轻微破产", "精神余额不足"],
    masks: ["明天开始", "还行", "最近挺好的"],
    privateTruths: ["只是勉强维持成人形态", "计划很完整，人完全没跟上"]
  }
];

export function matchEmotionSignals(text: string): EmotionSignal[] {
  const normalized = text.toLowerCase();

  return emotionTaxonomy
    .map((signal) => {
      const hitCount = signal.triggers.filter((trigger) =>
        normalized.includes(trigger.toLowerCase())
      ).length;

      return { signal, hitCount };
    })
    .filter(({ hitCount }) => hitCount > 0)
    .sort((a, b) => b.hitCount - a.hitCount)
    .map(({ signal }) => signal);
}
