import type { OriginalJokeDraft } from "../humor/types.js";

export const originalJokeCorpus = [
  {
    id: "bowl-help",
    setup: [
      "一个乞丐端着破碗走到我跟前：“求求你，帮我个忙吧。”",
      "他的手一直在抖。我犹豫了一下，于是……"
    ],
    punchline: "帮他端了一会儿。",
    mechanismId: "literal_obedience",
    format: "story",
    topics: ["日常", "误解", "请求"],
    emotionalTruth: "人会用最省力的方式证明自己确实帮过忙。",
    expectedReading: "给钱或解决乞丐的困难。",
    revealedReading: "只替对方端住正在发抖的碗。",
    emoji: "🥣🫴",
    palette: "yellow",
    editorialScore: 96
  },
  {
    id: "push-project-forward",
    setup: [
      "老板在会上说：“这个项目进度太慢，你再往前推一推。”",
      "散会后我立刻执行。"
    ],
    punchline: "我把项目文件从桌面第五排拖到了第一排。",
    mechanismId: "literal_obedience",
    format: "story",
    topics: ["职场", "电脑", "执行"],
    emotionalTruth: "面对模糊指令，最低成本的完成方式最有诱惑力。",
    expectedReading: "推进项目进度。",
    revealedReading: "只移动电脑桌面上的文件位置。",
    emoji: "🗂️➡️",
    palette: "blue",
    editorialScore: 94
  },
  {
    id: "steady-customer",
    setup: [
      "主管指着会议室说：“这个客户情绪很大，你先进去稳住他。”",
      "我推门进去，发现他正在拍桌子。"
    ],
    punchline: "我赶紧扶住了他的椅子。",
    mechanismId: "literal_obedience",
    format: "story",
    topics: ["职场", "客户", "误解"],
    emotionalTruth: "很多职场任务只要按字面完成，就会显得异常轻松。",
    expectedReading: "安抚客户情绪。",
    revealedReading: "只让客户坐得更稳。",
    emoji: "🪑😤",
    palette: "coral",
    editorialScore: 91
  },
  {
    id: "eight-hour-sleep",
    setup: ["医生叮嘱我：“每天一定要睡够八小时。”", "我严格执行了一个月。"],
    punchline: "上班睡六小时，回家再补两小时。",
    mechanismId: "literal_obedience",
    format: "observation",
    topics: ["上班", "健康", "偷懒"],
    emotionalTruth: "成年人擅长让健康建议适配工作，而不是让工作适配健康。",
    expectedReading: "夜间获得连续且健康的睡眠。",
    revealedReading: "把工作时间也算进睡眠指标。",
    emoji: "😴🕗",
    palette: "lime",
    editorialScore: 90
  },
  {
    id: "watch-the-pot",
    setup: [
      "室友做饭做到一半去接电话，临走前说：“帮我盯一下锅。”",
      "十分钟后他冲回来，锅已经糊了。"
    ],
    punchline: "我没眨眼，确实一直盯着。",
    mechanismId: "literal_obedience",
    format: "story",
    topics: ["室友", "做饭", "误解"],
    emotionalTruth: "形式上的负责，常常比真正解决问题容易。",
    expectedReading: "照看锅并防止烧糊。",
    revealedReading: "只保持视觉注视。",
    emoji: "🍳👀",
    palette: "coral",
    editorialScore: 89
  },
  {
    id: "help-cover-bill",
    setup: [
      "结账时朋友小声说：“我钱不够，你先帮我垫一下。”",
      "我点点头，抽出一张纸巾。"
    ],
    punchline: "垫在了他那把晃动的椅子下面。",
    mechanismId: "literal_obedience",
    format: "story",
    topics: ["朋友", "吃饭", "没钱"],
    emotionalTruth: "朋友之间最考验理解力的时刻，往往发生在结账时。",
    expectedReading: "先替朋友支付饭钱。",
    revealedReading: "给椅子脚加了垫片。",
    emoji: "🧾🪑",
    palette: "yellow",
    editorialScore: 90
  },

  {
    id: "confident-dancer",
    setup: [
      "我让一个小男孩跳个舞，他怯生生地说：“我不会……”",
      "我鼓励他：“男孩子要自信一点，大胆一点！”"
    ],
    punchline: "他抬起头：“老子不会！”",
    mechanismId: "confidence_only",
    format: "dialogue",
    topics: ["小朋友", "自信", "教育"],
    emotionalTruth: "鼓励有时只改变表达方式，不改变事实。",
    expectedReading: "孩子鼓起勇气开始跳舞。",
    revealedReading: "孩子只把不会说得更有气势。",
    emoji: "🕺😤",
    palette: "coral",
    editorialScore: 97
  },
  {
    id: "confident-intern",
    setup: [
      "实习生汇报时一直说“可能、大概、也许”。",
      "领导鼓励他：“年轻人说话要自信！”"
    ],
    punchline: "他清了清嗓子：“这个方案肯定做不完。”",
    mechanismId: "confidence_only",
    format: "dialogue",
    topics: ["职场", "实习生", "自信"],
    emotionalTruth: "自信不一定服务于积极结论。",
    expectedReading: "实习生更坚定地承诺完成方案。",
    revealedReading: "实习生坚定地拒绝了方案的可行性。",
    emoji: "📊✅",
    palette: "blue",
    editorialScore: 95
  },
  {
    id: "confident-singer",
    setup: [
      "音乐老师问小朋友为什么不开口唱歌。",
      "他说怕跑调。老师鼓励：“自信一点，别怕别人评价。”"
    ],
    punchline: "他拿起话筒：“那接下来该怕的是你们。”",
    mechanismId: "confidence_only",
    format: "dialogue",
    topics: ["小朋友", "唱歌", "自信"],
    emotionalTruth: "当羞耻感消失，风险会转移给围观的人。",
    expectedReading: "孩子克服紧张并正常演唱。",
    revealedReading: "孩子接受了跑调，只把后果交给听众。",
    emoji: "🎤😎",
    palette: "lime",
    editorialScore: 94
  },
  {
    id: "confident-math",
    setup: [
      "老师问：“这道题谁不会？”一个小朋友怯生生地举手。",
      "老师说：“不会没关系，回答要有底气。”"
    ],
    punchline: "他站起来：“这题肯定超纲了，不可能是我的问题。”",
    mechanismId: "confidence_only",
    format: "dialogue",
    topics: ["学校", "数学", "自信"],
    emotionalTruth: "过量的自信，最先学会的是重新分配责任。",
    expectedReading: "学生坦然承认自己不会。",
    revealedReading: "学生把不会归因给题目。",
    emoji: "➗😤",
    palette: "yellow",
    editorialScore: 91
  },
  {
    id: "confident-swimmer",
    setup: [
      "教练问小朋友为什么不下水，他小声说：“我不会游泳。”",
      "教练鼓励：“别怕，要相信自己。”"
    ],
    punchline: "他坚定地点头：“我相信自己下去就沉。”",
    mechanismId: "confidence_only",
    format: "dialogue",
    topics: ["小朋友", "游泳", "自信"],
    emotionalTruth: "相信自己也可以是对失败概率的准确判断。",
    expectedReading: "孩子相信自己能够游泳。",
    revealedReading: "孩子更坚定地相信自己不会游泳。",
    emoji: "🏊‍♂️⬇️",
    palette: "blue",
    editorialScore: 93
  },
  {
    id: "confident-job-hunter",
    setup: [
      "朋友看着招聘要求说：“我经验不够，还是不投了。”",
      "我劝他：“找工作要自信，别先否定自己。”"
    ],
    punchline: "他点点头：“对，是这家公司配不上我。”",
    mechanismId: "confidence_only",
    format: "dialogue",
    topics: ["求职", "朋友", "自信"],
    emotionalTruth: "自信最快的增长方式，是把审核方向调转过来。",
    expectedReading: "朋友鼓起勇气投递简历。",
    revealedReading: "朋友直接把自己从被筛选者改成筛选者。",
    emoji: "💼😌",
    palette: "lime",
    editorialScore: 90
  },

  {
    id: "salary-pressure-test",
    setup: ["面试官问：“你的抗压能力怎么样？”", "我说很强，他不信。"],
    punchline: "直到他把工资说出来，我面不改色地听完了。",
    mechanismId: "context_reveal",
    format: "story",
    topics: ["面试", "工资", "职场"],
    emotionalTruth: "低工资是求职者最真实的压力测试。",
    expectedReading: "面试官会用工作难题测试抗压。",
    revealedReading: "工资数字本身就是压力。",
    emoji: "💰🙂",
    palette: "yellow",
    editorialScore: 96
  },
  {
    id: "only-honest-strength",
    setup: ["朋友说我最大的优点是真诚。", "我有点感动，问他：“还有吗？”"],
    punchline: "他真诚地摇了摇头。",
    mechanismId: "context_reveal",
    format: "dialogue",
    topics: ["朋友", "自嘲", "真诚"],
    emotionalTruth: "赞美最经不起追问，尤其当赞美内容是真诚。",
    expectedReading: "朋友会继续列举更多优点。",
    revealedReading: "朋友用真诚证明这就是唯一的优点。",
    emoji: "🙂↔️",
    palette: "coral",
    editorialScore: 95
  },
  {
    id: "one-equals-three",
    setup: ["领导表扬我：“你一个人能顶三个人。”", "我正准备谦虚。"],
    punchline: "人事通知，那三个人下周不用来了。",
    mechanismId: "context_reveal",
    format: "story",
    topics: ["职场", "裁员", "表扬"],
    emotionalTruth: "职场表扬有时只是成本优化的前摇。",
    expectedReading: "领导夸奖能力突出。",
    revealedReading: "夸奖是为了让一个人承担三份工作。",
    emoji: "👤×3",
    palette: "blue",
    editorialScore: 94
  },
  {
    id: "fitness-tutorial",
    setup: [
      "健身教练说我动作特别标准，很适合拍教学视频。",
      "我刚准备感谢他。"
    ],
    punchline: "他说：“标题就叫《新手常见的十个错误》。”",
    mechanismId: "context_reveal",
    format: "dialogue",
    topics: ["健身", "新手", "误会"],
    emotionalTruth: "一句话里的表扬，可能只是你提前猜错了视频类型。",
    expectedReading: "动作标准到可以做正面示范。",
    revealedReading: "动作标准地覆盖了多种错误。",
    emoji: "🏋️‍♀️🔟",
    palette: "lime",
    editorialScore: 95
  },
  {
    id: "teacher-progress",
    setup: [
      "老师说孩子这学期进步很大。",
      "家长激动地问：“从多少名进步到多少名？”"
    ],
    punchline: "“从最后一名到倒数第二，班里转来一个新同学。”",
    mechanismId: "context_reveal",
    format: "dialogue",
    topics: ["学校", "成绩", "家长"],
    emotionalTruth: "排名进步既可以靠自己，也可以靠环境变化。",
    expectedReading: "孩子成绩真实提升。",
    revealedReading: "名次变化来自更差的新同学。",
    emoji: "📚⬆️",
    palette: "yellow",
    editorialScore: 91
  },
  {
    id: "quiet-stable-date",
    setup: [
      "她说喜欢成熟稳重的男生。",
      "我立刻闭嘴，整顿饭一句话都没说。"
    ],
    punchline: "没话说的人，看起来确实很稳定。",
    mechanismId: "context_reveal",
    format: "observation",
    topics: ["约会", "社交", "人设"],
    emotionalTruth: "不会聊天和成熟稳重，在安静时长得很像。",
    expectedReading: "男生会展示成熟的谈吐和判断。",
    revealedReading: "男生通过沉默伪装稳定。",
    emoji: "🍽️🤐",
    palette: "coral",
    editorialScore: 92
  },

  {
    id: "ai-execution-folder",
    setup: ["我问 AI 怎么提高执行力，它列了十条建议。", "我从头到尾认真看完。"],
    punchline: "然后郑重地收藏进了“以后再看”。",
    mechanismId: "logic_overextension",
    format: "observation",
    topics: ["AI", "拖延", "执行力"],
    emotionalTruth: "收藏建议很像行动，因此特别容易替代行动。",
    expectedReading: "读完建议后立刻开始执行。",
    revealedReading: "把建议归档成未来的拖延材料。",
    emoji: "🤖🔖",
    palette: "blue",
    editorialScore: 95
  },
  {
    id: "screen-time-counterattack",
    setup: ["手机每天提醒我：本周屏幕使用时间又增加了。", "我觉得它有点冒犯。"],
    punchline: "我都没提醒它电池健康又下降了。",
    mechanismId: "logic_overextension",
    format: "observation",
    topics: ["手机", "屏幕时间", "互相伤害"],
    emotionalTruth: "被设备量化的人，也想反过来评价设备。",
    expectedReading: "用户接受手机给出的健康提醒。",
    revealedReading: "用户把手机当成同样经不起评价的关系对象。",
    emoji: "📱🪫",
    palette: "lime",
    editorialScore: 96
  },
  {
    id: "failure-family-title",
    setup: ["都说失败是成功之母。", "我失败了这么多次，按辈分算……"],
    punchline: "成功至少该叫我一声大哥。",
    mechanismId: "logic_overextension",
    format: "observation",
    topics: ["失败", "成功", "自嘲"],
    emotionalTruth: "鸡汤一旦严格按亲属关系推导，就会失去教育意义。",
    expectedReading: "失败最终孕育成功。",
    revealedReading: "大量失败被误算成成功的长辈。",
    emoji: "📉👨‍👦",
    palette: "yellow",
    editorialScore: 91
  },
  {
    id: "body-temperature-delivery",
    setup: ["天气软件说今天“体感温度”四十度。", "我出门却没什么感觉。"],
    punchline: "可能我的体感还堵在早高峰。",
    mechanismId: "logic_overextension",
    format: "observation",
    topics: ["天气", "通勤", "城市"],
    emotionalTruth: "城市生活里，连感觉都像需要配送。",
    expectedReading: "体感温度是身体对天气的主观感受。",
    revealedReading: "把体感当成尚未抵达的通勤者。",
    emoji: "🌡️🚇",
    palette: "coral",
    editorialScore: 89
  },
  {
    id: "human-battery",
    setup: [
      "手机只剩 1% 的电，还能坚持十分钟。",
      "我满格电去上班，九点零五就不想动了。"
    ],
    punchline: "现在看，真正该换电池的是我。",
    mechanismId: "logic_overextension",
    format: "observation",
    topics: ["上班", "手机", "疲惫"],
    emotionalTruth: "人的工作电量往往比设备更虚。",
    expectedReading: "低电量手机需要更换电池。",
    revealedReading: "满电却不想工作的人更像故障设备。",
    emoji: "🔋🫠",
    palette: "lime",
    editorialScore: 94
  },
  {
    id: "problems-not-overnight",
    setup: ["领导教育我：“今天的问题不要留到明天。”", "我牢牢记住了。"],
    punchline: "所以每次遇到问题，我都熬到天亮。",
    mechanismId: "logic_overextension",
    format: "observation",
    topics: ["职场", "熬夜", "问题"],
    emotionalTruth: "解决不了问题时，改变日期边界是最简单的办法。",
    expectedReading: "当日解决问题。",
    revealedReading: "通过不睡觉让问题无法跨过自己的夜晚。",
    emoji: "🌙💻",
    palette: "blue",
    editorialScore: 95
  },

  {
    id: "growth-versus-salary",
    setup: [
      "老板说：“年轻人别总谈钱，要多谈成长。”",
      "我虚心请教：“那工资什么时候成长？”"
    ],
    punchline: "他说：“很好，你已经学会提出有挑战的问题了。”",
    mechanismId: "social_subtext",
    format: "dialogue",
    topics: ["职场", "工资", "成长"],
    emotionalTruth: "公司愿意提供抽象成长，员工想要具体增长。",
    expectedReading: "老板会解释成长如何带来收入。",
    revealedReading: "老板把追问本身也包装成成长。",
    emoji: "🌱💰",
    palette: "lime",
    editorialScore: 97
  },
  {
    id: "company-as-home",
    setup: [
      "领导说：“大家要把公司当成自己的家。”",
      "我听完很感动，第二天十点才到。"
    ],
    punchline: "毕竟我在自己家一般十点才起。",
    mechanismId: "social_subtext",
    format: "story",
    topics: ["职场", "迟到", "公司文化"],
    emotionalTruth: "公司喜欢家庭的奉献感，却不喜欢家庭的松弛感。",
    expectedReading: "员工会像对家庭一样无私奉献。",
    revealedReading: "员工采用了在家作息。",
    emoji: "🏠🕙",
    palette: "yellow",
    editorialScore: 94
  },
  {
    id: "salary-enough-for-whom",
    setup: ["过年亲戚问我工资多少，我说：“够花。”", "她追问：“够谁花？”"],
    punchline: "我说：“够老板花。”",
    mechanismId: "social_subtext",
    format: "dialogue",
    topics: ["过年", "亲戚", "工资"],
    emotionalTruth: "工资是否够花，取决于站在哪一边看成本。",
    expectedReading: "工资足够本人生活。",
    revealedReading: "低工资只对老板的成本预算足够。",
    emoji: "🧧💸",
    palette: "coral",
    editorialScore: 95
  },
  {
    id: "no-next-dinner",
    setup: ["朋友每次见面都说：“下次一定请你吃饭。”"],
    punchline: "我们的友谊能维持这么久，主要是一直没有下次。",
    mechanismId: "social_subtext",
    format: "observation",
    topics: ["朋友", "请客", "承诺"],
    emotionalTruth: "很多社交承诺靠永不兑现来保持完美。",
    expectedReading: "朋友将在下一次见面请客。",
    revealedReading: "所谓下次被无限延期。",
    emoji: "🍜📅",
    palette: "yellow",
    editorialScore: 93
  },
  {
    id: "ability-never-seen",
    setup: [
      "招聘启事写：“我们不看学历，只看能力。”",
      "我投完简历，很快收到拒信。"
    ],
    punchline: "看来他们连能力也不打算看。",
    mechanismId: "social_subtext",
    format: "observation",
    topics: ["招聘", "学历", "能力"],
    emotionalTruth: "开放姿态如果没有评估机会，只是一句宣传。",
    expectedReading: "招聘方会跳过学历认真评估能力。",
    revealedReading: "简历阶段就拒绝，能力没有展示机会。",
    emoji: "📄🚫",
    palette: "blue",
    editorialScore: 94
  },
  {
    id: "birthday-heart-shipping",
    setup: [
      "对象说：“生日真的不用准备礼物，心意到了就行。”",
      "我决定尊重她的表达，空着手去了。"
    ],
    punchline: "她看着我：“你的心意是走的物流吗？”",
    mechanismId: "social_subtext",
    format: "dialogue",
    topics: ["恋爱", "生日", "潜台词"],
    emotionalTruth: "亲密关系里的不用，通常是在考察你是否听得懂。",
    expectedReading: "没有礼物也会被接受。",
    revealedReading: "心意仍然需要物质载体。",
    emoji: "🎁🚚",
    palette: "coral",
    editorialScore: 96
  },

  {
    id: "silent-adult-collapse",
    setup: ["朋友圈有人写：“成年人的崩溃，往往悄无声息。”"],
    punchline: "也不全是，信用卡扣款会发短信。",
    mechanismId: "commentary_tag",
    format: "comment",
    topics: ["成年人", "信用卡", "崩溃"],
    emotionalTruth: "成年人的情绪很安静，账单系统很敬业。",
    expectedReading: "崩溃只发生在人的内心。",
    revealedReading: "导致崩溃的账单会主动制造声音。",
    emoji: "💳📳",
    palette: "blue",
    editorialScore: 97
  },
  {
    id: "habit-of-delay",
    setup: ["健身博主说：“坚持二十一天，一件事就会变成习惯。”"],
    punchline: "难怪我拖延了二十一年，现在这么熟练。",
    mechanismId: "commentary_tag",
    format: "comment",
    topics: ["拖延", "健身", "习惯"],
    emotionalTruth: "坏习惯同样满足励志理论的训练周期。",
    expectedReading: "坚持用于建立积极习惯。",
    revealedReading: "拖延也因长期坚持而熟练。",
    emoji: "📆🛋️",
    palette: "lime",
    editorialScore: 96
  },
  {
    id: "love-waits-downstairs",
    setup: ["情感博主说：“真正爱你的人，不会让你一直等。”"],
    punchline: "外卖员会，他在楼下等你下楼。",
    mechanismId: "commentary_tag",
    format: "comment",
    topics: ["恋爱", "外卖", "等待"],
    emotionalTruth: "最稳定的等待往往来自服务流程，而不是浪漫关系。",
    expectedReading: "爱你的人会及时回应。",
    revealedReading: "真正等待你的是履约中的外卖员。",
    emoji: "❤️🛵",
    palette: "coral",
    editorialScore: 94
  },
  {
    id: "better-self-dark-circles",
    setup: ["有人说：“读书是为了遇见更好的自己。”"],
    punchline: "我读到凌晨两点，只遇见了黑眼圈版本。",
    mechanismId: "commentary_tag",
    format: "comment",
    topics: ["读书", "熬夜", "自我提升"],
    emotionalTruth: "提升自己之前，身体会先生成一个疲惫版本。",
    expectedReading: "阅读带来人格和能力提升。",
    revealedReading: "熬夜阅读只带来外观变化。",
    emoji: "📖🐼",
    palette: "yellow",
    editorialScore: 91
  },
  {
    id: "early-sleep-original-hardware",
    setup: ["养生博主说：“早睡的人，第二天会拥有全新的自己。”"],
    punchline: "我试过，还是原装，只是开机早了点。",
    mechanismId: "commentary_tag",
    format: "comment",
    topics: ["早睡", "养生", "自嘲"],
    emotionalTruth: "生活方式改变不了硬件，只能调整开机时间。",
    expectedReading: "早睡让人精神和状态焕然一新。",
    revealedReading: "人没有改变，只是醒得更早。",
    emoji: "🛌⏰",
    palette: "lime",
    editorialScore: 93
  },
  {
    id: "money-exercises-fast",
    setup: ["理财博主说：“不要让钱躺在账户里睡觉。”"],
    punchline: "放心，我的钱一到账就出去运动了。",
    mechanismId: "commentary_tag",
    format: "comment",
    topics: ["理财", "工资", "消费"],
    emotionalTruth: "月光也可以被包装成极高的资金流动性。",
    expectedReading: "让钱通过投资产生收益。",
    revealedReading: "钱因消费迅速离开账户。",
    emoji: "💸🏃",
    palette: "yellow",
    editorialScore: 92
  },

  {
    id: "elastic-work-hours",
    setup: ["公司宣布实行弹性工作制。", "体验一周后我明白了。"],
    punchline: "弹的是下班时间，工作量负责保持刚性。",
    mechanismId: "bureaucratic_translation",
    format: "observation",
    topics: ["职场", "加班", "制度"],
    emotionalTruth: "很多灵活制度只让企业获得灵活。",
    expectedReading: "员工能自由调整上下班时间。",
    revealedReading: "只有下班不断延后，工作量不减少。",
    emoji: "🕕🪀",
    palette: "blue",
    editorialScore: 97
  },
  {
    id: "meeting-animation",
    setup: ["同事问我为什么开会时一直点头。"],
    punchline: "这是最低成本的参会动画。",
    mechanismId: "bureaucratic_translation",
    format: "observation",
    topics: ["职场", "开会", "摸鱼"],
    emotionalTruth: "会议参与感有时只需要一个循环动作。",
    expectedReading: "点头表示持续理解和认同。",
    revealedReading: "点头只是维持在线状态的视觉效果。",
    emoji: "🙂🔁",
    palette: "lime",
    editorialScore: 94
  },
  {
    id: "open-the-pattern",
    setup: ["老板让我把格局打开。", "我打开了招聘软件。"],
    punchline: "他说：“这个格局怎么全是同行？”",
    mechanismId: "bureaucratic_translation",
    format: "dialogue",
    topics: ["职场", "跳槽", "老板"],
    emotionalTruth: "员工真正能打开的格局，往往是外部机会。",
    expectedReading: "员工提升视野与责任感。",
    revealedReading: "员工开始查看同行职位。",
    emoji: "🔓💼",
    palette: "coral",
    editorialScore: 96
  },
  {
    id: "ai-meeting-summary",
    setup: ["AI 帮我总结了一小时会议。", "它分析了十七页记录，最后输出四个字。"],
    punchline: "“下次再议。”它终于理解公司文化了。",
    mechanismId: "bureaucratic_translation",
    format: "story",
    topics: ["AI", "职场", "会议"],
    emotionalTruth: "很多会议的信息密度，最终只够延期一个决定。",
    expectedReading: "AI会提炼出清晰结论和行动项。",
    revealedReading: "会议没有结论，AI只能精准复刻拖延。",
    emoji: "🤖📝",
    palette: "blue",
    editorialScore: 96
  },
  {
    id: "value-in-thanks",
    setup: [
      "公司年会说：“感谢每一位同事为公司创造价值。”",
      "我低头看了看奖金。"
    ],
    punchline: "终于明白，我的价值主要体现在感谢里。",
    mechanismId: "bureaucratic_translation",
    format: "observation",
    topics: ["职场", "年会", "奖金"],
    emotionalTruth: "精神认可越充足，越容易让人注意物质回报的空缺。",
    expectedReading: "创造的价值会反映在奖金中。",
    revealedReading: "公司只提供口头感谢。",
    emoji: "👏🧧",
    palette: "yellow",
    editorialScore: 94
  },
  {
    id: "principle-leaves-on-time",
    setup: ["公司通知：“原则上不鼓励加班。”", "我观察了一周。"],
    punchline: "每天准时下班的只有原则。",
    mechanismId: "bureaucratic_translation",
    format: "observation",
    topics: ["职场", "加班", "原则"],
    emotionalTruth: "制度里的原则，经常不和员工执行同一套考勤。",
    expectedReading: "公司会减少加班。",
    revealedReading: "原则存在于通知中，员工继续加班。",
    emoji: "📢🌙",
    palette: "coral",
    editorialScore: 97
  },

  {
    id: "parents-other-kids",
    setup: [
      "我妈说：“你看看别人家的孩子，都买房了。”",
      "我提醒她：“别人家的妈妈也没催我。”"
    ],
    punchline: "她想了想，转头去催别人家的孩子了。",
    mechanismId: "status_reversal",
    format: "story",
    topics: ["家庭", "买房", "催促"],
    emotionalTruth: "比较逻辑一旦对称使用，责任会流向意想不到的人。",
    expectedReading: "妈妈停止拿别人家的孩子比较。",
    revealedReading: "妈妈扩张了自己的催促范围。",
    emoji: "🏠📣",
    palette: "yellow",
    editorialScore: 93
  },
  {
    id: "dad-real-life-friends",
    setup: [
      "我爸说手机里没有真朋友，让我多出门和人交流。",
      "我刚走到楼下，他就发来消息。"
    ],
    punchline: "“回来时带瓶酱油。”",
    mechanismId: "status_reversal",
    format: "story",
    topics: ["家庭", "手机", "跑腿"],
    emotionalTruth: "家长鼓励你走向现实，现实通常顺便安排你买东西。",
    expectedReading: "父亲希望孩子获得真实社交。",
    revealedReading: "出门立即被家庭任务征用。",
    emoji: "📱🧂",
    palette: "blue",
    editorialScore: 90
  },
  {
    id: "where-is-life",
    setup: [
      "我妈问工资都去哪了。我说：“花在提升生活质量上了。”",
      "她翻了翻我的外卖订单。"
    ],
    punchline: "“质量是上去了，生活呢？”",
    mechanismId: "status_reversal",
    format: "dialogue",
    topics: ["家庭", "工资", "外卖"],
    emotionalTruth: "消费能改善一顿饭，却不一定能改善整体生活。",
    expectedReading: "外卖消费证明生活品质提升。",
    revealedReading: "母亲质疑生活本体是否存在。",
    emoji: "🥡💸",
    palette: "coral",
    editorialScore: 93
  },
  {
    id: "cat-property-manager",
    setup: [
      "我每天给猫铲屎、添粮、开罐头。",
      "朋友问我是不是很享受当主人。"
    ],
    punchline: "我说你误会了，我是它的物业。",
    mechanismId: "status_reversal",
    format: "observation",
    topics: ["宠物", "猫", "服务"],
    emotionalTruth: "资源和服务的流向，比名义更能决定谁是主人。",
    expectedReading: "人拥有并照顾宠物。",
    revealedReading: "人更像为猫提供全天服务的物业。",
    emoji: "🐈🧹",
    palette: "lime",
    editorialScore: 95
  },
  {
    id: "important-versus-solved",
    setup: [
      "客服说：“您的问题我们非常重视。”",
      "我问：“那什么时候解决？”"
    ],
    punchline: "她说：“重视和解决属于两个部门。”",
    mechanismId: "status_reversal",
    format: "dialogue",
    topics: ["客服", "流程", "问题"],
    emotionalTruth: "被重视是一种态度，被解决才是一种服务。",
    expectedReading: "重视意味着问题会被优先解决。",
    revealedReading: "组织流程把态度和结果彻底分开。",
    emoji: "🎧🏢",
    palette: "blue",
    editorialScore: 97
  },
  {
    id: "adult-homework",
    setup: [
      "小朋友写作业时叹气：“为什么大人不用写作业？”",
      "我说：“大人也有，只是不叫作业。”"
    ],
    punchline: "叫“下班前发我”。",
    mechanismId: "status_reversal",
    format: "dialogue",
    topics: ["小朋友", "作业", "职场"],
    emotionalTruth: "成年人的作业没有课代表，只有截止时间。",
    expectedReading: "成年人已经摆脱学校作业。",
    revealedReading: "工作任务是改名后的作业。",
    emoji: "📚💻",
    palette: "yellow",
    editorialScore: 98
  }
] satisfies OriginalJokeDraft[];
