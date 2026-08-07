# M03 MechanismPortfolio：笑点机制组合与路由

## 一句话提案

把不同幽默机制视为一组可竞争的创作专家，根据场景和受众动态分配生成预算，而不是让一个 Prompt 反复写同一种句型。

## 摘要

模型的幽默模式坍缩经常表现为所有场景都使用相同的“原来是我不配”“系统正在重启”或官腔翻译。MechanismPortfolio 为字面服从、语境揭示、身份反转、逻辑过度延伸、社会潜台词、降格、回调和视觉隐喻等机制建立独立专家，并使用路由器在探索新角度与利用已知偏好之间平衡。

## 方法

```text
Scene + SocialTension
-> Mechanism Router
-> K 个机制专家并行生成
-> Diversity Gate
-> Quality/Safety Critics
-> Audience Ranker
```

机制专家可以是不同 Prompt、Adapter、LoRA 或同一模型的结构化角色。Router 输出每个机制的预算而非只选一个，避免早期错误路由导致整个候选池失败。

## 研究问题

- RQ1：机制显式分工是否提高候选池的有效多样性？
- RQ2：动态预算是否优于每个机制平均生成？
- RQ3：受众偏好应改变机制选择，还是只改变同机制内部措辞？
- RQ4：如何避免 Router 追逐短期点击，导致长期机制坍缩？

## 路由策略

- 均匀分配。
- 场景分类器 Top-K。
- Contextual Bandit。
- 多目标 Bandit，奖励好笑、原创和多样性。
- 基于不确定性的探索。
- 受众条件化混合专家。

## 多样性门禁

多样性不能只用文本向量距离。每个候选应记录：机制、预期解释、揭示解释、攻击目标、核心概念 handle、句法模板和视觉关系。门禁同时惩罚表面改写和结构克隆。

## 实验

在相同总 Token 预算下比较单 Prompt 多采样、Persona 发散、固定机制配额和动态 Portfolio。报告候选池最佳值、平均值、最终选中质量和选中前浪费比例。

## 评价

- 最终人类成对胜率。
- 候选池中至少一条高质量内容的概率。
- 机制熵、结构签名熵和语义 handle 距离。
- 每条入选内容的平均候选数与成本。
- 长期在线机制覆盖和用户疲劳。

## 预期贡献

- 将幽默发散建模为预算路由问题。
- 区分文字多样性与真正笑点机制多样性。
- 给出质量、成本和探索之间的可控权衡。
- 可同时服务文字和图片 Meme。

## 风险与伦理

预定义机制可能限制新机制发现。系统应允许 `unknown/new mechanism`，并定期聚类高质量未归类候选，更新 Portfolio 而不是固化分类表。

## 资源与周期

可利用现有 8 类机制迅速启动，预计 12-16 周。需要 2 名研究员和 1 名研究工程师。

## 投稿方向

ACL/EMNLP、AAAI、RecSys、ICCC、CHum Workshop。

## 相关工作

- [HumorGen](https://arxiv.org/abs/2604.09629)
- [Humor Mechanics](https://arxiv.org/abs/2405.07280)
- [Humor Is an Audience](https://aclanthology.org/2026.semeval-1.15/)
