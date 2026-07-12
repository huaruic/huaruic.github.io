#!/usr/bin/env node
// 新文章脚手架（openspec 任务 8.12）：pnpm new-post "标题" [slug]
// 保证 frontmatter 字段完整；中文标题请显式传第二个参数作为英文 slug。
import { writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const [title, slugArg] = process.argv.slice(2);
if (!title) {
  console.error('用法: pnpm new-post "文章标题" [english-slug]');
  process.exit(1);
}

const auto = title
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");
const slug = slugArg || auto;
if (!slug) {
  console.error("标题无法生成英文 slug，请显式传入: pnpm new-post \"标题\" my-slug");
  process.exit(1);
}

// 以 Asia/Shanghai (+08:00) 生成 date
const parts = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
})
  .format(new Date())
  .replace(" ", "T");
const date = `${parts}+08:00`;

const file = join(
  fileURLToPath(new URL("..", import.meta.url)),
  "src/content/blog",
  `${slug}.md`
);
if (existsSync(file)) {
  console.error(`已存在: ${file}`);
  process.exit(1);
}

const template = `---
title: "${title}"
description: ""
date: ${date}
tags: []
draft: true
---

<!-- 编辑提示：
  1. description 必填：一句自然语言摘要（≥10 字符，禁止占位符），会用于搜索结果与分享卡片
  2. 正文从 ## 二级标题开始，层级顺序嵌套，不要使用 # 一级标题
  3. 完稿后删除 draft: true 再发布；发布前跑 pnpm verify
-->

##

`;

writeFileSync(file, template);
console.log(`已创建: ${file}`);
