import { getPunchlineOperator } from "../data/punchline-operators.js";
import type { LifeSceneAnalysis, LifeSceneInput, PunchlineCandidate } from "../types.js";

interface PunchlineDraft {
  operatorId: string;
  text: string;
  mechanism: string;
  whyItWorks: string;
}

export function writePunchlines(
  analysis: LifeSceneAnalysis,
  input: LifeSceneInput
): PunchlineCandidate[] {
  const drafts: PunchlineDraft[] = [
    ...sceneSpecificPunchlines(analysis),
    ...reverseDignity(analysis),
    ...innerMonologue(analysis),
    ...preciseMeasurement(analysis),
    ...understatement(analysis),
    ...objectTransfer(analysis),
    ...blameTheAbstract(analysis),
    ...fakeSystemNotice(analysis),
    ...socialProtocolBug(analysis),
    ...futureCancellation(analysis),
    ...microRebellion(analysis)
  ];

  const tonedDrafts = applyTone(deduplicateDrafts(drafts), input);

  return tonedDrafts.map((draft, index) => {
    const operator = getPunchlineOperator(draft.operatorId);

    return {
      id: `p${index + 1}`,
      text: draft.text,
      operatorId: operator.id,
      operatorName: operator.name,
      mechanism: draft.mechanism,
      whyItWorks: draft.whyItWorks
    };
  });
}

function reverseDignity(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  return [
    {
      operatorId: "reverse_dignity",
      text: `我${motifs.publicAction}，但${motifs.fragileAsset}已经先走一步了。`,
      mechanism: "表面动作和内心崩塌反向并置。",
      whyItWorks: `它抓住了「${analysis.publicMask}」背后的体面维护，让小事故变成体面资产流失。`
    },
    {
      operatorId: "reverse_dignity",
      text: `那一刻我看起来很正常，主要是${motifs.fragileAsset}已经替我失控了。`,
      mechanism: "把失控从人转移到抽象资产上。",
      whyItWorks: "中文网感里常把尊严、人设、未来拟人化，这会让尴尬更轻也更准。"
    },
    {
      operatorId: "reverse_dignity",
      text: `${motifs.authorityFigure}可能没说什么，但${motifs.fragileAsset}已经听懂了。`,
      mechanism: "让沉默承担攻击性。",
      whyItWorks: "很多社交尴尬不是有人批评，而是沉默本身已经完成审判。"
    }
  ];
}

function innerMonologue(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  return [
    {
      operatorId: "inner_monologue",
      text: `我嘴上说没事，心里已经开始${motifs.imaginedEscape}。`,
      mechanism: "公开话术与真实反应错位。",
      whyItWorks: "它把人类最熟悉的嘴硬翻译出来：越说没事，越说明事情很大。"
    },
    {
      operatorId: "inner_monologue",
      text: `表面：${analysis.publicMask} 内心：建议重开。`,
      mechanism: "截图体双层人格。",
      whyItWorks: "表面和内心的强反差，是中文互联网吐槽最稳定的笑点结构。"
    },
    {
      operatorId: "inner_monologue",
      text: `${motifs.stage}里很安静，我脑子里已经开了十场复盘会。`,
      mechanism: "外部沉默与内部高噪音形成反差。",
      whyItWorks: "它说中了尴尬场面里最真实的部分：别人没动静，自己已经把自己审完了。"
    }
  ];
}

function preciseMeasurement(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;
  const metricUnit = getMetricUnit(motifs.fragileAsset);

  return [
    {
      operatorId: "precise_measurement",
      text: `${motifs.stage}尴尬浓度达到每立方米三个${metricUnit}。`,
      mechanism: "把不可量化的情绪写成荒诞指标。",
      whyItWorks: "过度精确会制造荒诞感，也能避免直说「好尴尬」的生硬。"
    },
    {
      operatorId: "precise_measurement",
      text: `我的精神状态：已连接${motifs.stage}，未连接人生。`,
      mechanism: "用设备状态写心理状态。",
      whyItWorks: "系统化表达能把小崩溃变成可视化故障，适合做弹窗或字幕梗。"
    },
    {
      operatorId: "precise_measurement",
      text: `${motifs.triggerObject}出现后，我的体面电量从 80% 掉到省电模式。`,
      mechanism: "用电量隐喻社交能量。",
      whyItWorks: "它把抽象的体面消耗变成人人懂的手机电量。"
    }
  ];
}

