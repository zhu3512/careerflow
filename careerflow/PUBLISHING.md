# 发布到 GitHub

在项目目录中执行：

```bash
git init -b main
git add .
git commit -m "feat: launch CareerFlow"
git remote add origin https://github.com/<你的用户名>/careerflow.git
git push -u origin main
```

推送前建议完成三件事：

1. 将 `LICENSE` 第一行下方的版权人改为你的姓名或 GitHub 用户名；
2. 在 GitHub 仓库的 **About** 中添加简介、技术标签和部署地址；
3. 部署后截取总览与匹配分析页面，在 README 顶部加入产品截图。

推荐仓库简介：

> A full-stack job search command center with a drag-and-drop pipeline, funnel analytics, and explainable resume matching.

推荐 Topics：

```text
react typescript express sqlite job-tracker full-stack docker
```

公开部署时，演示账号的数据会被所有访问者共享。正式面向真实用户前，应增加用户注册、数据隔离策略与账号重置机制。
