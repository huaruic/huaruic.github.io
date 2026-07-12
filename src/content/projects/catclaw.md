---
title: "CatClaw"
description: "面向桌面端的隐私优先本地 AI Agent，把智能体、Skills 与消息渠道放进一个易用界面。"
category: "ai"
order: 10
featured: 1
websiteURL: "https://catclaw.app"
repoURL: "https://github.com/huaruic/catclaw"
---

CatClaw 是一款由 OpenClaw 驱动的本地 AI Agent 桌面应用。我希望把原本依赖命令行的 Agent 编排能力，变成普通用户也能完成安装、配置和使用的产品体验。

## 项目重点

- 将 OpenClaw Runtime 嵌入桌面应用，管理启动、进程生命周期、Provider 配置与本地数据。
- 提供 Onboarding、Chat、Settings、Skills、Channels、健康检查与运行诊断。
- 支持微信、飞书 / Lark、Telegram、钉钉等消息渠道，以及多种模型 Provider。

## 技术

TypeScript、Electron、React、Vite、Zustand、Tailwind CSS、shadcn/ui 与 OpenClaw。
