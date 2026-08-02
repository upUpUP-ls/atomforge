# AtomForge 目录架构说明

> 采用 **Next.js App Router 单体全栈** + **按业务域（features）分层** 的组织方式。

## 设计原则

| 原则 | 说明 |
|------|------|
| `app/` 只做路由 | 页面与 API Route 保持薄层，业务逻辑下沉到 `features/` |
| `features/` 按域拆分 | auth、projects、agents 各自包含组件、hooks、领域逻辑 |
| `lib/` 放基础设施 | 数据库、鉴权、AI 客户端等与业务无关的共享能力 |
| `components/` 放通用 UI | layout、landing、shadcn/ui，不含业务域逻辑 |

## 目录结构

```text
atomforge/
├── prisma/                         # 数据模型与迁移
├── scripts/                        # CLI 脚本（如 test:agents）
├── public/                         # 静态资源
├── src/
│   ├── app/                        # Next.js 路由层（页面 + API）
│   │   ├── (auth)/                 # 登录 / 注册（路由组）
│   │   ├── (dashboard)/            # 工作台 / 项目页
│   │   └── api/                    # REST API
│   │
│   ├── features/                   # ★ 业务域模块
│   │   ├── auth/
│   │   │   ├── actions.ts          # Server Actions（登出等）
│   │   │   └── components/         # 登录 / 注册 / 退出按钮
│   │   │
│   │   ├── projects/
│   │   │   ├── service.ts          # 项目 CRUD（原 lib/projects.ts）
│   │   │   ├── templates.ts        # 模板定义与 Remix 种子
│   │   │   ├── export.ts           # HTML 导出
│   │   │   └── components/         # 项目列表、新建对话框、模板网格
│   │   │
│   │   └── agents/
│   │       ├── lib/                # Agent 编排引擎
│   │       │   ├── orchestrator.ts # SOP 流水线
│   │       │   ├── mike|emma|bob|alex.ts
│   │       │   ├── fallback*.ts
│   │       │   ├── editor-state.ts
│   │       │   └── types.ts
│   │       ├── hooks/
│   │       │   └── use-agent-pipeline.ts
│   │       └── components/         # 编辑器三栏 UI + Preview
│   │
│   ├── components/                 # 跨域通用 UI
│   │   ├── layout/                 # AppShell、Sidebar、Providers
│   │   ├── landing/                # （保留，当前 / 已精简）
│   │   └── ui/                     # shadcn/ui 基础组件
│   │
│   ├── lib/                        # 基础设施
│   │   ├── auth/
│   │   │   ├── index.ts            # NextAuth 实例
│   │   │   └── config.ts           # Edge 兼容配置（middleware 用）
│   │   ├── db/
│   │   │   └── index.ts            # Prisma Client
│   │   ├── ai/
│   │   │   └── llm.ts              # OpenAI 封装
│   │   └── utils.ts                # cn() 等工具函数
│   │
│   ├── types/                      # 全局类型（Agent 枚举、NextAuth 扩展）
│   └── middleware.ts
│
├── ARCHITECTURE.md                 # 本文件
├── DEPLOY.md
└── README.md
```

## 依赖方向

```text
app/  →  features/  →  lib/
         ↓
    components/ui
```

- **`app/`** 可 import `features/`、`components/`、`lib/`
- **`features/`** 可 import 同 feature 内部、`lib/`、`components/ui`、`types/`
- **`features/` 之间** 尽量避免互相 import；必要时通过 `app/` 或 `lib/` 中转
- **`lib/`** 不应 import `features/` 或 `components/`

## Import 路径约定

| 用途 | 路径示例 |
|------|----------|
| 鉴权 | `@/lib/auth` |
| 数据库 | `@/lib/db` |
| LLM | `@/lib/ai/llm` |
| 项目服务 | `@/features/projects/service` |
| 模板 | `@/features/projects/templates` |
| Agent 编排 | `@/features/agents/lib/orchestrator` |
| 编辑器 Hook | `@/features/agents/hooks/use-agent-pipeline` |
| 项目编辑器 | `@/features/agents/components/project-editor` |

同一 feature 内部优先使用 **相对路径**（如 `./agent-card`、`../lib/types`）。

## 新增功能指南

| 要加什么 | 放哪里 |
|----------|--------|
| 新页面 | `src/app/.../page.tsx` + 对应 feature 组件 |
| 新 API | `src/app/api/.../route.ts`，调用 feature service |
| 项目相关 UI / 逻辑 | `src/features/projects/` |
| Agent 相关 | `src/features/agents/` |
| 鉴权相关 | `src/features/auth/` + `src/lib/auth/` |
| 通用按钮 / 卡片 | `src/components/ui/` |
| 跨页面布局 | `src/components/layout/` |

## 与旧结构对照

| 旧路径 | 新路径 |
|--------|--------|
| `lib/projects.ts` | `features/projects/service.ts` |
| `lib/templates.ts` | `features/projects/templates.ts` |
| `lib/export.ts` | `features/projects/export.ts` |
| `lib/agents/*` | `features/agents/lib/*` |
| `lib/llm.ts` | `lib/ai/llm.ts` |
| `lib/auth.ts` | `lib/auth/index.ts` |
| `lib/auth.config.ts` | `lib/auth/config.ts` |
| `hooks/use-agent-pipeline.ts` | `features/agents/hooks/use-agent-pipeline.ts` |
| `components/agents/*` | `features/agents/components/*` |
| `components/dashboard/*` | `features/projects/components/*` 或 `components/layout/` |
| `components/auth/*` | `features/auth/components/*` |
| `app/actions/auth.ts` | `features/auth/actions.ts` |
