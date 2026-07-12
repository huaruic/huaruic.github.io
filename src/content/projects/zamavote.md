---
title: "zamaVote"
description: "基于 Zama fhEVM 的机密投票：加密选票、同态统计，并在结束后公开结果。"
category: "onchain"
order: 60
websiteURL: "https://zama-vote.vercel.app"
repoURL: "https://github.com/huaruic/zamaVote"
---

zamaVote 是一个面向社区治理的机密投票 dApp。选票在浏览器侧加密，链上只处理密文计票；投票结束后再公开最终结果，让投票隐私与公共可验证性同时成立。

## 项目重点

- Permissionless Poll Factory 与投票白名单。
- 浏览器侧选票加密、链上同态统计。
- 用户可验证自己的选票，Finalize 后公开结果。

## 技术

Solidity、Zama fhEVM、React、Vite、wagmi 与 viem。目前提供 Sepolia 测试网版本。
