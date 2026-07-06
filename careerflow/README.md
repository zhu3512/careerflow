# CareerFlow

一个可以直接运行的全栈求职管理项目：记录职位、跟踪投递进度、管理面试提醒，并分析简历与岗位的匹配度。

> A full-stack job search command center built with React, TypeScript, Express and SQLite.

## 先看这里：能直接在 GitHub 使用吗？

可以上传到 GitHub，也可以通过 **GitHub Codespaces** 直接运行，但不能部署到 GitHub Pages。

- **GitHub 仓库**：保存和展示源代码，适合放进简历。
- **GitHub Codespaces**：在浏览器中启动完整项目，不需要先在电脑安装 Node.js。
- **GitHub Pages**：只能托管静态页面，无法运行本项目的 Express 后端和 SQLite 数据库。

### 在 GitHub 中直接启动（推荐）

如果还没有仓库，先按本文后面的 [发布到 GitHub](#发布到-github) 完成上传，然后：

1. 打开你的 `careerflow` 仓库；
2. 点击绿色的 **Code** 按钮；
3. 切换到 **Codespaces**；
4. 点击 **Create codespace on main**；
5. 等待在线编辑器打开并自动安装依赖；
6. 在底部终端执行：

```bash
pnpm dev
```

当右下角出现端口提示时，点击 **Open in Browser**。如果没有提示，打开编辑器底部的 **Ports**，找到端口 `5173`，点击地球图标。

登录账号：

```text
邮箱：demo@careerflow.dev
密码：demo123
```

Codespaces 是云端开发环境，不是永久公开网站。你关闭 Codespace 后，其他人不能继续访问这个临时地址。要获得长期公开网址，需要把项目部署到支持 Node.js 和持久化磁盘的平台。

## 在本地启动（1 分钟）

### 1. 准备环境

需要：

- [Node.js 24](https://nodejs.org/)
- pnpm 11

如果没有 pnpm，先执行：

```bash
corepack enable
corepack prepare pnpm@11.7.0 --activate
```

确认环境：

```bash
node --version
pnpm --version
```

Node.js 应为 `v24.x` 或更高版本。

### 2. 下载并运行

```bash
git clone https://github.com/<你的用户名>/careerflow.git
cd careerflow
pnpm install
pnpm dev
```

看到下面两个地址后，说明启动成功：

```text
前端：http://localhost:5173
API：http://localhost:3000
```

浏览器打开 [http://localhost:5173](http://localhost:5173)。

### 3. 登录演示账号

```text
邮箱：demo@careerflow.dev
密码：demo123
```

首次运行时，应用会自动创建 SQLite 数据库和 5 条演示职位，不需要手动导入数据。

## 3 分钟体验项目

登录后建议按这个顺序操作：

1. **查看总览**
   - 顶部显示全部机会、活跃进程、面试转化率和 Offer 数量。
   - 右侧“接下来”显示近期面试或跟进事项。

2. **新增职位**
   - 点击右上角“新增机会”。
   - 填写公司、职位、状态和岗位描述。
   - 保存后，职位会立即进入申请管道。

3. **更新投递进度**
   - 在总览中拖动职位卡片。
   - 可以从“心愿清单”拖到“已投递”“面试中”或“已录用”。
   - 状态和统计数据会同步更新。

4. **搜索与编辑**
   - 点击左侧“全部机会”。
   - 按公司、职位或城市搜索，也可以按状态筛选。
   - 点击任意一行可编辑或删除职位。

5. **分析简历匹配度**
   - 点击左侧“匹配分析”。
   - 选择一个带有岗位描述的职位。
   - 粘贴简历文本，点击“开始匹配分析”。
   - 页面会返回匹配分数、已覆盖技能、缺失技能和优化建议。

匹配分析在本地完成，不会把简历上传到第三方服务，也不需要配置 API Key。

## Docker 启动

已经安装 Docker Desktop 的用户可以执行：

```bash
docker compose up --build
```

然后打开 [http://localhost:3000](http://localhost:3000)。

停止服务：

```bash
docker compose down
```

SQLite 数据保存在 Docker 命名卷 `careerflow-data` 中。普通的 `docker compose down` 不会删除数据。

## 常用命令

| 命令 | 用途 |
| --- | --- |
| `pnpm dev` | 同时启动前端和 API，适合开发 |
| `pnpm typecheck` | 检查前后端 TypeScript 类型 |
| `pnpm test` | 运行 API 和匹配算法测试 |
| `pnpm build` | 构建生产版本 |
| `pnpm start` | 启动已构建的生产服务 |

生产模式运行：

```bash
pnpm build
pnpm start
```

打开 [http://localhost:3000](http://localhost:3000)。

## 数据保存在哪里

本地开发数据保存在：

```text
data/careerflow.db
```

如果想恢复最初的演示数据：

1. 停止开发服务；
2. 删除 `data/careerflow.db`；
3. 再次执行 `pnpm dev`。

应用会重新创建数据库和演示职位。

## 常见问题

### `pnpm` 命令不存在

```bash
corepack enable
corepack prepare pnpm@11.7.0 --activate
```

关闭并重新打开终端后再执行 `pnpm --version`。

### 启动时提示端口被占用

CareerFlow 默认使用：

- `5173`：前端开发服务
- `3000`：后端 API 和生产服务

关闭占用端口的程序后重新运行 `pnpm dev`。

### SQLite 出现兼容错误

项目使用 Node.js 原生 SQLite，请确认：

```bash
node --version
```

版本必须为 Node.js 24 或更高。

### 修改代码后生产页面没有变化

重新构建并启动：

```bash
pnpm build
pnpm start
```

## 项目结构

```text
careerflow/
├─ src/                    # React 前端
│  ├─ App.tsx              # 页面与交互
│  ├─ api.ts               # API 请求封装
│  └─ styles.css           # 响应式样式
├─ server/                 # Express 后端
│  ├─ app.ts               # 路由与认证
│  ├─ database.ts          # SQLite 数据层
│  └─ matcher.ts           # 可解释匹配算法
├─ tests/                  # 自动化测试
├─ .github/workflows/      # GitHub Actions
├─ Dockerfile
└─ docker-compose.yml
```

## 技术栈

| 层级 | 技术 |
| --- | --- |
| 前端 | React 19、TypeScript、Vite、原生 CSS |
| 后端 | Node.js 24、Express 5 |
| 数据库 | Node.js 原生 SQLite |
| 认证 | scrypt、HttpOnly Cookie、SameSite Cookie |
| 测试 | Node Test Runner |
| 工程化 | Docker、Docker Compose、GitHub Actions |

## 功能清单

- 演示账号登录与服务端会话
- 职位新增、编辑、删除、搜索和筛选
- 拖拽式求职申请管道
- 面试转化率与 Offer 转化率统计
- 下一步行动提醒
- 简历与岗位技能匹配
- 桌面端和移动端响应式布局
- 自动化测试与持续集成

## API

| Method | Endpoint | 用途 |
| --- | --- | --- |
| `POST` | `/api/auth/login` | 登录 |
| `GET` | `/api/auth/me` | 获取当前用户 |
| `POST` | `/api/auth/logout` | 退出登录 |
| `GET` | `/api/jobs` | 获取职位列表 |
| `POST` | `/api/jobs` | 新增职位 |
| `PATCH` | `/api/jobs/:id` | 更新职位 |
| `DELETE` | `/api/jobs/:id` | 删除职位 |
| `GET` | `/api/analytics` | 获取统计指标 |
| `POST` | `/api/analyze` | 分析简历匹配度 |

## 运行测试

```bash
pnpm typecheck
pnpm test
pnpm build
```

测试覆盖登录鉴权、职位增删改、输入校验、统计指标和匹配算法。GitHub Actions 会在提交到 `main` 或创建 Pull Request 时自动运行这些检查。

## 发布到 GitHub

先在 GitHub 创建一个名为 `careerflow` 的空仓库，然后执行：

```bash
git init -b main
git add .
git commit -m "feat: launch CareerFlow"
git remote add origin https://github.com/<你的用户名>/careerflow.git
git push -u origin main
```

更完整的发布检查见 [PUBLISHING.md](PUBLISHING.md)。

公开部署前请注意：当前演示账号的数据由所有访问者共享。如果要面向真实用户，需要增加用户注册、独立账户数据和密码重置功能。

## 简历描述示例

> 独立设计并实现 CareerFlow 全栈求职管理平台，使用 React、TypeScript、Express 与 SQLite 完成拖拽式申请管道、实时漏斗指标和可解释岗位匹配；通过 HttpOnly 会话、自动化 API 测试、Docker 多阶段构建和 GitHub Actions 建立完整工程化交付链路。

请只填写真实数据。项目上线后，可以继续补充部署地址、使用人数或 GitHub Star 数。

## License

[MIT](LICENSE)
