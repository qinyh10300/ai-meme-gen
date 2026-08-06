import type { HumorMechanismId } from "../humor/types.js";
import type { JokeAudience, JokeTone } from "../platform/contracts.js";

export interface CultureCardSeed {
  id: string;
  context: string;
  audience: JokeAudience;
  tone: JokeTone;
  relationship: string[];
  sharedHumanTruth: string;
  emotions: string[];
  mechanisms: HumorMechanismId[];
}

export const cultureCardSeeds: CultureCardSeed[] = [
  {
    id: "card-work-muted-mic",
    context: "线上会议讲了三分钟才发现自己没开麦，重新讲时大家的表情像在看重播",
    audience: "年轻职场人",
    tone: "冷面",
    relationship: ["同事", "会议主持人"],
    sharedHumanTruth: "最尴尬的不是白讲，而是第二遍连自己都不想听。",
    emotions: ["尴尬", "职业性镇定"],
    mechanisms: ["context_reveal", "social_subtext"]
  },
  {
    id: "card-work-reply-all",
    context: "同事私聊问我对新方案怎么看，我写完真话才发现回复框是全员邮件",
    audience: "年轻职场人",
    tone: "生活流",
    relationship: ["同事", "全体收件人"],
    sharedHumanTruth: "成年人的手速常常比求生欲先到。",
    emotions: ["社死", "后悔"],
    mechanisms: ["context_reveal", "status_reversal"]
  },
  {
    id: "card-work-late-task",
    context: "下班前老板说只占用五分钟，五分钟后他开始共享一份四十页文档",
    audience: "年轻职场人",
    tone: "冷面",
    relationship: ["老板", "员工"],
    sharedHumanTruth: "职场里的时间单位常由说话的人决定。",
    emotions: ["克制", "下班幻灭"],
    mechanisms: ["bureaucratic_translation", "literal_obedience"]
  },
  {
    id: "card-family-video-call",
    context: "妈妈视频时说只是看看我，镜头转了一圈后开始检查冰箱和阳台",
    audience: "通用",
    tone: "温和自嘲",
    relationship: ["母亲", "成年子女"],
    sharedHumanTruth: "家人的看看，通常包含一次远程生活验收。",
    emotions: ["被关心", "无处藏身"],
    mechanisms: ["social_subtext", "status_reversal"]
  },
  {
    id: "card-family-leftovers",
    context: "我说今晚不回家吃饭，爸爸说随便，十分钟后发来一张满桌菜的照片",
    audience: "通用",
    tone: "温和自嘲",
    relationship: ["父亲", "子女"],
    sharedHumanTruth: "家人的随便会附带一份看得见的内疚。",
    emotions: ["嘴硬", "愧疚"],
    mechanisms: ["social_subtext", "commentary_tag"]
  },
  {
    id: "card-love-menu",
    context: "对象说吃什么都行，我连续报了六家店，成功确认了六家都不行",
    audience: "情侣",
    tone: "生活流",
    relationship: ["情侣"],
    sharedHumanTruth: "关系里的自由选择常常是排除法考试。",
    emotions: ["求生欲", "无奈"],
    mechanisms: ["literal_obedience", "logic_overextension"]
  },
  {
    id: "card-love-photo",
    context: "给对象拍了一百张照片，她说有一张能看，我问哪张，她说她正在找",
    audience: "情侣",
    tone: "温和自嘲",
    relationship: ["情侣"],
    sharedHumanTruth: "拍照任务完成与验收通过是两件事。",
    emotions: ["努力", "心虚"],
    mechanisms: ["bureaucratic_translation", "context_reveal"]
  },
  {
    id: "card-school-presentation",
    context: "小组展示前大家都说我来配合，上台后我才知道配合的意思是我来讲",
    audience: "大学生",
    tone: "生活流",
    relationship: ["小组同学"],
    sharedHumanTruth: "集体任务里的配合，有时只是责任换了一个名字。",
    emotions: ["被托付", "突然清醒"],
    mechanisms: ["context_reveal", "bureaucratic_translation"]
  },
  {
    id: "card-school-roll-call",
    context: "老师点名时我替室友答到，老师抬头说让本人也替你考期末",
    audience: "大学生",
    tone: "冷面",
    relationship: ["老师", "学生", "室友"],
    sharedHumanTruth: "互相帮忙遇到权力角色时会突然恢复边界。",
    emotions: ["侥幸", "被抓现行"],
    mechanisms: ["status_reversal", "logic_overextension"]
  },
  {
    id: "card-friend-borrow",
    context: "朋友借我充电宝说马上还，后来我们见了三次，它已经开始认他当主人",
    audience: "朋友群聊",
    tone: "生活流",
    relationship: ["朋友"],
    sharedHumanTruth: "朋友之间的小物件会用拖延完成所有权转移。",
    emotions: ["无奈", "熟人默契"],
    mechanisms: ["status_reversal", "commentary_tag"]
  },
  {
    id: "card-friend-late",
    context: "朋友说马上到，我洗完澡下楼吃完早餐回来，他发消息说正在穿鞋",
    audience: "朋友群聊",
    tone: "轻微冒犯",
    relationship: ["朋友"],
    sharedHumanTruth: "熟人的马上不是时间，是一种安抚。",
    emotions: ["等待", "见怪不怪"],
    mechanisms: ["literal_obedience", "social_subtext"]
  },
  {
    id: "card-consumer-coupon",
    context: "为了免八元运费，我又买了六十元东西，省钱终于有了启动资金",
    audience: "通用",
    tone: "冷面",
    relationship: ["消费者", "促销规则"],
    sharedHumanTruth: "人会为了证明自己会省钱而花更多钱。",
    emotions: ["自我安慰", "后知后觉"],
    mechanisms: ["logic_overextension", "commentary_tag"]
  },
  {
    id: "card-consumer-support",
    context: "客服说非常理解我的心情，然后复制了上一条完全没解决问题的回复",
    audience: "通用",
    tone: "冷面",
    relationship: ["顾客", "客服"],
    sharedHumanTruth: "标准化共情有时只证明系统收到了情绪，没有收到问题。",
    emotions: ["期待", "无力"],
    mechanisms: ["bureaucratic_translation", "social_subtext"]
  },
  {
    id: "card-social-voice",
    context: "朋友发来六十秒语音说事情很简单，我听完发现简单的是他不用打字",
    audience: "朋友群聊",
    tone: "轻微冒犯",
    relationship: ["朋友"],
    sharedHumanTruth: "沟通成本经常被说话的人礼貌地转给听的人。",
    emotions: ["无奈", "熟悉"],
    mechanisms: ["context_reveal", "status_reversal"]
  },
  {
    id: "card-social-delete",
    context: "朋友圈发出十分钟没人点赞，我刚删除就有朋友问刚才那条怎么没了",
    audience: "朋友群聊",
    tone: "温和自嘲",
    relationship: ["发帖人", "朋友"],
    sharedHumanTruth: "沉默的观众总会在内容消失后证明自己来过。",
    emotions: ["期待", "尴尬"],
    mechanisms: ["status_reversal", "context_reveal"]
  },
  {
    id: "card-self-todo",
    context: "列完十条待办以后很有成就感，于是先休息一下庆祝今天已经开始努力",
    audience: "通用",
    tone: "温和自嘲",
    relationship: ["自己", "计划"],
    sharedHumanTruth: "规划会提前发放一部分完成任务的满足感。",
    emotions: ["拖延", "自我奖励"],
    mechanisms: ["logic_overextension", "commentary_tag"]
  }
];
