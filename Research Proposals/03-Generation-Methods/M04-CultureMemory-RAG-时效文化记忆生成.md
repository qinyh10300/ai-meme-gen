# M04 CultureMemory-RAG：时效文化记忆生成

## 一句话提案

把公共网络材料蒸馏成带时间、语境和许可边界的 Culture Card，再检索“文化规律”而不是检索原笑话进行改写。

## 摘要

直接把热门帖子送进模型，容易导致复制、误用和过度追热点。CultureMemory-RAG 将文化知识拆为来源层、蒸馏层和创作层：来源层只做受控采集；蒸馏层提取含义、语用、情绪功能、生命周期和可迁移机制；创作层只能看到 Culture Card 和必要引用，不直接看到受保护的原文。

## Culture Card 结构

```json
{
  "concept": "文化现象或表达",
  "meaning": "当前含义",
  "origin_summary": "不复刻原文的来源摘要",
  "pragmatic_function": "它在人际互动中做什么",
  "audience": "谁通常能理解",
  "platforms": ["平台"],
  "first_seen": "日期",
  "freshness_stage": "emerging/mature/stale/archival",
  "misuse_patterns": ["常见误用"],
  "transferable_mechanisms": ["可迁移机制"],
  "do_not_copy": ["受保护内容指纹"],
  "sources": ["可审计来源"]
}
```

## 研究问题

- RQ1：蒸馏后的文化卡片能否比原始检索提高原创性和自然使用？
- RQ2：时间衰减和受众过滤能否减少旧梗、硬蹭和误用？
- RQ3：检索文化含义、社会功能和幽默机制，哪一种信息最有用？
- RQ4：模型什么时候应该不使用任何热梗？

## 方法与系统

```text
Source Monitor
-> Provenance & License Filter
-> Culture Distiller
-> Human Verification
-> Versioned Card Store
-> Audience/Time-aware Retriever
-> Original Writer
-> Attribution & Similarity Guard
```

## 实验

比较无检索、原始帖子检索、普通摘要检索、Culture Card 检索和带时间衰减的 Culture Card。设置与输入场景相关但不适合使用的诱饵卡片，测试模型能否拒绝生硬融合。

## 评价

- 文化含义正确率。
- 使用自然度和受众可理解率。
- 好笑、场景贴合和新鲜度。
- 与来源文本的字符、语义和结构相似度。
- 引用可追溯率和许可合规率。
- 无需文化信号时的正确弃用率。

## 预期贡献

1. 一种适合创意生成而非事实问答的文化记忆对象。
2. 文化新鲜度、受众和版权边界联合检索方法。
3. 证明“理解并迁移机制”优于“检索后改写原梗”。
4. 可持续运营的中文互联网文化知识基础设施。

## 风险与伦理

文化卡片本身也可能固化误解或平台偏见。所有卡片需要来源、时间、验证状态和撤回机制；严禁把私人群聊、封闭社区或个人敏感经历未经同意纳入索引。

## 资源与周期

初版需要 2 名研究员、1 名检索工程师和 3 名文化编辑，16-20 周。长期价值依赖持续维护，而不是一次性抓取。

## 投稿方向

ACL/EMNLP、SIGIR、CIKM、The Web Conference、KDD。

## 相关工作

- [CHIME](https://aclanthology.org/2025.emnlp-main.863/)
- [OpenMic](https://arxiv.org/abs/2601.08288)
