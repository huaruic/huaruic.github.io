# SEO、GEO 与 UI/UX 综合整改提案

## Why

当前站点没有阻断全站抓取或构建的致命问题，但审计发现了一个公开凭据风险、一个待确认的内容权属风险，以及会削弱搜索一致性、AI 引用可信度、首屏性能和移动端体验的系统性缺口。现在需要把这些问题转成有优先级、依赖关系和验收标准的 OpenSpec 变更，避免零散修补与不可验证的“SEO 优化”。

## What Changes

- **P0 — 安全与可信度**：撤销并清理公开凭据；核实高相似内容的权属，按核实结果删除、下线或规范署名与 canonical；加入持续防泄漏门禁。
- **P1 — 技术 SEO**：统一 canonical 与站内 URL、规范标签 slug、修复标题层级与元数据、改造 404、补齐 RSS/sitemap/语言与结构化数据契约。
- **P1 — 性能**：削减字体与阻塞 CSS、按需加载 Pagefind、移除首屏延迟动画、建立响应式图片流水线并修复客户端监听器生命周期。
- **P1 — GEO 与内容**：建立唯一作者实体及稳定 `@id`，补齐可见署名、项目证据、主题集群和上下文内链，统一站点命名、日期与内容语言。
- **P1 — UI/UX 与可访问性**：重构首页首屏、博客发现路径和代表项目表达；补齐当前导航、触控尺寸、对比度、焦点、减弱动画和搜索对话框语义。
- **P2 — 质量与观测**：在 CI 中加入安全、内容、链接、Schema 与性能回归检查；接入搜索站长平台、Core Web Vitals/转化观测并更新项目文档。

## Capabilities

### New Capabilities

- `security-content-integrity`：公开内容的秘密防护、权属治理、资源完整性与事实一致性。
- `technical-seo-discoverability`：规范 URL、索引控制、元数据、语义结构、sitemap/RSS、语言与域名发现能力。
- `web-performance`：字体、搜索资源、首屏动画、图片和客户端生命周期的性能预算。
- `entity-content-geo`：作者实体、结构化数据、可见信任信号、主题集群、项目证据与 AI 可引用内容。
- `ui-accessibility`：首页、导航、博客、项目、文章、标签、搜索与错误页的可用性和可访问性。
- `quality-observability`：CI 质量门禁、搜索可见性、真实用户体验与文档同步。

### Modified Capabilities

- 无；仓库此前没有 OpenSpec 基线规范，本变更建立第一组能力规范。

## Impact

- 主要影响 `src/components`、`src/layouts`、`src/pages`、`src/content`、`src/styles`、`src/consts.ts`、`src/content.config.ts`、Astro 配置、静态资源与 GitHub Actions。
- 需要内容作者确认姓名/品牌展示、内容权属、写作时区、爬虫策略和可公开的项目证据；需要域名管理权限完成 `www` DNS 与重定向。
- 标签与尾斜杠规范化可能改变旧 URL，必须用永久重定向或兼容 canonical 保留已有链接权益。
- 清理 Git 历史属于破坏性协作操作，实施前必须单独确认并通知所有协作者。

## Non-goals

- 本提案不承诺搜索排名、AI 引用或富结果展示。
- 不通过堆叠 FAQ、Organization 或无页面证据的 Schema 制造“GEO 信号”。
- 不把 `llms.txt` 或显式允许某个 AI bot 当作核心排名方案；它们只能在实体、内容和技术基础完成后按站点所有者策略选择。
- 本轮只记录整改，不直接实施业务代码、DNS、历史重写或外部平台配置。