function understatement(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  return [
    {
      operatorId: "understatement",
      text: `没事，就是${motifs.fragileAsset}短暂离线了一下。`,
      mechanism: "用轻描淡写包住大崩溃。",
      whyItWorks: "中文互联网喜欢克制地说惨，这比直接喊崩溃更像真实社交。"
    },
    {
      operatorId: "understatement",
      text: `问题不大，只是我和${motifs.stage}暂时不太熟。`,
      mechanism: "把失态写成关系不熟。",
      whyItWorks: "它保留了嘴硬感，让尴尬显得更生活化。"
    },
    {
      operatorId: "understatement",
      text: `还好，只是人生突然加载慢了两秒。`,
      mechanism: "把心理空白写成加载延迟。",
      whyItWorks: "轻微技术隐喻能表达那种当场卡住的羞耻感。"
    }
  ];
}

function objectTransfer(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  return [
    {
      operatorId: "object_transfer",
      text: `${motifs.triggerObject}动的不是现场，是${motifs.fragileAsset}。`,
      mechanism: "把外部事件转义成内部损失。",
      whyItWorks: "梗图好笑常来自转义：看起来是小事，其实伤的是身份感。"
    },
    {
      operatorId: "object_transfer",
      text: `我处理的是${motifs.triggerObject}，抢救的是${motifs.fragileAsset}。`,
      mechanism: "双宾语反差。",
      whyItWorks: "前半句像现实动作，后半句突然揭示真正的社交危机。"
    },
    {
      operatorId: "object_transfer",
      text: `${motifs.triggerObject}只是导火索，真正炸的是${motifs.fragileAsset}。`,
      mechanism: "把小事故升级成情绪事故。",
      whyItWorks: "它让用户立刻理解为什么这件小事会被放大。"
    }
  ];
}

