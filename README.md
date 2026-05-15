# Recodex Web

Recodex Web 是 Recodex Bridge 的可视化控制台，基于 Next.js 和 Ant Design 构建。它用于在浏览器中查看开发机上的 Codex 运行状态、管理移动端配对设备、浏览工作区、追踪 Codex 会话流，并对工作区执行受控的 Git 操作。

对应后台项目：

- Bridge: `recodex-go`
- 前端默认地址: `http://127.0.0.1:8764`
- 前端代理: `/api/*` -> Bridge `http://127.0.0.1:8765/*`
- WebSocket 代理: `/api/ws` -> Bridge `ws://127.0.0.1:8765/ws`
- Relay 默认地址: `http://127.0.0.1:8787`

## 目标定位

这个项目不是传统 CRUD 后台，而是一个本地开发者控制台：

- 帮助确认 Bridge、Codex CLI、API Key、配对状态是否正常。
- 让用户用浏览器完成移动设备配对和授权撤销。
- 查看 Codex 会话列表、实时事件和历史输出。
- 浏览允许访问的工作区，以及每个工作区的 Git 状态。
- 在确认保护下执行 commit、push、undo 等写操作。

## 核心页面

### 1. 总览

总览页展示当前 Bridge 的关键运行状态，作为进入系统后的第一屏。

建议内容：

- Bridge 服务状态：在线状态、Bridge 版本、Codex CLI 版本。
- 连接信息：base URL、WebSocket URL、局域网地址。
- 配对状态：pairing 是否开启、token 是否有效、过期时间。
- Codex 配置：当前模型、可选模型、reasoning effort、API Key 是否配置。
- 用量统计：今日 token、本月 token、今日成本、本月成本。
- 快捷统计：已配对设备数、工作区数、运行中会话数、异常会话数。
- 最近活动：最近会话、最近活跃工作区。

数据来源：

- `GET /healthz`
- `GET /version`
- `GET /pairing`
- `GET /context`
- `GET /devices`
- `GET /workspaces`
- `GET /sessions`

### 2. 配对与设备

用于管理手机或其他客户端与 Bridge 的授权关系。

建议内容：

- 配对二维码：根据 `pairingUri` 生成。
- 配对 token：展示 token 和过期倒计时。
- 连接地址：展示 `baseUrl`、`wsUrl`、`lanHost`。
- 设备列表：设备名、设备 ID、创建时间、最后在线时间。
- 撤销授权：对指定设备执行 revoke。
- 安全提示：显示 Git 写操作是否需要确认、当前 Bridge 是否可能暴露到局域网。

数据来源：

- `GET /pairing`
- `GET /devices`
- WebSocket: `device.revoke`

### 3. 工作区

用于查看 Bridge 允许访问的本机项目。

建议内容：

- 工作区列表：名称、路径。
- 工作区详情：当前分支、Git 状态、diff stat、最近 commit。
- 修改概览：按文件展示新增、修改、删除。
- 快捷入口：进入会话创建、Git diff、Git 操作面板。

数据来源：

- `GET /workspaces`
- `GET /git/status`
- `GET /git/diff`

### 4. 会话

用于浏览和跟踪 Codex 会话，是这个控制台最核心的功能。

建议内容：

- 会话列表：prompt 摘要、工作区、状态、创建时间、更新时间。
- 状态筛选：running、done、interrupted、error。
- 会话详情：
  - 用户 prompt
  - assistant 输出
  - running / tool call / git change / error / done 事件
  - 图片附件预览
  - token usage 信息
- 实时事件流：新会话启动后持续显示 `session.event`。
- 会话控制：对 running 会话提供 interrupt。
- 继续提问：基于选中工作区发送 `session.prompt`。

数据来源：

- `GET /sessions`
- `GET /sessions/{id}/events`
- WebSocket: `session.start`
- WebSocket: `session.prompt`
- WebSocket: `session.interrupt`
- WebSocket pushed events: `session.created`, `session.event`, `session.done`, `session.error`

### 5. Git

用于把 Codex 产生的代码修改可视化，并提供受控写操作。

建议内容：

- 当前工作区选择器。
- 当前分支、状态摘要、diff stat。
- 文件变更列表。
- Diff 查看器。
- 最近 commit log。
- Commit message 输入框。
- 操作按钮：
  - Commit
  - Push
  - Undo
- 确认弹窗：当后台返回 `confirm.required` 时要求用户二次确认。

数据来源：

- `GET /git/status`
- `GET /git/diff`
- `POST /git/commit`
- `POST /git/push`
- `POST /git/undo`

### 6. 设置

第一版设置页可以只读展示，后续再考虑写入配置。

建议内容：

