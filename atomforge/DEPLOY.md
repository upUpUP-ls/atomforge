# AtomForge 部署指南（Vercel + Turso）

> **重要**：仅把代码推到 GitHub **不会**自动生成可访问链接。必须完成本指南，才会得到形如 `https://atomforge-xxx.vercel.app` 的公网 URL。

## 部署架构

| 组件 | 平台 | 说明 |
|------|------|------|
| 代码托管 | GitHub | 你 push 代码的地方 |
| 应用托管 | Vercel | 构建并运行 Next.js，**生成在线链接** |
| 生产数据库 | Turso | Serverless 环境不能用本地 SQLite 文件 |
| AI 生成（可选） | OpenAI | 不配置则走 Fallback 模板 |

```text
本地开发 → git push → GitHub
                         ↓
               Vercel 自动拉取并构建
                         ↓
            Turso 云数据库存用户/项目
                         ↓
         https://你的项目名.vercel.app
```

---

## 第一步：推送代码到 GitHub

```bash
cd atomforge
git init
git add .
git commit -m "feat: initial AtomForge demo"
git branch -M main
git remote add origin https://github.com/你的用户名/atomforge.git
git push -u origin main
```

Checklist：

- [ ] 仓库为 **Public**，或 Vercel 已授权访问 Private 仓库
- [ ] 未将 `.env` 推上去（仅 `.env.example`）
- [ ] `package.json` 的 `build` 脚本含 `prisma migrate deploy`

---

## 第二步：创建 Turso 云数据库

1. 打开 [https://turso.tech](https://turso.tech) 注册（可用 GitHub 登录）
2. 点击 **Create Database**，名称如 `atomforge-prod`
3. 进入该数据库 → **Connect** → 复制连接信息
4. 拼成 Vercel 用的 `DATABASE_URL`：

```env
DATABASE_URL="libsql://atomforge-prod-xxx.turso.io?authToken=eyJhbGciOi..."
```

5. （可选）本地验证迁移：

```bash
export DATABASE_URL="libsql://..."
npx prisma migrate deploy
```

---

## 第三步：在 Vercel 导入 GitHub 仓库

1. 打开 [https://vercel.com](https://vercel.com)，用 **GitHub 账号登录**
2. 点击 **Add New… → Project**
3. 找到 `atomforge` 仓库 → **Import**
4. **Configure Project** 保持默认（Framework: Next.js）
5. **先不要点 Deploy** — 下一步先配环境变量

---

## 第四步：配置环境变量

在 **Environment Variables** 区域添加（Production + Preview 都勾选）：

| 变量名 | 值 | 必填 |
|--------|-----|------|
| `DATABASE_URL` | Turso 完整连接串 | ✅ |
| `NEXTAUTH_SECRET` | 随机字符串（见下） | ✅ |
| `NEXTAUTH_URL` | 部署后改为真实 Vercel 域名 | ✅ |
| `OPENAI_API_KEY` | `sk-...` | ❌ 可选 |

生成 `NEXTAUTH_SECRET`：

```bash
openssl rand -base64 32
```

**关于 `NEXTAUTH_URL`：**

- 首次 Deploy 前可填 `http://localhost:3000`
- 部署成功后改为真实地址，如 `https://atomforge-abc123.vercel.app`
- 回到 **Settings → Environment Variables** 修改后 **Redeploy**

---

## 第五步：Deploy 并获取在线链接

1. 点击 **Deploy**
2. 等待构建完成，确认日志中有 `prisma generate`、`prisma migrate deploy`、`next build`
3. 复制 **Domains** 下的地址：`https://atomforge-xxx.vercel.app`
4. 将链接写入 `README.md` 的「在线 Demo」章节

---

## 第六步：部署后验证

在**在线链接**上（不是 localhost）逐项测试：

| # | 操作 | 预期 |
|---|------|------|
| 1 | 打开首页 | Landing 正常加载 |
| 2 | 注册新账号 | 成功，跳转 Dashboard |
| 3 | 退出再登录 | Session 正常 |
| 4 | 新建项目 / Remix 模板 | Agent 流程有输出 |
| 5 | 右侧 Preview | 可交互 |
| 6 | 刷新页面 | 项目仍在（Turso 持久化） |

若登录失败，99% 是 `NEXTAUTH_URL` 与当前域名不一致 → 修正后 Redeploy。

---

## 后续更新

```bash
git add .
git commit -m "fix: xxx"
git push origin main
```

Vercel 默认 **push 即自动重新部署**，链接不变。

---

## 常见问题

| 现象 | 可能原因 | 处理 |
|------|----------|------|
| Build 失败 `prisma migrate` | `DATABASE_URL` 错误或 token 过期 | 检查 Turso 连接串 |
| 打开链接 500 | 环境变量未配全 | 核对第四节三张表 |
| 能打开但登录报错 | `NEXTAUTH_URL` 不对 | 改成真实 `https://xxx.vercel.app` 并 Redeploy |
| 注册成功但数据丢失 | 仍在用 `file:./dev.db` | 生产必须 Turso URL |
| Agent 无输出 | 无 API Key | 正常，应走 Fallback |
| SSE 中途断开 | Serverless 超时 | 项目已配置 `vercel.json` 的 `maxDuration: 60` |

---

## 环境变量对照（本地 vs 生产）

| 变量 | 本地开发 | Vercel 生产 |
|------|----------|-------------|
| `DATABASE_URL` | `file:./dev.db` | `libsql://...?authToken=...` |
| `NEXTAUTH_URL` | `http://localhost:3000` | `https://你的项目.vercel.app` |
| `NEXTAUTH_SECRET` | 任意 dev 字符串 | 生产用随机强密钥 |
| `OPENAI_API_KEY` | 可选 | 可选 |

---

## 速查清单

```text
□ 1. Turso 建库，拿到 DATABASE_URL
□ 2. vercel.com → Import GitHub 仓库
□ 3. 填环境变量：DATABASE_URL、NEXTAUTH_SECRET、NEXTAUTH_URL
□ 4. Deploy
□ 5. 把 NEXTAUTH_URL 改成真实 vercel.app 域名 → Redeploy
□ 6. 在线全流程测一遍
□ 7. 复制链接写进 README
```

**仅完成 git push 不够；必须完成 □2–□5 才有公网链接。**
