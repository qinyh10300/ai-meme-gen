import type {
  HumorMechanism,
  HumorMechanismId,
  HumorSourceSignal
} from "../humor/types.js";

export const humorSourceSignals: HumorSourceSignal[] = [
  {
    id: "rzwb_annual_2025",
    name: "弱智吧 2025 年度佳贴评选",
    sourceUrl: "https://tieba.baidu.com/p/10354221105",
    sourceType: "platform",
    observedSignals: [
      "由大量中文母语用户评分，而不是只看单一作者判断",
      "强调原创查重，说明新鲜感是笑点质量的一部分",
      "高密度内容常依赖逻辑误用、语境错位和文化常识反转"
    ],
    usageBoundary: "只提炼评选方法和结构标签，不保存或改写平台原段子。"
  },
  {
    id: "weibo_shenping",
    name: "微博神评标准",
    sourceUrl: "https://weibointl.api.weibo.cn/static/shenping_detail.html",
    sourceType: "platform",
    observedSignals: [
      "评论必须对原内容形成独特补充，而不是复述",
      "神总结和补刀需要短、准、视角新",
      "避免歧视、地域攻击、露骨内容和为了求赞而写的空话"
    ],
    usageBoundary: "使用官方公开的评价标准，不采集具体用户评论。"
  },
  {
    id: "whole_story_2019",
    name: "中文笑话机制标注研究",
    sourceUrl: "https://aclanthology.org/D19-1673/",
    sourceType: "research",
    observedSignals: [
      "质量判断不能只有好笑分，还要标注触发词、人物关系、场景和机制",
      "同一句话是否成立，依赖角色关系和共享语境"
    ],
    usageBoundary: "使用论文的标注维度设计质量控制器。"
  },
  {
    id: "chumor_2",
    name: "Chumor 2.0 中文幽默基准",
    sourceUrl: "https://aclanthology.org/2025.findings-acl.1122/",
    sourceType: "research",
    observedSignals: [
      "中文幽默可拆为文化、情境、双关、谐音、字形和跨语言等类型",
      "情境和文化类型占比高，说明只做谐音梗会显得单薄",
      "模型最常见失败是文化无感、误读双关和解释过度"
    ],
    usageBoundary: "只使用分类与失败模式，不导入论文示例文本。"
  },
  {
    id: "openmic_2026",
    name: "OpenMic 多 Agent 喜剧生成",
    sourceUrl: "https://arxiv.org/abs/2601.08288",
    sourceType: "research",
    observedSignals: [
      "生成应拆成语境检索、写作、表演节奏和质量闸门",
      "原始检索材料先被压缩成写作机制，再交给 JokeWriter",
      "弱包袱应局部重写，避免每轮把整段内容推倒重来"
    ],
    usageBoundary: "借鉴分工与信息隔离，不复制其训练语料或实现。"
  }
];

export const humorMechanisms: Record<HumorMechanismId, HumorMechanism> = {
  literal_obedience: {
    id: "literal_obedience",
    name: "字面执行",
    shortLabel: "字面拐弯",
    expectedMove: "读者把请求理解成符合社会常识的帮助。",
    revealMove: "角色只完成了句子最狭窄的字面含义。",
    writingRules: ["请求必须真的有歧义", "行动要合理到能瞬间回读", "包袱放在最后一个动作"],
    avoid: ["为了误解而误解", "伤害弱者", "解释双关"],
    sourceSignalIds: ["rzwb_annual_2025", "chumor_2"]
  },
  confidence_only: {
    id: "confidence_only",
    name: "只升级态度",
    shortLabel: "态度升级",
    expectedMove: "鼓励会改变能力、选择或结果。",
    revealMove: "事实完全没变，只把音量、姿态或归因升级了。",
    writingRules: ["前后核心事实相同", "后句必须更短更横", "升级点只落在态度"],
    avoid: ["真的突然学会", "纯粹骂人", "前后事实不一致"],
    sourceSignalIds: ["rzwb_annual_2025", "whole_story_2019"]
  },
  context_reveal: {
    id: "context_reveal",
    name: "末拍换语境",
    shortLabel: "语境翻面",
    expectedMove: "铺垫引导出一个体面、正常或积极的解释。",
    revealMove: "最后补充的角色、目的或身份让前文整体变味。",
    writingRules: ["隐藏信息必须公平可推断", "揭示后前文仍然成立", "最后一句只放关键事实"],
    avoid: ["凭空新增设定", "靠猎奇代替逻辑", "揭示后仍需解释"],
    sourceSignalIds: ["whole_story_2019", "chumor_2", "openmic_2026"]
  },
  logic_overextension: {
    id: "logic_overextension",
    name: "一本正经推歪",
    shortLabel: "逻辑滑坡",
    expectedMove: "一句常识、建议或产品提示会被正常接受。",
    revealMove: "角色沿着表面逻辑继续推导，得出荒谬但自洽的结论。",
    writingRules: ["错误逻辑要清晰", "结论要能一步复原", "语气越认真越好"],
    avoid: ["随机胡说", "需要冷门知识", "只剩谐音没有场景"],
    sourceSignalIds: ["rzwb_annual_2025", "chumor_2"]
  },
  social_subtext: {
    id: "social_subtext",
    name: "揭穿潜台词",
    shortLabel: "人情真相",
    expectedMove: "表面话术保持礼貌、积极或给人自由。",
    revealMove: "包袱说出所有人都懂但通常不明说的真实规则。",
    writingRules: ["必须来自具体生活场景", "攻击结构不攻击身份", "像朋友替你说出心里话"],
    avoid: ["泛泛抱怨", "地域性别刻板印象", "鸡汤式总结"],
    sourceSignalIds: ["weibo_shenping", "whole_story_2019", "chumor_2"]
  },
  commentary_tag: {
    id: "commentary_tag",
    name: "评论区补刀",
    shortLabel: "神评补刀",
    expectedMove: "原句看起来完整、正确，甚至有点励志。",
    revealMove: "评论用一个具体例外把原句压回现实。",
    writingRules: ["不复述原句", "一行完成增量信息", "优先用生活物件收尾"],
    avoid: ["解释为什么好笑", "只有反对没有新视角", "求赞口吻"],
    sourceSignalIds: ["weibo_shenping", "rzwb_annual_2025"]
  },
  bureaucratic_translation: {
    id: "bureaucratic_translation",
    name: "把官话翻成人话",
    shortLabel: "职场翻译",
    expectedMove: "制度、会议或管理话术听起来专业且积极。",
    revealMove: "用实际体验翻译它真正改变了谁的时间和成本。",
    writingRules: ["保留一句真实官话", "落到工位、工资或下班", "结论冷静不喊口号"],
    avoid: ["纯抱怨老板", "堆互联网黑话", "长篇解释制度"],
    sourceSignalIds: ["weibo_shenping", "openmic_2026"]
  },
  status_reversal: {
    id: "status_reversal",
    name: "关系位置互换",
    shortLabel: "身份倒置",
    expectedMove: "人物关系按照主人与被服务者、老师与学生等常规位置展开。",
    revealMove: "最后一句暴露真正掌握资源或规则的人。",
    writingRules: ["关系必须日常可见", "反转后行为更合理", "避免靠羞辱弱势角色"],
    avoid: ["无缘由翻脸", "人身攻击", "只更换称谓没有行为证据"],
    sourceSignalIds: ["whole_story_2019", "chumor_2", "weibo_shenping"]
  }
};

export function getHumorMechanism(id: HumorMechanismId): HumorMechanism {
  return humorMechanisms[id];
}
