# AtomForge REST API

所有 JSON 接口采用统一响应格式：

**成功**

```json
{ "data": { ... } }
```

**失败**

```json
{ "error": { "message": "错误说明" } }
```

创建资源时返回 `201 Created`，并在 `Location` 头中提供资源 URL。

---

## 健康检查（公开，无需登录）

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/health/ai` | 查询当前 AI 运行模式（OpenAI 或 Fallback） |

用于评审或运维 **自证线上是否配置了真实 OpenAI 模型**，不暴露 `OPENAI_API_KEY`。

### GET /api/health/ai

**响应** `200`（已配置 Key，使用真实模型）

```json
{
  "data": {
    "configured": true,
    "mode": "openai",
    "model": "gpt-4o-mini"
  }
}
```

**响应** `200`（未配置 Key，走 Fallback 模板）

```json
{
  "data": {
    "configured": false,
    "mode": "fallback",
    "model": null
  }
}
```

| 字段 | 说明 |
|------|------|
| `configured` | 服务端是否检测到 `OPENAI_API_KEY` |
| `mode` | `openai` = 调用 OpenAI API；`fallback` = 预置模板 |
| `model` | 真实模型 ID；Fallback 时为 `null` |

**UI 对应：** 登录后工作台侧栏底部、项目编辑器顶栏会显示 `AI: OpenAI · gpt-4o-mini`（绿色）或 `AI: Fallback 模板`（琥珀色），与接口结果一致。

**线上验收示例：**

```bash
curl https://atomforge-m8bt.vercel.app/api/health/ai
```

---

## 用户

| 方法 | 路径 | 说明 |
|------|------|------|
| `POST` | `/api/users` | 注册（创建用户） |

### POST /api/users

**请求体**

```json
{
  "email": "user@example.com",
  "password": "secret123",
  "name": "可选昵称"
}
```

**响应** `201`

```json
{
  "data": {
    "user": {
      "id": "...",
      "email": "...",
      "name": "...",
      "createdAt": "..."
    }
  }
}
```

---

## 鉴权（NextAuth 框架约定）

| 方法 | 路径 | 说明 |
|------|------|------|
| `*` | `/api/auth/[...nextauth]` | 登录 / Session（框架标准路径） |

---

## 项目

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/projects` | 列出当前用户项目 |
| `POST` | `/api/projects` | 创建项目 |
| `GET` | `/api/projects/:id` | 获取项目详情 |
| `PATCH` | `/api/projects/:id` | 更新项目（部分更新） |
| `DELETE` | `/api/projects/:id` | 删除项目 |

### POST /api/projects

**请求体（二选一）**

```json
{ "prompt": "应用描述", "title": "可选标题" }
```

```json
{ "templateId": "todo" }
```

模板 ID：`todo` | `landing` | `dashboard`

---

## 产物（子资源）

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/projects/:id/artifacts?type=code` | 列出产物版本 |

`type` 可选值：`plan` | `prd` | `architecture` | `code`（默认 `code`）

---

## 流水线运行（子资源）

| 方法 | 路径 | 说明 |
|------|------|------|
| `GET` | `/api/projects/:id/pipeline-runs` | 列出流水线运行历史 |
| `POST` | `/api/projects/:id/pipeline-runs` | 创建流水线运行 |
| `GET` | `/api/projects/:id/pipeline-runs/:runId/events` | SSE 事件流 |

### POST /api/projects/:id/pipeline-runs

**请求体**

```json
{
  "mode": "full",
  "feedback": "可选，alex-only 模式必填"
}
```

`mode`：`full`（完整流水线）| `alex-only`（仅 Alex 迭代）

**响应** `201`

```json
{
  "data": {
    "pipelineRun": {
      "id": "...",
      "projectId": "...",
      "mode": "full",
      "status": "pending",
      "createdAt": "..."
    },
    "links": {
      "self": "/api/projects/{id}/pipeline-runs/{runId}",
      "events": "/api/projects/{id}/pipeline-runs/{runId}/events"
    }
  }
}
```

### GET .../events

- `Content-Type: text/event-stream`
- 客户端连接 `links.events` 获取 Agent 流式输出
- 结束帧：`data: [DONE]`

---

## HTTP 状态码

| 状态码 | 含义 |
|--------|------|
| `200` | 成功 |
| `201` | 创建成功 |
| `204` | 删除成功（无响应体） |
| `400` | 请求参数错误 |
| `401` | 未登录 |
| `404` | 资源不存在 |
| `409` | 冲突（如流水线执行中） |
| `500` | 服务器错误 |

---

## REST 设计说明

| 原则 | 实现 |
|------|------|
| 名词资源路径 | `/projects`、`/artifacts`、`/pipeline-runs` |
| HTTP 动词 | GET 查询、POST 创建、PATCH 部分更新、DELETE 删除 |
| 嵌套子资源 | 产物与流水线挂载在 `/projects/:id/` 下 |
| 无 RPC 动词 URL | 已移除 `/api/agents/run` 等 |
| HATEOAS 链接 | 创建流水线后返回 `links.events` |
| 用户注册 | `POST /api/users` 而非 `/api/auth/register` |
