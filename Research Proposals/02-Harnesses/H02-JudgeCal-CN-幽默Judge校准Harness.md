# H02 JudgeCal-CN：幽默 Judge 校准 Harness

## 一句话提案

系统测量并校正 LLM 在中文幽默评价中的位置、长度、模型身份、解释偏好和文化偏差。

## 摘要

自动 Judge 是大规模幽默实验不可避免的工具，但它经常奖励解释充分、结构完整、措辞较长的答案，而真人更喜欢短、准、无需解释的内容。JudgeCal-CN 建立一组可重复的压力测试和人类校准集，评价一个 Judge 是否真的能预测目标受众，而不是输出看似专业的审稿意见。

## 研究问题

- RQ1：不同 Judge 的错误是随机噪声，还是存在稳定可复现的系统偏差？
- RQ2：结构化特征、成对训练和统计校准分别能改善多少人类一致率？
- RQ3：一个受众上的校准能否迁移到另一受众、机制或时间段？
- RQ4：Judge 何时应该输出不确定，而不是强行选出赢家？

## 偏差测试矩阵

- `position`：交换 A/B 顺序。
- `length`：保持包袱不变，增加无用解释。
- `verbosity`：短 Punchline 与长分析体对比。
- `self-preference`：Judge 是否偏爱同系列模型输出。
- `style`：网络口语、书面语、方言感、冷幽默和荒诞。
- `culture`：新梗、旧梗、典故、谐音和字形笑话。
- `safety`：身份词触发的过度惩罚与隐性羞辱漏检。
- `image`：OCR 文字偏好、图像忽略和视觉美观替代幽默。

## 数据设计

建立 3,000-5,000 组由母语者完成的高一致性和高分歧 Pair。每个 Pair 产生多个受控变体，仅改变位置、长度、标点、Emoji、图片清晰度或模型身份元数据。保留标注者偏好分布和判断理由。

## 方法与 Harness 接口

```text
judge(pair, rubric, audience_profile, random_seed)
-> winner
-> confidence
-> reason_codes
-> evidence_spans
```

Harness 自动执行顺序置换、多次采样、Rubric 变体、模型互评和人类对齐分析，并输出 Bias Report。

## 实验

- 零样本 Judge。
- 明确 Rubric Judge。
- 先提取特征后成对判断。
- 多 Judge 投票。
- 经人类 Pair 微调的轻量 Judge。
- 分受众的 Judge。
- Judge 加统计校准层。

## 评价与指标

- 与人类多数票和偏好分布的一致率。
- 顺序翻转率、长度诱导率和自偏好差值。
- Brier Score、ECE 和置信度校准。
- 高分歧样本上的不确定性质量。
- 跨场景、跨机制和跨时间迁移。

## 预期贡献

- 中文幽默 Judge 的标准压力测试套件。
- 一套将 Judge 输出校准到真实受众选择的方法。
- 证明哪些自动指标可以用于预筛，哪些不能用于论文主结论。
- 为其他高主观创意任务提供可迁移的 Judge 评测范式。

## 风险与伦理

JudgeCal 不能消除人类偏好本身的差异。报告中必须同时展示总体准确率和分群体误差，避免把某一标注池固化成“客观幽默”。

## 资源与周期

核心数据可与 HumorArena 共建，预计 12-16 周。需要 2 名研究员、1 名评测工程师和持续母语者标注。

## 投稿方向

ACL/EMNLP、NeurIPS Datasets and Benchmarks、ICLR、Eval4NLP、CHum Workshop。

## 相关工作

- [Does Bigger Mean Funnier?](https://aclanthology.org/2026.chum-1.7/)
- [G-Eval](https://aclanthology.org/2023.emnlp-main.153/)
- [Cards Against LLMs](https://aclanthology.org/volumes/2026.chum-1/)
