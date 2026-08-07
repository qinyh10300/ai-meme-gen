# H04 AgentAblate：幽默 Agent 消融实验平台

## 一句话提案

把多 Agent 幽默系统变成可插拔状态图，严格测量每个 Agent 是否真的提高了人类偏好。

## 摘要

多 Agent 系统容易看起来复杂，却无法说明复杂性来自哪里、收益是否超过额外调用成本。AgentAblate 为场景分析、文化检索、机制发散、Writer、Critic、Judge、原创性门禁、安全门禁和视觉规划提供统一接口，可自动构造消融组合、固定随机性、重放 Trace，并生成质量、成本、延迟和风险报告。

## 研究问题

- RQ1：哪些 Agent 对最终人类偏好有独立贡献？
- RQ2：多 Agent 的收益来自角色分工，还是仅仅来自更高 Token 预算？
- RQ3：Critic 的提升来自诊断、额外生成，还是选择偏差？
- RQ4：多轮讨论在何时提升创作，何时导致风格收敛和攻击性上升？

## Harness 架构

每个模块遵循统一契约：

```text
input_state
-> module_output
-> token/cost/latency
-> model/version/prompt
-> confidence/error
-> output_state
```

Harness 支持关闭、替换、重复或并行任一模块，并确保候选预算、模型预算和总 Token 预算可公平对齐。

## 方法与 Baseline

以单个强模型直接提示为最低复杂度 Baseline，再依次加入规划、并行发散、Critic、Ranker、记忆和 Guard。每次实验只改变一个模块；完整系统还需与“把相同 Token 全部用于单模型多采样”比较，以区分角色分工收益和纯计算量收益。

## 核心消融

- 无场景分析。
- 无 Culture RAG。
- 单 Writer 对多机制 Writer。
- 无 Critic、同模型 Critic、独立模型 Critic。
- Pointwise Judge 对 Pairwise Ranker。
- 无历史记忆、只存分数、存具体讨论记忆。
- 无原创性门禁和无安全门禁。
- 文字与图片独立规划对共享意图规划。

## 公平比较设计

设置三种预算：固定调用次数、固定 Token、固定人民币成本。对每个条件使用相同场景、相同随机种子集合和相同候选上限。最终样本由盲化人类评价，不允许开发者挑选“最好看的案例”。

## 评价与指标

- 人类偏好增益。
- 每增加 1% 胜率的 Token、成本和延迟。
- 输出机制熵与近重复率。
- 安全风险、拒绝率和攻击性变化。
- Trace 可重放率和失败恢复率。

## 预期贡献

- 可复用的幽默 Agent 消融与追踪框架。
- 对多 Agent 是否优于单强模型的严格成本控制证据。
- 找出最小有效工作流，避免生产系统无意义膨胀。
- 为 OpenMic、Comedy Club 类架构提供中文短文本与 Meme 的补充实证。

## 风险与伦理

大规模消融会产生大量未审核候选，只能进入隔离研究池，不应自动发布。实验日志可能包含用户场景和模型隐性推断，必须匿名化并限制访问。

## 资源与周期

当前仓库已有清晰的 Writer、Critic、Judge 与 Guard 结构，预计 8-12 周。需要 1 名研究工程师和 1 名评测研究员。

## 投稿方向

ACL/EMNLP System Track、Agents Workshop、ICLR Workshop、CHum Workshop。

## 相关工作

- [OpenMic](https://arxiv.org/abs/2601.08288)
- [Multi-Agent Comedy Club](https://aclanthology.org/2026.findings-acl.145/)
- [SemEval-2026 MWAHAHA](https://aclanthology.org/2026.semeval-1.454/)