function sceneSpecificPunchlines(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  if (motifs.triggerObject === "那杯饮料") {
    return [
      {
        operatorId: "object_transfer",
        text: "这下好了，心动变手抖了。",
        mechanism: "把暧昧期待转成身体失控。",
        whyItWorks: "它短、准、像评论区接话，抓住了喜欢的人面前越想稳越不稳。"
      },
      {
        operatorId: "object_transfer",
        text: "我本来想展示松弛感，结果展示了液体力学。",
        mechanism: "把人设展示错位成物理展示。",
        whyItWorks: "它用一本正经的词解释狼狈，制造轻微荒诞。"
      },
      {
        operatorId: "reverse_dignity",
        text: "那杯饮料洒的不是桌子，是我刚搭好的松弛感。",
        mechanism: "把饮料转义成约会人设。",
        whyItWorks: "好笑点在于真正损失的不是饮料，而是刚刚搭起来的体面。"
      }
    ];
  }

  if (motifs.triggerObject === "那条消息") {
    return [
      {
        operatorId: "future_cancellation",
        text: "我撤回的不是消息，是明天进公司的勇气。",
        mechanism: "把撤回动作转义成职场未来撤回。",
        whyItWorks: "它说中了发错群之后真正难的是第二天怎么出现。"
      },
      {
        operatorId: "social_protocol_bug",
        text: "工作群没有说话，但我的工牌已经开始发烫。",
        mechanism: "让沉默和工牌承担社交压力。",
        whyItWorks: "真正的社死常常发生在没人回复的时候。"
      }
    ];
  }

  if (motifs.triggerObject === "闹钟") {
    return [
      {
        operatorId: "fake_system_notice",
        text: "闹钟响了，但我的人生没有响应。",
        mechanism: "用系统无响应写周一开机失败。",
        whyItWorks: "它把周一上班的抗拒压缩成一个很熟悉的故障状态。"
      },
      {
        operatorId: "inner_monologue",
        text: "人到了工位，灵魂还在周日晚上赖床。",
        mechanism: "身体和灵魂错位。",
        whyItWorks: "这是打工人周一共同体感：到岗不等于上线。"
      }
    ];
  }

  if (motifs.triggerObject === "那个需求") {
    return [
      {
        operatorId: "micro_rebellion",
        text: "收到两个字发出去，我的下班已经查无此人。",
        mechanism: "把职业回复和下班消失并置。",
        whyItWorks: "临下班改需求的痛点不是需求本身，而是自由时间被抹掉。"
      }
    ];
  }

  if (motifs.triggerObject === "随便两个字") {
    return [
      {
        operatorId: "social_protocol_bug",
        text: "随便不是自由，是开卷考试。",
        mechanism: "把关系潜台词写成考试。",
        whyItWorks: "它抓住了「随便」里最中文的部分：看似没要求，其实全是要求。"
      }
    ];
  }

  if (motifs.triggerObject === "已读") {
    return [
      {
        operatorId: "inner_monologue",
        text: "已读两个字，比拒绝还会省略。",
        mechanism: "把沉默写成更高效的表达。",
        whyItWorks: "它说中了已读不回的痛点：没有内容，但信息量很大。"
      }
    ];
  }

  if (motifs.triggerObject === "亲戚的问题") {
    return [
      {
        operatorId: "social_protocol_bug",
        text: "过年回家三天，人生被亲戚做了四轮尽调。",
        mechanism: "把家庭寒暄错位成投资尽调。",
        whyItWorks: "亲戚盘问和尽调都关心收入、资产与未来，只是前者还会顺手给你夹菜。"
      },
      {
        operatorId: "fake_system_notice",
        text: "亲戚问一句工资，我的人生自动切换成答辩模式。",
        mechanism: "让普通问题触发正式答辩。",
        whyItWorks: "它说中了过年被盘问时那种必须现场汇报人生进度的压力。"
      }
    ];
  }

  if (motifs.triggerObject === "第一组动作") {
    return [
      {
        operatorId: "understatement",
        text: "我和自律的关系，属于办过卡但没官宣。",
        mechanism: "把健身计划写成暧昧关系。",
        whyItWorks: "办卡代表有过承诺，没官宣代表执行仍然很保守。"
      },
      {
        operatorId: "inner_monologue",
        text: "第一组还没做完，夜宵已经在脑内开庆功宴了。",
        mechanism: "努力刚开始，奖励先到场。",
        whyItWorks: "自律最生活化的落差，是消耗还没发生，补偿机制已经启动。"
      }
    ];
  }

  return [];
}

function getMetricUnit(fragileAsset: string): string {
  if (fragileAsset.includes("人设")) return "人设碎片";
  if (fragileAsset.includes("下班")) return "离职念头";
  if (fragileAsset.includes("自尊")) return "自尊碎片";
  if (fragileAsset.includes("周末")) return "怨气";
  if (fragileAsset.includes("体面")) return "体面碎片";
  return "心理弹窗";
}

function blameTheAbstract(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  return [
    {
      operatorId: "blame_the_abstract",
      text: `不是我失误，是命运把${motifs.stage}设成了公开处刑模式。`,
      mechanism: "把责任甩给命运和系统设置。",
      whyItWorks: "甩锅给抽象对象能保留当事人的可爱嘴硬。"
    },
    {
      operatorId: "blame_the_abstract",
      text: `建议人生以后给${motifs.triggerObject}加一个二次确认。`,
      mechanism: "把生活事故产品化。",
      whyItWorks: "二次确认是人人熟悉的数字产品经验，放到生活里会产生错位。"
    },
    {
      operatorId: "blame_the_abstract",
      text: `这不是意外，这是宇宙在测试我的${motifs.fragileAsset}抗压。`,
      mechanism: "把小场面写成宇宙级测试。",
      whyItWorks: "夸张但不攻击任何人，适合轻量传播。"
    }
  ];
}

function fakeSystemNotice(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  return [
    {
      operatorId: "fake_system_notice",
      text: `系统提示：${motifs.fragileAsset}不足，无法完成${motifs.socialProtocol}。`,
      mechanism: "把社交流程写成系统失败。",
      whyItWorks: "它把复杂的人情世故压缩成一个错误弹窗，适合视觉化。"
    },
    {
      operatorId: "fake_system_notice",
      text: `错误代码 404：未找到正常面对${motifs.triggerObject}的能力。`,
      mechanism: "技术错误码错位。",
      whyItWorks: "错误码天然适合表达「我卡住了」，也很适合程序员和打工人语境。"
    },
    {
      operatorId: "fake_system_notice",
      text: `通知：您的${motifs.fragileAsset}已自动进入维护模式。`,
      mechanism: "用公告腔写情绪维修。",
      whyItWorks: "正式语气和狼狈内容的冲突，会让句子更像梗图标题。"
    }
  ];
}

