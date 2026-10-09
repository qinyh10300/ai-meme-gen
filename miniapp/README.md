# MemePop 微信小程序

这是与现有 Web 产品并行的 Taro + React 小程序客户端。首版包含「刷梗」和「我的场景」两个页面；笑点实验室继续保留在 Web 端。

当前没有 AppID 也可以完成 UI、业务链路和本地后端联调。默认 `mock` 登录会在本机生成稳定的开发会话；取得 AppID 并配置服务端密钥后，切换为 `wechat` 登录，同一微信用户会在不同设备上使用同一服务端身份，反馈、偏好和私有候选会随账号同步。

## 目录

- `src/pages/feed`：刷梗、反馈、原因标签、复制与分享。
- `src/pages/studio`：场景输入、受众/语气、生成进度、候选评价。
- `src/lib`：微信登录、请求、存储和 ID 适配。
- `src/services`：小程序 API 调用层。
- `dist`：微信小程序编译产物，不提交 Git。

## 没有 AppID 时开发

先在仓库根目录启动后端：

```bash
npm install
npm run dev
```

另开一个终端，编译微信小程序：

```bash
npm --prefix miniapp install
npm run mini:dev
```

然后在微信开发者工具中选择「导入项目」，目录选本仓库的 `miniapp`。项目当前使用 `touristappid`，可以预览页面和大部分交互，但游客模式不能验证真实的微信登录、真机调试、上传和发布。

开发阶段若后端使用本机 HTTP 地址，需要在微信开发者工具的项目设置中勾选「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」。这个选项只对开发工具有效，正式版和真机发布不能依赖它。

也可以用 H5 快速检查布局和交互。H5 开发服务器会把 `/api` 代理到本机 `localhost:3000`：

```bash
npm --prefix miniapp run dev:h5
```

浏览器打开 `http://127.0.0.1:10086`。H5 只用于快速视觉回归，最终仍要在微信开发者工具和真机上验证。
H5 调试服务只监听本机回环地址；不要把开发服务器暴露到局域网或公网。

## 取得 AppID 后启用真实登录

1. 在微信公众平台注册小程序，邀请协作者成为开发者，并取得 AppID。
2. 把 `project.config.json` 的 `appid` 从 `touristappid` 改为真实 AppID。
3. 在 `miniapp/.env.development.local` 配置：

```dotenv
TARO_APP_API_BASE_URL=https://你的-api-域名
TARO_APP_AUTH_MODE=wechat
```

4. 只在服务端密钥管理中配置下面两项，绝对不要放入 `miniapp`、前端环境变量或 Git：

```dotenv
WECHAT_APP_ID=wx...
WECHAT_APP_SECRET=...
```

5. 部署 `drizzle/0001_chubby_klaw.sql`，创建 `wechat_accounts` 与 `auth_sessions` 表。
6. 在微信公众平台的「开发管理 → 开发设置 → 服务器域名」中，把正式 API 域名加入 `request` 合法域名。

登录流程是：小程序调用 `wx.login` 获取一次性 code → 后端用 AppID/AppSecret 向微信换取 OpenID → 后端保存 OpenID 的哈希映射并签发随机会话 token。AppSecret、session_key 和原始 OpenID 都不会下发到小程序。

## 域名要求

小程序域名本质上仍是普通 Web 域名，但微信多了一层白名单和发布审核：

- 请求地址必须是绝对 HTTPS 地址，证书有效；正式版不能使用 `localhost`、IP 或任意未登记域名。
- 域名需要在小程序后台登记为 `request` 合法域名；普通网页没有这层微信白名单。
- 小程序请求不受浏览器 CORS 同源策略约束，但仍受微信域名白名单约束。
- 开发工具可以临时关闭校验，真机体验版和正式版应按真实域名验证。

## 构建与验证

```bash
npm run mini:typecheck
npm run mini:test

# 正式构建必须提供 HTTPS API 域名
TARO_APP_API_BASE_URL=https://api.example.com \
TARO_APP_AUTH_MODE=wechat \
npm run mini:build
```

编译完成后，用微信开发者工具打开 `miniapp`，依次检查：

1. 清缓存后能够登录并进入刷梗页。
2. 好笑/不好笑会切换下一条并更新命中率，原因标签可提交或跳过。
3. 输入至少 4 个字符的场景，生成期间不可重复提交；成功后候选可评价、复制和分享。
4. 断网时刷梗会切换到小型本地精选，网络错误有明确恢复提示。
5. 在第二台设备登录同一微信号，历史反馈会影响相同的服务端用户画像。

## 上线前仍需完成

- 申请 AppID/开发者权限并完成真实 `wx.login` 真机联调。
- 准备可登记且稳定可访问的备案 HTTPS API 域名。
- 在服务端接入微信内容安全检查，并补齐隐私政策、数据保留和删除机制。
- 为在线生成增加更严格的成本限流、幂等与超时恢复。
