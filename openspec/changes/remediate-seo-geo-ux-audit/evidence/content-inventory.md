# 内容处置清单（任务 3.1 验收证据）

> 执行日期：2026-07-12。范围：`src/content/blog/`（63 篇）。共 50+ 项操作，全部通过脚本化自查验证。

## P0 凭据脱敏（任务 2.1）

| 文件 | 动作 | 验证 |
| --- | --- | --- |
| Java-basic-knowledge-points.md | 第 176 行凭据型订阅 URL 替换为 `https://example.com/subscribe/<token>` 占位 | `grep -r dler.cloud src/content/` 为 0。**注意：服务端撤销（任务 1.1）仍需站点所有者完成，本清理不使已泄漏值失效** |

## 下线处置（任务 2.5 / 3.4 / 3.5）

| 文件 | 动作 | 理由 |
| --- | --- | --- |
| short-think.md | `draft: true` | 权属未确认（CONTENT-01），待所有者按任务 1.2 决策后再定删除/署名转载 |
| videos.md | `draft: true` | Hugo 时代测试内容（含 `{{< youtube >}}` 失效 shortcode），date 为 2013 年占位 |
| countdown-to-dayTwo-2022.md | `draft: true` | 极薄内容（两张外链图 + 数行文字），其 `随笔与记录。` description 与 `others` 标签随下线一并豁免 |

draft 文章被全站页面、sitemap、RSS、Pagefind 的 `!draft` 过滤排除，等效 noindex 下线。旧 URL 将 404；如站长平台观察到外链流量再补重定向（对应任务 3.4 的软 404 检查由所有者发布后验证）。

## description 重写（任务 3.8，17 篇）

占位符类：Java-basic-knowledge-points（`***`）、views-and-feelings-about-japan（`---`）、2021-to-myself-next-year-today（`展信悦～`）、seven-habits-of-highly-effective-people（Markdown 加粗复读标题）、2024-target-breakdown（"一些目标的拆解"）。
含标记/裸 URL 类：Japan-travel-expenses（Markdown 表格）、warehouse-clould（裸长 URL）、work-porject（截断的正文粘贴）。
截断残句类：the-loneliness-of-a-boat。
`随笔与记录。` 通用占位（8 篇非 draft 全部重写）：2023-last-day、book-of-time、four-people-talk、performance-communication、schopenhauer、six-goals、software-engineering-at-google、sorting-out-historical-code。
全部按正文实际内容重写为 50–120 字纯文本中文摘要。验证：占位 description 计数为 0（不含已 draft 文件）。

## 标题层级（任务 3.9，5 篇）

2022-year-end-summary（1 处）、been-working-for-two-years（2 处）、gc（2 处）、six-goals（1 处）正文 `# ` 一级标题降为 `## `。降级后各文件无 H2→H4 跳级。
**误报更正**：langgraph-tool-calling-workflow-state-thread-id 原审计判定的 4 个"多 H1"实为 Python 代码块内注释，非标题——已用围栏感知检查确认并保持原样。验证：围栏感知扫描全部 63 篇正文，真实 H1 计数为 0。

## 日期修正（任务 3.3）

| 文件 | 动作 |
| --- | --- |
| 25-years-old.md | date 2023-11-19 → `2023-11-30T12:00:00+08:00`（正文首句"2023.11.30 今天真正迈进26岁"为直接证据；时区按 +08:00 规范） |

## 图片（任务 3.2 / 3.10）

| 文件 | 动作 |
| --- | --- |
| 2021-year-end-summary.md | 移除 7 个失效本地引用（`/img/runrun.jpg` 等，public/ 无 img/ 目录）。跑步/电影/书籍小节仅存标题，待所有者补图或补文字（记入待办） |
| 25-years-old.md | 空 alt 补"26 岁生日当天的随拍照片" |
| spring-transactional.md | 空 alt 补"Spring 声明式事务失效问题的调试截图" |

其余内容图片均已有 alt。外链图床（jsdelivr/csdn/guangzhengli）可用性未逐一验证，属任务 8.10 季度复查范围。

## 标签归一（任务 4.3 frontmatter 侧，20 篇）

- 大小写合并：`Java`→`java`（2 篇）；`LangGraph`→`langgraph`、`Tool Calling`→`tool calling`（1 篇）
- 同义合并：`work`→`工作`（1 篇）；work-porject 误标 `生活`→`工作`
- `others` 拆解 15 篇：→`生活`(8)、`自我`(3+1)、`java`(2)、`工作`(1)、`年终总结`(1)、`书籍`(1)
- 结果：15 个标签、无大小写冲突、`others` 仅剩 2 篇 draft 文章（不进构建）
- 早前审计中的"整句标签/我透标签"确认为 grep 溢出假象，全部 63 篇 frontmatter YAML 结构完好，无需修复

## 未处理项（记录原因）

| 项 | 原因 |
| --- | --- |
| 2020-08-16.md 标题"2021/08/16有感"与文件名/date（2020）年份矛盾 | 正文无内证可判定哪个年份正确，不猜测；待所有者确认（任务 3.3 遗留） |
| 24-05-weekly.md 正文"现在是2023年2月3号"（应为 2024） | 属正文笔误而非 frontmatter 错误，不代改作者正文事实表述 |
| gc.md 原有 `## #复制` 标题文本异常 | 预存的标题文字瑕疵，非层级问题，不在最小改动范围 |
| little-red-flower.md description 偏短但真实 | 非占位符，按"只改确实有问题的"原则保留 |
| 2021-year-end-summary.md description 内"2021.11.31"（不存在的日期） | 作者原文表述，不代改 |
| short-think.md 最终处置（删除/署名/canonical） | 阻塞于任务 1.2 所有者权属决策 |
