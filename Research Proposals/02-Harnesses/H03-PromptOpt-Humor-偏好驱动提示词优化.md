# H03 PromptOpt-Humor：偏好驱动提示词优化 Harness

## 一句话提案

使用少量人类成对反馈自动优化幽默 Prompt、结构计划和图片提示词，并研究优化结果能否跨场景与模型迁移。

## 摘要

提示词通常由工程师凭经验反复修改，结果难以复现，也容易针对少数例子过拟合。PromptOpt-Humor 将 Prompt 视为可搜索策略，以人类或校准 Judge 的成对偏好作为目标，在严格测试集上自动提出、变异和淘汰 Prompt。优化对象不仅是 System Prompt，也包括机制分配、候选数量、Critic Rubric、图片描述和排版策略。

## 研究问题

- RQ1：偏好驱动优化能否比人工 Prompt 工程更快获得稳定收益？
- RQ2：为“好笑”优化是否牺牲原创性、安全、成本和多样性？
- RQ3：Prompt 在不同模型、场景和受众之间有多大可迁移性？
- RQ4：文字 Prompt 与图片 Prompt 应独立优化，还是围绕共享幽默意图联合优化？

## 方法与 Harness 设计

```text
Prompt Genome
-> Candidate Prompt Population
-> Fixed Scene Batch
-> Content Generation
-> Pairwise Evaluation
-> Credit Assignment
-> Mutation / Crossover / Rewrite
-> Held-out Validation
```

`Prompt Genome` 分为场景分析、联想发散、机制选择、Writer、Critic、Ranker、视觉计划和图片提示八个模块，使优化可以定位到具体环节。

## 优化算法

- 随机搜索和人工 Prompt 作为基线。
- 多臂老虎机或 Dueling Bandit。
- 贝叶斯偏好优化。
- LLM 提议变体加锦标赛选择。
- APOHF 类人类偏好优化。
- 多目标 Pareto 搜索，同时约束成本、安全和原创性。

## 数据与实验

使用固定训练场景、验证场景和完全隔离测试场景。每轮只允许有限反馈预算，例如 50、100、250、500 次 Pair，绘制质量随反馈数量的学习曲线。测试 Prompt 从强闭源模型迁移到开源 7B/14B 模型，以及中文文字 Prompt 对图片 Meme 规划的迁移。

## 评价与指标

- 测试集人类成对胜率。
- 反馈效率和达到目标胜率所需 Pair 数。
- 跨模型、跨类别和跨时间迁移损失。
- 输出机制熵、近重复率和安全风险。
- 每条入选内容的延迟与成本。

## 预期贡献

- 一个专门面向主观创意任务的模块化 Prompt 优化 Harness。
- 对“人工经验、自动搜索、模型自改 Prompt”三者的公平比较。
- 一组可复现、带版本和效果曲线的中文幽默 Prompt 配方。
- 图文共享意图下的联合 Prompt 优化方法。

## 风险与伦理

优化器容易利用 Judge 偏差，因此所有轮次只能用 Judge 预筛，最终结论必须由未参与优化的人类测试集验证。Prompt 与测试集版本需冻结并记录，防止隐性调参。

## 资源与周期

在 HumorArena 和 JudgeCal 完成后，约 10-14 周可形成论文。主要成本是模型调用和约 10,000 次偏好比较。

## 投稿方向

ACL/EMNLP、ICLR、NeurIPS、CHI、ICCC。

## 相关工作

- [Prompt Optimization with Human Feedback](https://arxiv.org/abs/2405.17346)
- [Preference-Guided Prompt Optimization for Text-to-Image Generation](https://arxiv.org/abs/2602.13131)