function socialProtocolBug(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  return [
    {
      operatorId: "social_protocol_bug",
      text: `${motifs.socialProtocol}执行失败，但我还在强行走流程。`,
      mechanism: "把社交礼仪写成流程 bug。",
      whyItWorks: "它抓住了中国式尴尬的核心：已经不自然了，但流程还得继续。"
    },
    {
      operatorId: "social_protocol_bug",
      text: `${motifs.authorityFigure}没为难我，是${motifs.stage}里的空气先开始为难我。`,
      mechanism: "让空气成为社交压力的代理人。",
      whyItWorks: "空气凝固是中文互联网表达尴尬的高频共识。"
    },
    {
      operatorId: "social_protocol_bug",
      text: `我不是不会处理${motifs.triggerObject}，我是不会处理大家都装没事。`,
      mechanism: "从事件本身转向社交余波。",
      whyItWorks: "真正尴尬的常常不是事故，而是事故后的共同表演。"
    }
  ];
}

function futureCancellation(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  return [
    {
      operatorId: "future_cancellation",
      text: `${motifs.triggerObject}出现的那一秒，我已经把后续人生剧情撤回了。`,
      mechanism: "把瞬间失态夸张成未来取消。",
      whyItWorks: "它把羞耻感里那种「我不想再出现」说得很准确。"
    },
    {
      operatorId: "future_cancellation",
      text: `我当时没有沉默，我是在和未来的自己解除绑定。`,
      mechanism: "把尴尬沉默转义成未来解绑。",
      whyItWorks: "这类抽象但具体的表达，很贴近中文评论区神回复。"
    },
    {
      operatorId: "future_cancellation",
      text: `${motifs.fragileAsset}当场递交了离场申请。`,
      mechanism: "拟人化抽象资产。",
      whyItWorks: "让尊严、人设或周末自己做决定，会有轻微荒诞感。"
    }
  ];
}

function microRebellion(analysis: LifeSceneAnalysis): PunchlineDraft[] {
  const { motifs } = analysis;

  return [
    {
      operatorId: "micro_rebellion",
      text: `我唯一的反抗，是把${motifs.publicAction}做得很没有灵魂。`,
      mechanism: "小到可怜的精神反抗。",
      whyItWorks: "打工和关系场景里，不能真的反抗时，微型反抗最有共鸣。"
    },
    {
      operatorId: "micro_rebellion",
      text: `我没有破防，我只是把${motifs.fragileAsset}调成了静音。`,
      mechanism: "嘴硬式自我保护。",
      whyItWorks: "否认破防本身就是破防，这种反说很像中文互联网语气。"
    },
    {
      operatorId: "micro_rebellion",
      text: `${motifs.stage}还在继续，我的灵魂已经提前下班。`,
      mechanism: "身体和灵魂分离。",
      whyItWorks: "这是打工人和社交尴尬都能共享的生活体感。"
    }
  ];
}

function applyTone(drafts: PunchlineDraft[], input: LifeSceneInput): PunchlineDraft[] {
  if (!input.tone && !input.platform) {
    return drafts;
  }

  return drafts.map((draft) => {
    if (input.tone === "soft") {
      return { ...draft, text: draft.text.replaceAll("公开处刑", "有点难收场") };
    }

    if (input.tone === "workplace") {
      return {
        ...draft,
        text: draft.text
          .replaceAll("人生", "工作流")
          .replaceAll("宇宙", "组织")
          .replaceAll("命运", "流程")
      };
    }

    return draft;
  });
}

function deduplicateDrafts(drafts: PunchlineDraft[]): PunchlineDraft[] {
  const seen = new Set<string>();
  const result: PunchlineDraft[] = [];

  for (const draft of drafts) {
    const key = draft.text.replace(/\s+/g, "");
    if (!seen.has(key)) {
      result.push(draft);
      seen.add(key);
    }
  }

  return result;
}
