# AtomForge

[Atoms.dev](https://atoms.dev/) 风格 Demo：多 Agent 协作驱动应用生成与可视化预览。

## 功能概览

- **Landing + 鉴权**：注册 / 登录（NextAuth Credentials + bcrypt）
- **项目管理**：新建项目、3 个模板 Remix（Todo / Landing / Dashboard）
- **Agent 流水线**：Mike（规划）→ Emma（PRD）→ Bob（架构）→ Alex（代码）
- **三栏编辑器**：Agent 面板 · 对话区 · 实时 Preview
- **对话迭代**：生成后通过自然语言让 Alex 重新生成代码
- **版本管理**：代码产物多版本切换
- **代码导出**：一键下载代码仓库（ZIP，含 public/ 与 docs/）
- **Fallback 模式**：无 OpenAI Key 时使用预置模板，Demo 仍可完整演示

## 完整体验链路

从输入需求到导出代码，产品主路径为 **分阶段流水线**（非一次性跑完四个 Agent）：

```text
Prompt → Mike 计划(plan-only) → 用户批准 → Emma/Bob/Alex 构建(build)
→ Preview → Alex 迭代(alex-only) → 刷新恢复 → ZIP 导出
```

| 步骤 | 用户操作 | 系统行为 |
|------|----------|----------|
| 1. Prompt | Dashboard 输入需求或 Remix 模板 | 创建项目，进入编辑器 |
| 2. 计划生成 | 等待 Mike 完成 | 自动启动 `plan-only`，流式输出实施计划 |
| 3. 计划批准 | 查阅计划卡片，点击「批准计划」 | 触发 `build`：Emma → Bob → Alex |
| 4. 代码 + Preview | 观察左侧工作流程，查看右侧 Preview | Alex 生成 HTML，iframe 实时预览 |
| 5. 增量修改 | 底部输入框描述修改（如「改成深色主题」） | `alex-only` 重新生成，支持多版本切换 |
| 6. 刷新恢复 | 刷新浏览器 | 对话、工作流程、计划从数据库恢复 |
| 7. 代码导出 | Preview 面板点击下载 | 导出 ZIP 代码仓库（含 `public/`、`docs/`） |

> 无 `OPENAI_API_KEY` 时步骤 2～5 走 Fallback 预置模板，流程相同但产物为固定 HTML。详见下文「验证 Fallback 是否为固定模板」。

## 技术栈

- Next.js 16 (App Router)
- TypeScript + Tailwind CSS + shadcn/ui
- Prisma 7 + SQLite（本地）/ Turso（生产）
- NextAuth.js v5
- OpenAI API（可选）
- SSE 流式 Agent 输出 + Sonner Toast

## 本地开发

```bash
# 安装依赖
npm install

# 复制环境变量
cp .env.example .env

# 数据库迁移
npm run db:migrate

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)

### 测试 Agent 流水线（CLI）

```bash
npm run test:agents
```

无 `OPENAI_API_KEY` 时自动走 Fallback 模板。

### 验证 Fallback 是否为固定模板

无 `OPENAI_API_KEY` 时，系统走 **Fallback 模式**：按 prompt **关键词匹配**路由到预置模板，**不是** LLM 动态生成。适合 Demo 演示完整流程，**不能**作为真实 AI 生成能力的证明。

**工作机制：**

| 组件 | Fallback 行为 |
|------|---------------|
| 路由 | `matchFallbackTemplate()` 用正则匹配关键词 → `todo` / `landing` / `dashboard` / `generic` 四选一 |
| Mike 计划 | 5 套预置文案（含销售页专用计划）；`generic` 类型会在计划中嵌入 prompt 前 40 字 |
| Emma PRD / Bob 架构 | 按类型返回固定结构，末尾附上原始 prompt |
| Alex HTML | **4 份硬编码 HTML 常量**（`fallback-html.ts`），同类型任意措辞输出字节级相同 |
| 工作流步骤 | `mock-workflow.ts` 模拟，与真实编码无关 |

**代码分支：** `hasLlmKey()` 为 `false` 时，各 Agent 直接调用 `fallback*.ts` 中的字符串，经 `simulateStream()` 模拟流式输出，**不请求** OpenAI API。

**一键验证（CLI）：**

```bash
npx tsx scripts/verify-fallback-templates.ts
```

脚本会对比多组 prompt 的输出哈希，预期结果：同类型不同措辞 → HTML 完全相同；`generic` 类型 → 计划不同但 HTML 相同。

**手动验证（评审可复现）：**

1. **同类型对比**：分别建项「简单的 Todo 待办应用」与「任务列表 todo app」→ Preview / 导出 ZIP 中 HTML 应完全一致
2. **generic 对比**：建项「在线投票系统」与「宠物领养平台」→ 左侧计划不同，右侧 Preview 均为同一张 generic 占位页
3. **断网测试**：断开网络后仍能完成生成 → 说明未调用外部 LLM
4. **网络抓包**：DevTools 中无对 `api.openai.com` 的请求

**何时才是真实 LLM 生成：**

配置有效 `OPENAI_API_KEY` 后，Agent 走 `streamCompletion()` 调用 OpenAI；此时输出应随 prompt 语义变化，且多次运行可有合理差异（`temperature: 0.7`）。

**对外表述建议：**

- ❌ 「无 Key 也能 AI 生成应用」
- ✅ 「无 Key 时走 Fallback 预置模板，保证 Demo 可完整演示；配置 Key 后才是 LLM 驱动」

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | 本地 `file:./dev.db` |
| `NEXTAUTH_SECRET` | ✅ | 随机字符串，`openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` |
| `OPENAI_API_KEY` | ❌ | 不填则使用 Fallback 模板 |

完整示例见 [`.env.example`](.env.example)。

## 在线 Demo

🔗 **[https://atomforge-m8bt.vercel.app](https://atomforge-m8bt.vercel.app)**

部署说明见 [DEPLOY.md](./DEPLOY.md)。

### 验证线上是否使用真实 OpenAI 模型

项目代码已接入 OpenAI，但 **`OPENAI_API_KEY` 为可选**：未配置时自动走 Fallback 预置模板，流程可完整演示，**不等于**真实 LLM 生成。为避免「支持 OpenAI、却无法证明线上在用真实模型」的质疑，提供以下 **零后台权限** 可验证手段：

| 方式 | 说明 |
|------|------|
| **公开接口** | `GET /api/health/ai`，无需登录，不暴露 Key |
| **UI 标签** | 登录后工作台侧栏底部、项目编辑器顶栏显示当前模式 |
| **行为对照** | 见上文「验证 Fallback 是否为固定模板」— 非常规 prompt 在 LLM 模式下会定制输出 |

#### 1. 健康检查接口（推荐评审使用）

```bash
# 线上
curl https://atomforge-m8bt.vercel.app/api/health/ai

# 本地
curl http://localhost:3000/api/health/ai
```

**已配置 Key、使用真实模型时：**

```json
{
  "data": {
    "configured": true,
    "mode": "openai",
    "model": "gpt-4o-mini"
  }
}
```

**未配置 Key、走 Fallback 时：**

```json
{
  "data": {
    "configured": false,
    "mode": "fallback",
    "model": null
  }
}
```

| 字段 | 含义 |
|------|------|
| `configured` | 服务端是否检测到 `OPENAI_API_KEY` |
| `mode` | `openai` = 调用 OpenAI API；`fallback` = 预置模板 |
| `model` | 真实模型 ID（当前为 `gpt-4o-mini`）；Fallback 时为 `null` |

接口详情见 [docs/API.md](./docs/API.md#健康检查公开无需登录)。

#### 2. UI 模式标签

登录 [在线 Demo](https://atomforge-m8bt.vercel.app) 后查看：

- **工作台侧栏底部**：`AI: OpenAI` 或 `AI: Fallback`
- **项目编辑器顶栏**：`AI: OpenAI · gpt-4o-mini` 或 `AI: Fallback 模板`

绿色标签 = 真实 OpenAI；琥珀色 = Fallback。鼠标悬停可见说明，应与 `/api/health/ai` 返回的 `mode` 一致。

#### 3. 生产环境如何启用真实模型

在 Vercel **Environment Variables** 中配置 `OPENAI_API_KEY`（Production + Preview），保存后 **Redeploy**。再次请求 `/api/health/ai`，确认 `mode` 为 `openai` 即可。

### 快速体验（在线 / 本地通用）

本地先执行「本地开发」中的安装与启动步骤，或打开在线 Demo：

1. **注册账号** — [在线 Demo](https://atomforge-m8bt.vercel.app) 或 http://localhost:3000
2. **输入 Prompt** — Dashboard 输入「帮我做一个前端销售网页」，或 Remix Todo / Landing / Dashboard 模板
3. **等待计划** — Mike 生成实施计划（新项目自动启动，无需手动触发）
4. **批准计划** — 查阅左侧计划卡片，点击「批准计划」（批准后才进入构建，不会自动跳过）
5. **Preview** — 观察左侧工作流程步骤，右侧 iframe 预览生成结果
6. **增量修改** — 底部输入框让 Alex 迭代（如「改成深色主题」）
7. **代码导出** — Preview 面板点击下载，获得 ZIP 代码仓库
8. **刷新验证** — 刷新页面，确认左侧流程、计划与对话状态仍一致

### 端到端验收清单

评审时可按下列项逐项勾选：

- [ ] Prompt 建项后自动进入计划阶段（`plan-only`）
- [ ] 计划卡片可批准，批准后才开始构建
- [ ] 构建完成后 Preview 可交互
- [ ] 对话迭代后产生新版本，版本下拉可切换
- [ ] 刷新页面后会话与工作流不丢失
- [ ] ZIP 导出含 HTML 与 docs（计划 / PRD / 架构）
- [ ] `/api/health/ai` 返回 `mode: "openai"`（或 UI 显示绿色 `AI: OpenAI · gpt-4o-mini`）

## 部署

生产环境部署步骤见 **[DEPLOY.md](./DEPLOY.md)**（Vercel + Turso 完整指南）。

简要流程：

1. Push 代码到 GitHub
2. Turso 创建云数据库
3. Vercel Import 仓库并配置环境变量
4. Deploy → 更新 `NEXTAUTH_URL` 为 `https://atomforge-m8bt.vercel.app` → Redeploy
5. 在 [https://atomforge-m8bt.vercel.app](https://atomforge-m8bt.vercel.app) 在线全流程验证

## 文档

- **[docs/项目说明.md](./docs/项目说明.md)** — 实现思路、完成程度、后续规划（评审 / 交接用）
- **[docs/API.md](./docs/API.md)** — REST 接口说明
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — 目录架构
- **[DEPLOY.md](./DEPLOY.md)** — 生产部署

## 项目结构

详见 **[ARCHITECTURE.md](./ARCHITECTURE.md)**。简要概览：

```text
src/
├── app/           # 路由层（页面 + API）
├── features/      # 业务域：auth / projects / agents
├── components/    # 通用 UI：layout / landing / ui
├── lib/           # 基础设施：auth / db / ai
└── types/
```

## 开发阶段

- [x] Phase 0：环境初始化
- [x] Phase 1：Landing + 鉴权
- [x] Phase 2：Dashboard + 项目管理
- [x] Phase 3：Agent 编排引擎
- [x] Phase 4：项目编辑器 UI
- [x] Phase 5：模板 Remix + 对话迭代 + 版本管理
- [x] Phase 6：打磨 + 部署文档

## License

MIT
