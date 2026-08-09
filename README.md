# MemePop

MemePop 是一套面向中文真实生活场景的文字幽默工作流。默认页面一次只呈现一条笑话和两个反馈按钮；用户也可以输入自己的经历，由结构化 Writer、独立 Critics、原创性检查和安全门禁共同产出多个 Punchline。

## 当前能力

- **刷梗**：服务端候选池、匿名偏好排序、10% 探索、好笑/不好笑与原因标签。
- **我的场景**：场景建模、八种机制 Angle Room、多候选生成、复制、分享和单条评价。
- **笑点实验室**：曝光、好笑率、失败原因、机制表现、生成耗时与 A/B 盲选。
- **双 Provider**：有密钥时使用 OpenAI Responses API Structured Outputs；无密钥、拒绝、超时或格式错误时使用可审计的本地 Provider。
- **质量门禁**：独立结构评分、字符与结构查重、AI 解释腔/陈旧词/模板标签、身份攻击/未成年人/真实伤害/露骨内容检查。
- **持久化**：Cloudflare D1 保存候选、曝光、反馈、盲选、生成运行、文化卡片和聚合运行指标。

## 本地运行

要求 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
```

使用开发服务器输出的 Local URL。项目包含 D1 本地绑定，首次请求会幂等创建表并初始化 48 条 `baseline-v1` 审核内容与原创文化卡片。

可选环境变量见 `.env.example`：

```bash
cp .env.example .dev.vars
```

- `OPENAI_API_KEY`：不填则完整使用本地生成器。
- `OPENAI_MODEL`：Writer 模型，默认 `gpt-5.6`。
- `OPENAI_JUDGE_MODEL`：独立 Judge 模型，默认与 Writer 相同。
- `OPENAI_BASE_URL`：可选，自定义 OpenAI 兼容 API 地址。
- `MEMEPOP_ADMIN_SECRET`：调用候选池补货接口所需的 Bearer 密钥。

不要提交 `.dev.vars`、`.env` 或任何真实密钥。

## 数据库与迁移

Drizzle schema 位于 `db/schema.ts`，迁移文件位于 `drizzle/`。修改 schema 后运行：

```bash
npm run db:generate
```

Sites 构建会把 `.openai/hosting.json` 和 `drizzle/` 一并放入部署产物。逻辑 D1 绑定名固定为 `DB`，真实数据库由 Sites 在部署时管理。

## 生成流程

```text
用户生活小事
-> SceneModel（人物、关系、表层含义、私人真相、情绪、文化锚点）
-> Angle Room（八种不同笑点机制）
-> Writer（8-12 个结构化候选）
-> 独立 Judge + 本地六项 Critics
-> 字符与结构原创性检查
-> 内容安全检查
-> 合格候选进入当前会话私有池
-> 用户反馈继续影响 Feed 排序
```

生成 Trace 只保存 Provider、模型、版本、耗时、分数和局部原因码，不保存模型私有推理。公开接口按匿名会话限制为每小时 12 轮。

## 质量验证

```bash
npm run typecheck
npm test
npm run jokes:audit
npm run eval:humor
npm run build
```

`evals/humor-scenes.jsonl` 包含 100 条原创中文生活场景，覆盖职场、家庭、恋爱、校园、朋友、消费服务、社交媒体和日常自我。离线评测检查场景与标注完整性、AI 味、重复、风险、结构完整性和机制多样性。

## 主要 API

| 接口 | 用途 |
| --- | --- |
| `POST /api/feed/next` | 获取并记录下一条候选曝光 |
| `POST /api/feedback` | 幂等保存单条反馈与原因 |
| `GET/POST /api/compare` | 获取盲选对并保存胜者 |
| `POST /api/generate/joke` | 为当前会话生成私有候选 |
| `GET /api/lab/metrics` | 获取去标识化聚合指标 |
| `GET /api/pool/stats` | 获取候选池水位与机制分布 |
| `POST /api/admin/replenish` | 受 Bearer 密钥保护的候选补货 |
| `GET /api/health` | 数据库与模型配置健康检查 |

Worker 暴露定时任务入口，每次可从原创文化卡片中补充公开候选。线上密钥与定时配置通过 Sites 管理。

## 其他入口

原有 CLI 仍可用于快速试写：

```bash
npm run meme -- "第一次和喜欢的人吃饭，把饮料洒了"
npm run meme -- "把吐槽老板的话发错工作群了" --platform wechat --tone awkward
```

研究边界与引用见 `中文调研报告.md` 和 `research/chinese-humor-method.md`，完整执行清单见 `开发优化计划.md`。
