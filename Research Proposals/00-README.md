# 中文幽默与 Meme 生成 Research Proposal 组合

版本：2026-08-08

## 1. 总体研究命题

本 proposal 包围绕一个共同判断展开：中文互联网幽默不只是语言表面的双关或反转，而是对真实生活中的关系、权力、体面、潜台词和微妙情绪进行压缩。模型只有先识别“大家都知道但没人明说”的社会事实，才有可能稳定写出贴近人的 Punchline，或构造图文之间真正有意义的反差。

建议把共享理论框架暂命名为 **Social-Affect Compression（社会情绪压缩）**：

```text
真实生活场景
-> 社会张力表示
-> 幽默意图与机制
-> 多样化候选
-> 受众偏好选择
-> 文字 Punchline / 图文 Meme
-> 人类反馈与持续学习
```

本目录包含 23 个可以独立立项、也可以组合投稿的研究方案：

- 8 个 Benchmark 方向。
- 4 个 Evaluation Harness 方向。
- 4 个生成方法方向。
- 4 个模型训练方向。
- 3 个 HCI 与产品研究方向。

## 2. Proposal 地图

| ID | 题目 | 类型 | 模态 | 首篇论文潜力 | 建议周期 |
| --- | --- | --- | --- | --- | --- |
| B01 | MemeLife-CN：中文日常生活幽默双轨基准 | Benchmark | 文字+图片 | S | 5-6 月 |
| B02 | PunchlineBench-CN：场景到包袱受控生成 | Benchmark | 文字 | S | 3-4 月 |
| B03 | AudienceLens-CN：受众偏好分布基准 | Benchmark | 文字+图片 | S | 4-5 月 |
| B04 | HumorRepair-CN：坏笑话诊断与最小修复 | Benchmark | 文字 | A | 3 月 |
| B05 | CultureDrift-CN：梗的新鲜度与文化漂移 | Benchmark | 文字+图片 | A | 4-6 月 |
| B06 | CrossModalGap-CN：图文互补与视觉隐喻 | Benchmark | 图片 Meme | S | 5-6 月 |
| B07 | OriginalityBench-CN：原创性与记忆复现 | Benchmark | 文字+图片 | A | 4 月 |
| B08 | BenignBoundary-CN：搞笑与安全的边界 | Benchmark | 文字+图片 | A | 4-5 月 |
| H01 | HumorArena-CN：人类成对偏好评测平台 | Harness | 文字+图片 | S | 2-3 月 |
| H02 | JudgeCal-CN：幽默 Judge 校准 Harness | Harness | 文字+图片 | S | 3-4 月 |
| H03 | PromptOpt-Humor：偏好驱动提示词优化 | Harness/方法 | 文字+图片 | A | 3 月 |
| H04 | AgentAblate：幽默 Agent 消融实验平台 | Harness | 文字+图片 | A | 2-3 月 |
| M01 | SocialTensionGraph：社会张力规划生成 | 生成方法 | 文字 | S | 4-5 月 |
| M02 | DualRenderer：共享意图的文字与图片生成 | 生成方法 | 文字+图片 | S | 5-6 月 |
| M03 | MechanismPortfolio：笑点机制组合与路由 | 生成方法 | 文字+图片 | A | 3-4 月 |
| M04 | CultureMemory-RAG：时效文化记忆生成 | 生成方法 | 文字+图片 | A | 4-5 月 |
| T01 | MemeWriter-SFT：认知策展与小模型蒸馏 | 模型训练 | 文字 | S | 4-6 月 |
| T02 | AudienceRanker：个性化幽默偏好模型 | 模型训练 | 文字+图片 | S | 4-5 月 |
| T03 | MemeVLM：中文图文反差多模态训练 | 模型训练 | 图片 Meme | S | 5-7 月 |
| T04 | ContinualCulture：文化漂移下的持续学习 | 模型训练 | 文字+图片 | A | 6-9 月 |
| P01 | CoLaugh：人机共同写梗交互研究 | HCI | 文字+图片 | A | 4-5 月 |
| P02 | ShareIntent：从“好笑”到真实传播行为 | HCI/产品 | 文字+图片 | S | 4-6 月 |
| P03 | GroupMeme：面向群体语境的幽默适配 | HCI/个性化 | 文字+图片 | A | 5-6 月 |

