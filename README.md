# CareerFlow

CareerFlow 是一个全栈求职管理项目。上传到 GitHub 后，可以通过 GitHub Codespaces 直接启动，不需要在本机安装开发环境。

## 一、上传项目到 GitHub

### 1. 创建仓库

登录 GitHub，点击右上角 **New repository**：

- Repository name：`careerflow`
- Visibility：选择 `Public`
- 不要勾选初始化 README、`.gitignore` 或 License

创建仓库后，复制仓库地址。

### 2. 推送项目

在 CareerFlow 项目目录打开终端，依次执行：

```bash
git init -b main
git add .
git commit -m "feat: launch CareerFlow"
git remote add origin https://github.com/<你的用户名>/careerflow.git
git push -u origin main
```

将 `<你的用户名>` 替换为自己的 GitHub 用户名。

`git add .` 会根据 `.gitignore` 自动排除 `node_modules`、构建文件和本地数据库，因此不要手动上传这些文件。

## 二、在 GitHub 上启动项目

项目已经包含 `.devcontainer/devcontainer.json`，可以直接使用 GitHub Codespaces。

1. 打开刚创建的 `careerflow` 仓库；
2. 点击绿色的 **Code** 按钮；
3. 切换到 **Codespaces**；
4. 点击 **Create codespace on main**；
5. 等待在线编辑器打开并自动安装依赖；
6. 在编辑器底部的终端执行：

```bash
pnpm dev
```

启动完成后：

1. 如果右下角出现端口提示，点击 **Open in Browser**；
2. 如果没有提示，点击编辑器底部的 **Ports**；
3. 找到端口 `5173`；
4. 点击端口右侧的地球图标打开项目。

## 三、登录项目

使用演示账号：

```text
邮箱：demo@careerflow.dev
密码：demo123
```

首次启动时，项目会自动创建 SQLite 数据库和演示数据，不需要额外配置。

## 四、停止或重新打开

- 停止运行：在终端按 `Ctrl + C`。
- 重新启动：再次执行 `pnpm dev`。
- 重新进入：打开仓库，点击 **Code → Codespaces**，选择已有的 Codespace。
- 不再使用时：在 Codespaces 列表中停止或删除实例，避免继续消耗额度。

## 注意

- GitHub Pages 只能托管静态网站，不能运行本项目的 Express 后端和 SQLite 数据库。
- Codespaces 提供的是临时云端运行环境，不是永久公开网站。
- 删除 Codespace 会同时删除其中的本地 SQLite 数据。
- 推送代码后，GitHub Actions 会自动执行类型检查、测试和生产构建。
