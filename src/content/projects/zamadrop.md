---
title: "zamadrop"
description: "基于 Zama fhEVM 的机密代币分发：隐藏个人份额，同时保留公开可问责性。"
category: "onchain"
order: 50
websiteURL: "https://zamadrop.xyz"
repoURL: "https://github.com/huaruic/zamadrop"
---

zamadrop 是一个运行在 Zama fhEVM 上的机密代币分发应用。接收地址与 Campaign 状态保持公开，每个地址的分配数量则以密文保存在链上，减少公开空投名单带来的钓鱼和定向攻击风险。

## 隐私与可验证性

- 个人 Token Allocation Amount 保持加密。
- Campaign 总量与状态可以公开核对。
- 完成 Solidity / fhEVM 合约、前端、部署脚本、产品文档与安全模型。

## 技术

Solidity、Hardhat、Zama fhEVM、React、wagmi 与 viem。目前提供 Sepolia 测试网版本。

zamadrop 曾进入 FHE Hackathon Top 5 并获得奖金。