S 表示可作为主线长文；A 表示更适合作为独立短文、Findings、Workshop，或与其他方向组合。

## 3. 最推荐的四种组合

### 组合 A：旗舰论文

```text
B01 MemeLife-CN
+ M01 SocialTensionGraph
+ M02 DualRenderer
+ T02 AudienceRanker
+ H01/H02 评测基础设施
```

核心问题：显式建模中文生活中的社会张力，能否同时提升文字笑话和图片 Meme 的人类偏好？

可能题目：**From Awkwardness to Punchlines: Social-Affect Compression for Chinese Humor Generation**

### 组合 B：最快形成论文

```text
B02 PunchlineBench-CN
+ B04 HumorRepair-CN
+ H02 JudgeCal-CN
```

只做文字，数据与实验边界清楚，三个月左右可以形成完整技术报告或 Workshop/Findings 投稿。

### 组合 C：多模态主线

```text
B06 CrossModalGap-CN
+ M02 DualRenderer
+ T03 MemeVLM
```

核心问题：图像应该重复文字、承载表面含义，还是构成视觉隐喻？重点研究跨模态反差，而不是单纯提高图片美观度。

### 组合 D：产品与 HCI 主线

```text
B03 AudienceLens-CN
+ T02 AudienceRanker
+ P02 ShareIntent
+ P03 GroupMeme
```

核心问题：幽默偏好究竟是个人属性、群体属性，还是由具体关系场景临时决定？该组合最容易与现有网页真实用户反馈结合。

## 4. 六个月推荐执行顺序

| 月份 | 主要工作 | 研究产物 |
| --- | --- | --- |
| 第 1 月 | 冻结任务定义、标注手册与 500 场景 Pilot | 数据协议、Baseline、伦理与来源规范 |
| 第 2 月 | 上线 HumorArena-CN，收集成对偏好与失败原因 | 10K-20K 有效比较 |
| 第 3 月 | 完成文字 Benchmark、Judge 校准和 SocialTensionGraph 消融 | 第一版技术报告 |
| 第 4 月 | 上线模板 Meme 与原创反应图双路线 | 多模态候选与图文互补标注 |
| 第 5 月 | 训练 AudienceRanker、Writer SFT 或 MemeVLM | 模型与完整消融实验 |
| 第 6 月 | 母语者盲测、统计分析、数据卡、论文与 Demo | 可投稿稿件和公开研究包 |

建议第一阶段投入比例为文字 70%、图片 30%。文字路线先建立场景、社会情绪、偏好和原创性基础；图片路线复用同一份幽默意图，而不是另起一套无关系统。

## 5. 与当前仓库的衔接

当前工程已经具备以下研究资产：

- `src/generation/schemas.ts` 已表达公开目标、私人目标、社会规则、表面意义和真实潜台词。
- `src/data/emotion-taxonomy.ts` 已包含社死、羞耻、表面稳定、班味等中文生活情绪。
- `evals/humor-scenes.jsonl` 已有 100 个黄金场景。
- `/api/compare` 和网页反馈可以扩展为 HumorArena。
- `src/data/meme-formats.ts` 已定义聊天截图、反应图、伪弹窗和四格等 Meme 载体。
- 当前 Writer、Critic、Judge 和原创性门禁可以直接成为消融实验组件。

因此，不需要重建一套研究代码库。建议把产品流量同时变成研究数据，但必须加入明确同意、匿名化、退出机制和研究用途说明。

## 6. 共同质量原则

1. 不把商业平台笑话做同义改写后当原创数据。
2. 不把 LLM Judge 当作最终金标准。
3. 不把点赞率等同于幽默质量。
4. 不把所有标注者压缩成一个“平均中国人”。
5. 不让图片只是文字笑话的装饰性插图。
6. 不在没有稳定偏好数据前直接投入昂贵的 RL 训练。
7. 所有论文实验保留强模型直接提示作为必须超越的 Baseline。

详细的统一数据、统计和伦理协议见 [00-统一实验与数据协议.md](./00-统一实验与数据协议.md)。
