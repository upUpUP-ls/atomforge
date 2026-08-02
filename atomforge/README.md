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

## 环境变量

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | 本地 `file:./dev.db` |
| `NEXTAUTH_SECRET` | ✅ | 随机字符串，`openssl rand -base64 32` |
| `NEXTAUTH_URL` | ✅ | `http://localhost:3000` |
| `OPENAI_API_KEY` | ❌ | 不填则使用 Fallback 模板 |

完整示例见 [`.env.example`](.env.example)。

## 在线 Demo

> 部署后在此填写 Vercel 链接，详见 [DEPLOY.md](./DEPLOY.md)。

🔗 _待部署：`https://your-project.vercel.app`_

### 快速体验

1. 注册账号
2. 点击「新建项目」或选择模板 Remix
3. 等待 Agent 流水线完成，右侧查看 Preview
4. 在底部输入框迭代优化（如「改成深色主题」）

## 部署

生产环境部署步骤见 **[DEPLOY.md](./DEPLOY.md)**（Vercel + Turso 完整指南）。

简要流程：

1. Push 代码到 GitHub
2. Turso 创建云数据库
3. Vercel Import 仓库并配置环境变量
4. Deploy → 更新 `NEXTAUTH_URL` → Redeploy
5. 在线全流程验证

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