- Bridge 地址配置。
- Codex binary、模型、reasoning effort。
- Git 写操作确认策略。
- 用量费率配置提示：`RECODEX_TOKEN_USD_PER_1K`。
- Relay 地址。

数据来源：

- `GET /context`
- `GET /pairing`

## 第一版范围

建议先完成这些功能：

- App Shell：侧边栏、顶部状态栏、工作区选择器。
- 总览页：服务状态、配对状态、用量统计、快捷统计。
- 配对页：二维码、token、设备列表、撤销设备。
- 工作区页：列表、分支、Git status。
- 会话页：会话列表、会话详情、事件时间线。
- Git 页：status、diff、commit、push、undo。

可以暂缓：

- Relay 房间监控。
- 复杂图表。
- 配置写入。
- 多 Bridge 实例管理。
- 用户权限体系。

## 交互原则

- 页面应偏工具型和高信息密度，避免营销式大卡片。
- 危险操作必须二次确认，尤其是 `git.push` 和 `git.undo`。
- 会话、Git、设备这些列表都要有空状态、加载状态、错误状态。
- 所有时间显示本地时间，并保留完整 tooltip。
- WebSocket 断开后要有明显状态提示，并提供重连。
- 只展示设备 key 的存在状态，不展示真实 key。

## 技术栈

- Next.js 16
- React 19
- TypeScript
- Ant Design 6
- Tailwind CSS 4

## 本地开发

安装依赖：

```bash
pnpm install
```

启动前端：

```bash
pnpm dev
```

启动后台 Bridge：

```bash
cd ../recodex-go
go run . -config bridge.yaml
```

默认访问：

```text
http://127.0.0.1:8764
```

## 环境变量

建议前端使用以下环境变量：

```bash
RECODEX_BRIDGE_TARGET=http://127.0.0.1:8765
NEXT_PUBLIC_RECODEX_API_BASE_URL=/api
NEXT_PUBLIC_RECODEX_WS_URL=ws://127.0.0.1:8764/api/ws
NEXT_PUBLIC_RECODEX_RELAY_URL=http://127.0.0.1:8787
```

如果未配置，前端默认使用 `/api` 作为 Bridge HTTP 代理前缀，并使用当前页面 origin 推导 `/api/ws` 的 WebSocket 地址。`RECODEX_BRIDGE_TARGET` 只在 Next.js 服务端读取，用来决定 `/api/*` 转发到哪个 Bridge。

## WebSocket 协议约定

所有消息使用 JSON envelope：

```json
{
  "type": "workspace.list",
  "id": "msg_001",
  "payload": {}
}
```

连接后第一条业务消息必须是 `auth.hello`。

已支持的客户端消息：

- `workspace.list`
- `device.list`
- `device.revoke`
- `session.list`
- `context.get`
- `session.events`
- `session.start`
- `session.prompt`
- `session.interrupt`
- `git.status`
- `git.diff`
- `git.commit`
- `git.push`
- `git.undo`

常见服务端消息：

- `bridge.hello`
- `auth.ok`
- `workspace.list.result`
- `device.list.result`
- `session.list.result`
- `session.events.result`
- `session.created`
- `session.event`
- `session.done`
- `session.error`
- `git.status.result`
- `git.diff.result`
- `confirm.required`

## 建议目录结构

```text
app/
  layout.tsx
  page.tsx
  globals.css
  pairing/
    page.tsx
  workspaces/
    page.tsx
  sessions/
    page.tsx
  git/
    page.tsx
  settings/
    page.tsx
components/
  app-shell/
  dashboard/
  devices/
  git/
  sessions/
  workspaces/
lib/
  bridge/
    http.ts
    ws.ts
    types.ts
  format.ts
  time.ts
```

## 开发里程碑

### Milestone 1: 基础框架

- 接入 Ant Design Provider。
- 完成 App Shell 和路由。
- 实现 Bridge HTTP client。
- 实现 WebSocket client 和连接状态。

### Milestone 2: 只读控制台

- 总览页。
- 配对页。
- 设备列表。
- 工作区列表。
- 会话列表和详情。

### Milestone 3: Git 和会话操作

- Git status / diff。
- Commit / push / undo。
- 新建 Codex 会话。
- 中断 running 会话。

### Milestone 4: 打磨

- 加载、错误、空状态。
- WebSocket 自动重连。
- 响应式适配。
- 基础可访问性检查。
- 构建和 lint 通过。

## 后台建议补充

当前 Bridge 已经可以支撑第一版 Web UI。为了让前端更简单，后续可以在后台补充聚合接口：

- `GET /api/dashboard`
- `GET /api/workspaces`
- `GET /api/sessions`
- `GET /api/devices`
- `GET /api/git/status?workspace=...`

这些接口不是第一版必需，但可以减少前端初始化时的 WebSocket 编排复杂度。
