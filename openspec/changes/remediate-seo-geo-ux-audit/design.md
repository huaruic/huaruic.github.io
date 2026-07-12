# 设计：SEO、GEO 与 UI/UX 综合整改

## Context

站点是部署在 GitHub Pages 的 Astro 5 静态个人站，内容包括中文博客、项目和工作经历。现有构建、robots、canonical、sitemap、RSS 与基础 JSON-LD 可以工作，但本地审计、生产抽查、Lighthouse 和渲染检查显示：安全与内容可信度存在必须先处理的风险；URL、标签、元数据和实体没有统一的数据源；首屏性能被字体、Pagefind 和入场动画拖累；博客/项目的信息架构与移动端可访问性尚未支撑“AI Agent 独立开发者”的定位。

本设计把问题分成 P0/P1/P2。P0 是立即控制安全或法律/信誉风险；P1 是影响搜索一致性、核心性能、可信度或关键用户路径的问题；P2 是增长、观测与持续治理。

## Audit Baseline

| ID | 优先级 | 已记录问题与证据 | 最佳解决方案 | 能力域 |
| --- | --- | --- | --- | --- |
| SEC-01 | P0 | `src/content/blog/Java-basic-knowledge-points.md` 存在公开的凭据型订阅 URL，生产页和 Git 历史均有暴露风险。规范不得复制真实秘密值。 | 先在服务端撤销/轮换，再从内容、部署产物和缓存中清理；CI 与本地提交阶段启用秘密扫描。Git 历史重写默认不执行（REV-H，见 Decision 12）。 | `security-content-integrity` |
| CONTENT-01 | P0 | `short-think.md` 与第三方文章高度相似，且文中第一人称资产归属与本站作者身份存在冲突。 | 由所有者核实版权与身份；无授权则下线并处理索引，有授权则添加清晰署名、来源和正确 canonical；保留处置证据。 | `security-content-integrity` |
| CONTENT-02 | P1 | `videos.md` 是过时测试内容，`countdown-to-dayTwo-2022.md` 极薄；`2021-year-end-summary.md` 至少 7 个本地图片引用失效。 | 删除/重定向无价值测试页，补充或合并薄内容；恢复或移除缺失资源，并用 CI 检查本地引用。 | `security-content-integrity` |
| CONTENT-03 | P1 | 多篇内容的标题、文件名、正文年份或日期不一致，日期格式化没有明确写作时区。 | 在 frontmatter 中建立可校验日期/更新日期与站点时区，修正已知矛盾并添加内容 lint。 | `security-content-integrity` |
| SEO-01 | P1 | 大量站内链接使用无尾斜杠路径，而 canonical/sitemap 使用尾斜杠，生产会发生 301。 | 以 Astro `trailingSlash: "always"` 配置级强制为主要防线（REV-C，见 Decision 11）；URL helper 仅辅助模板拼绝对 URL，不再要求独立 CI 扫描器。 | `technical-seo-discoverability` |
| SEO-02 | P1 | 标签存在 `Java`/`java` 大小写碰撞及中英同义、宽泛和单篇薄标签；不同文件系统上可能生成不同结果。 | 分离稳定 tag id/slug 与显示名，大小写无关去重；仅为确认存在外链的旧标签路径提供兼容页（REV-D，见 Decision 12），其余直接归一；合并/不索引低价值标签页。 | `technical-seo-discoverability` |
| SEO-03 | P1 | `/blog/` 没有页面 H1，描述“所有文章的归档。”信息量低。 | 添加唯一 H1、明确主题定位、搜索/主题入口和有意义的页面摘要。 | `technical-seo-discoverability` |
| SEO-04 | P1 | 文章存在多个 H1、从 H1 跳到 H3/H4 等层级错误。 | 布局拥有唯一 H1，正文从 H2 开始并顺序嵌套；Markdown lint/构建检查阻止错误层级。 | `technical-seo-discoverability` |
| SEO-05 | P1 | 大量 description 过短、重复、含占位符、Markdown 表格或裸 URL。 | 扩展内容 schema，要求唯一、自然、无标记的摘要；以质量规则而非机械字符填充进行 lint。 | `technical-seo-discoverability` |
| SEO-06 | P1 | 全站默认 OG 图仍是上游 AstroPaper 资产，文章 `og:type` 固定为 `website`；BlogPosting 字段与稳定实体引用不完整。 | 更换品牌默认图并支持页面级 OG；文章输出 `article` 与证据支撑的 BlogPosting 图谱，统一稳定 `@id`。 | `technical-seo-discoverability` / `entity-content-geo` |
| SEO-07 | P1 | 404 使用普通布局、英文 H4，可能输出 canonical 且 `/404`/`/404.html` 可作为普通 200 页面被发现。 | 为 Head/Layout 增加 robots/canonical 控制；404 使用中文 H1、`noindex`、无 canonical、Pagefind 排除和恢复路径。 | `technical-seo-discoverability` / `ui-accessibility` |
| SEO-08 | P2 | sitemap 没有可信 `lastmod`；页面 Head 没有 RSS autodiscovery。 | 只在有真实内容日期时输出 `lastmod`，补 `<link rel="alternate" type="application/rss+xml">` 并验证 feed。 | `technical-seo-discoverability` |
| SEO-09 | P2 | `www.huaruic.com` 未形成可验证的单一主机跳转。 | 配置 DNS 和边缘/托管层永久重定向到 apex，确保路径与查询字符串保留。 | `technical-seo-discoverability` |
| SEO-10 | P2 | 全局 `zh-CN` 与少量英文/测试内容不匹配；当前没有真实翻译对，不应伪造 hreflang。 | 为内容增加可选语言字段并输出正确 `lang`；只有存在互为翻译的页面时才建立 hreflang 集合。 | `technical-seo-discoverability` |
| PERF-01 | P1 | Head 导入 Geist Sans 与 Mono 的 100–900 全部字重，构建产生大量字体文件与大 CSS。 | 共同前置：删除全部 18 个 `@fontsource` 静态导入（Geist 无 CJK 字形，中文实际落系统字体）。随后二选一：方案 A 系统字体栈（0 KiB，推荐）或方案 B 自托管中文 VF + unicode-range 分片 + 子集 preload（REV-A，见 Decision 9）。 | `web-performance` |
| PERF-02 | P1 | 所有页面在 Head 同步加载 Pagefind CSS/JS，搜索组件自身也管理资源。 | 搜索首次打开时按需加载并缓存；未使用搜索的页面不请求 Pagefind UI 资源。 | `web-performance` |
| PERF-03 | P1 | `.animate` 默认隐藏内容并按元素每 100ms 展示，延迟首屏 H1/文章信息的 LCP。 | 删除 JS setTimeout `.animate` 体系，改纯 CSS 入场动画（`backwards` 静态可见、H1/LCP 候选豁免、仅文章正文、移动端截断、尊重 `prefers-reduced-motion`；REV-B，见 Decision 10）。 | `web-performance` / `ui-accessibility` |
| PERF-04 | P1 | 正文图片普遍缺少尺寸、响应式来源和一致的 lazy/decoding；个别页面传输超过 8 MiB，24px 头像使用 400px 原图。 | 通过 Astro 图片流水线生成 AVIF/WebP、`srcset`/`sizes` 和固有尺寸；首屏资源按需 eager，其余 lazy；提供小尺寸头像。 | `web-performance` |
| PERF-05 | P1 | `astro:after-swap` 每次调用 `init()`，可能重复注册滚动、matchMedia 与按钮监听器。 | 使用一次性绑定、AbortController 或成对清理；自动测试多次导航后每个事件只触发一次。 | `web-performance` |
| PERF-06 | P1 | 首页移动实验室基线约 Performance 88、FCP 2.9s、LCP 3.2s；真实用户 INP 尚无数据。 | 以固定环境三次中位数建立 LCP/CLS/TBT 预算，作为发布后/月度验证而非 PR 门禁（REV-F）；真实 INP 以 Search Console/CrUX 为准，不引入 RUM（REV-G，见 Decision 12）。 | `web-performance` / `quality-observability` |
| GEO-01 | P1 | 站点同时使用 `Always Exploring`、`Ernest`、`Ernest Chen`、`huaruic` 和 `0xErnest247`，作者实体散落在模板中。 | 建立单一 AUTHOR 配置和 `https://huaruic.com/#person`；以 Ernest Chen 为站点/作者主体，`Always Exploring` 作为 tagline，待所有者确认最终展示。 | `entity-content-geo` |
| GEO-02 | P1 | 作者只出现在 JSON-LD，文章缺少可见署名；63 篇文章没有统一 author/updated/cover 字段。 | 在页面展示链接到作者/ProfilePage 的 byline，扩展内容 schema，并让可见内容、meta 与 JSON-LD 共用同一数据源。 | `entity-content-geo` |
| GEO-03 | P1 | 首页定位 AI Agent，但现有相关文章很少；项目详情较薄，缺角色、状态、取舍、结果、截图或第三方证据。 | 建立本地 Agent、AI-native 工程、隐私/链上三组主题集群；将代表项目升级为基于真实证据的案例，未知指标留空。 | `entity-content-geo` |
| GEO-04 | P1 | 博客正文几乎没有指向本站相关文章或项目的上下文内链，仅依赖上一篇/下一篇。 | 每篇核心文章链接相关项目和 2–4 篇真正相关内容；项目页反向链接指南，使用描述性锚文本。 | `entity-content-geo` |
| GEO-05 | P1 | 标签页缺少主题说明、层级与最近内容，`others` 等宽泛标签占比高。 | 清洗分类法，为重要主题页加入独特介绍和精选/最近内容；合并或 noindex 薄标签页。 | `entity-content-geo` |
| GEO-06 | P2 | 存在多组主题相近文章，可能造成搜索意图重叠。 | 做关键词/意图盘点；按证据选择合并重定向、差异化定位或互链，不按标题相似度机械删除。 | `entity-content-geo` |
| GEO-07 | P2 | AI 爬虫策略、`llms.txt` 与训练/搜索用途没有站点所有者决策。 | robots 明确区分搜索发现与模型训练策略；`llms.txt` 仅在基础完成后作为可选的简洁导航文件，不宣称排名收益。 | `entity-content-geo` / `quality-observability` |
| UX-01 | P1 | 首页 H1 较弱、首屏说明较长、没有按钮级主次 CTA。 | 使用结果导向的 32–40px 核心定位、两行内支持文案、主 CTA“查看代表项目”和次 CTA“联系合作”；长介绍下移。 | `ui-accessibility` |
| UX-02 | P1 | 导航无当前状态；手机隐藏完整品牌后仅剩小头像，多数链接/控件不足 44×44px。 | 添加 `aria-current` 和可见当前态；手机保留短字标，移除装饰分隔符，关键目标最小 44×44px。 | `ui-accessibility` |
| UX-03 | P1 | 博客页直接展示多年完整归档，缺 H1、精选、日期、主题入口、分页/折叠和 URL 可分享筛选。 | 顶部提供定位、搜索和主题；先展示 3–5 篇精选/最新，其余保留单页年份分组归档 + 年份锚点，当前 65 篇规模不做分页与 URL 筛选（REV-E，见 Decision 12）。 | `ui-accessibility` |
| UX-04 | P1 | 11 个项目使用同一种文本卡片，缺少视觉与成果证明，内容类型差异不明显。 | 重点展示 2–3 个代表案例的截图、问题、角色、状态、决策和真实结果，其余保留紧凑索引。 | `ui-accessibility` / `entity-content-geo` |
| A11Y-01 | P1 | 浅色日期文本约 3.47:1；邮箱 accessible name 与可见文字不一致；缺自定义 `focus-visible`、`:visited`、skip link 和减弱动画规则。 | 普通小文本达到 WCAG AA 对比度，名称匹配可见标签；建立一致焦点/已访问状态、跳转主内容和 reduced-motion 行为。 | `ui-accessibility` |
| UX-05 | P2 | 搜索虽可用但英文提示、缺显式关闭按钮与完整 dialog/input 属性。 | 中文化，提供 44px 关闭按钮、dialog 标题与描述、焦点约束/恢复、Escape/遮罩关闭和稳定 input id/name。 | `ui-accessibility` |
| UX-06 | P2 | Tags 页使用英文小标题、按钮偏小且近似孤岛；404 是模板式死路。 | 中文化主题中心并从博客显式进入；404 提供首页、搜索和项目恢复动作。 | `ui-accessibility` |
| UX-07 | P2 | 首页主要内容使用 `<aside>`，全站卡片视觉过于同质，个人识别度有限。 | 修正 landmark；保留克制配色与深色模式，建立短字标、代表项目图像和按内容类型区分的布局。 | `ui-accessibility` |
| OPS-01 | P2 | README 仍保留上游 AstroPaper 品牌/部署说明，与当前项目和 GitHub Pages 不一致。 | 重写项目用途、内容模型、命令、部署、SEO/性能约束和 OpenSpec 工作流说明。 | `quality-observability` |
| OPS-02 | P2 | CI 只有格式和构建，不能发现秘密、坏资源、URL/标签冲突、元数据、Schema 或性能回归。 | 增加分层快速门禁，PR 必跑确定性检查；性能审计使用稳定环境和预算报告。 | `quality-observability` |
| OPS-03 | P2 | 缺少已确认的 Search Console/Bing、sitemap 提交、索引抽查、真实 CWV 和关键 CTA 观测。 | 完成站点验证与 sitemap 提交；真实 CWV 以 Search Console/CrUX 为唯一来源（REV-G，不引入 RUM 与转化事件），建立月度复查。 | `quality-observability` |
| NEW-01 | P1 | 搜索遮罩无背景色：`PageFind.astro` 的 `bg-[rgba(0, 0, 0, 0.5]` 是非法 arbitrary value（含空格且缺右括号），Tailwind 不生成任何样式，遮罩只有模糊没有变暗。 | 修正为合法类名（如 `bg-black/50`），遮罩必须半透明变暗并在明暗主题下验证。 | `ui-accessibility` |
| NEW-02 | P2 | 关闭搜索不清空输入：`closePagefind()` 对 `#search` div 设置 `.value` 无效，重开时残留上次查询。 | 选中容器内真正的 `<input>` 元素清空，并验证重开搜索为空态。 | `ui-accessibility` |
| NEW-03 | P1 | 全局 `/` 键劫持：keydown 监听不判断焦点位置，用户在搜索框或任何表单内输入 `/` 会被 `preventDefault` 吞掉。 | 焦点位于 `input`/`textarea`/`contenteditable` 时不拦截快捷键；仅在无输入焦点时响应 `/` 与 `Cmd/Ctrl+K`。 | `ui-accessibility` |
| NEW-04 | P2 | back-to-top 双重绑定：`BackToTop.astro` 自带 DOMContentLoaded 绑定，`Head.astro` 的 `init()` 又绑一次 click，点击触发两次 `scrollTo`。 | 只保留一处绑定，纳入 PERF-05 的监听器生命周期治理统一验证。 | `web-performance` |
| NEW-05 | P2 | Giscus 死代码：评论系统已移除，但 `setGiscusTheme()` 仍在每次 `init()` 和 `toggleTheme()` 中执行。 | 删除函数及全部调用点。 | `web-performance` |
| NEW-06 | P2 | `Head.astro` 输出 `<meta name="title">`，无任何搜索引擎消费该标签。 | 删除。 | `technical-seo-discoverability` |
| NEW-07 | P2 | Twitter 卡片元标签全部使用 `property=`，规范要求 `name="twitter:*"`。 | 改为 `name=` 属性并验证卡片解析。 | `technical-seo-discoverability` |
| NEW-08 | P1 | Favicon 策略缺失：400px 头像 PNG 被声明为唯一 icon（`sizes="400x400"`），无小尺寸 favicon、无 SVG，apple-touch-icon 非 180×180。 | 提供 32px ico/PNG 或 SVG favicon + 180×180 `apple-touch-icon` 三件套，标签页图标不再下载 400px 原图。 | `technical-seo-discoverability` |
| NEW-09 | P1 | `@astrojs/sitemap` 未配置 `filter`，`/404/` 会作为普通页面进入 sitemap。 | 配置 sitemap `filter` 排除 404 及其他非规范页面，与 SEO-07 联动验证。 | `technical-seo-discoverability` |
| NEW-10 | P2 | RSS 输出缺 `<language>zh-CN</language>`，且无全文/摘要输出策略。 | 补 `language` 字段，评估 `customData`/内容输出策略并验证 feed。 | `technical-seo-discoverability` |
| NEW-11 | P1 | 代码复制按钮无 accessible name：按钮内容为 emoji 📋/✅，读屏朗读为字符名而非功能。 | 添加 `aria-label="复制代码"`，复制成功用 `aria-live` 反馈状态。 | `ui-accessibility` |
| NEW-12 | P2 | 桌面 TOC 无当前小节高亮（scrollspy），正文标题也无 hover 锚点链接。 | IntersectionObserver 实现当前小节高亮 + 当前态样式；正文标题提供 hover 锚点。 | `ui-accessibility` |
| NEW-13 | P2 | `article { text-align: justify }` 在中英混排与行内代码场景产生大空隙，影响可读性。 | 改为左对齐（`start`），与 Apple 官方中文页面排版一致。 | `ui-accessibility` |
| NEW-14 | P2 | `utils.ts` 的 `formatDate()` 为 en-US 格式死代码，实际渲染走 `FormattedDate` 的 zh-CN。 | 删除死代码。 | `web-performance` |

## Reference: astro-theme-retypeset 模式分析

2026-07-12 复审时对照分析了 [astro-theme-retypeset](https://github.com/radishzzz/astro-theme-retypeset)（演示站 retypeset.radishzz.cc）的源码，提炼出以下可移植模式：

- **字体（中文自托管的正确姿势）**：中文可变字体（早夏宋体 VF）按 `unicode-range` 切成 71 个 woff2 分片（总 3.6MB、平均约 50KB/片），浏览器只下载页面字符命中的分片；另有 17KB 高频子集（符号 + 拉丁 + 数字 + 常用字）`preload` 消除首屏 FOUT；全部 `font-display: swap` + 系统回退。这是 Google Fonts CJK 官方分片策略的自托管复刻，工具可用 cn-font-split。仅在字体方案 B 时采纳。
- **动画（纯 CSS、有节制、有退出机制）**：`@keyframes fadeInUp` + `nth-child` 阶梯 `animation-delay`（0.15s 起每级 +0.05s、第 16 个后封顶），缓动 `cubic-bezier(0.165, 0.84, 0.44, 1)`，时长 0.5s；入场仅作用于文章正文，移动端第 8 个元素后截断；`prefers-reduced-motion`/配置/浏览器能力三重减弱保护；主题切换用 View Transitions `clip-path` reveal；列表→详情用 `transition:name` shared-element morph。
- **明确不照抄**：其正文全量初始 `opacity: 0` 仍会延迟 LCP——本站要求 H1 与 LCP 候选豁免入场动画（PERF-03/Decision 10 更严格）；71 分片衬线字体默认全套不引入，仅字体方案 B 时按需启用。

## Goals / Non-Goals

### Goals

- 先消除安全、版权和事实可信度风险，再推进可发现性与增长。
- 让 URL、作者、内容、meta、JSON-LD 与页面可见信息来自稳定的数据契约。
- 改善移动端首屏、文章发现、项目证明与无障碍交互，同时保留现有克制、可读的视觉基础。
- 把质量检查变成 CI 与观测系统可重复执行的验收，而不是一次性 Lighthouse 分数。

### Non-Goals

- 不在没有授权时重写 Git 历史、改变 DNS 或代替站点所有者决定版权/爬虫政策。
- 不虚构作者组织、项目指标、用户评价、评分、报价或时间戳。
- 不为没有真实翻译关系的页面输出 hreflang。
- 不以内容长度、description 字符数或 Schema 数量作为单一质量目标。

## Decisions

### Decision 1: P0 处置先于任何发布优化

凭据必须先撤销后清理，因为仅删除页面不能使已泄漏的值失效。高相似内容必须先确认权属，避免在优化元数据后扩大潜在侵权页的传播。

**Alternative considered:** 与普通内容清理一起发布。拒绝，因为安全和权属风险有独立的外部影响与证据链。

### Decision 2: 用数据源统一实体与 URL

在配置层建立 AUTHOR/SITE 与 canonical URL helper；页面可见信息、Head、JSON-LD、RSS、sitemap 和内链全部消费同一来源。结构化数据使用 `@graph` 和稳定 `@id` 连接 Person、WebSite、ProfilePage、BlogPosting/适当的项目类型。

**Alternative considered:** 在每个模板中继续内联字符串。拒绝，因为当前身份和 URL 漂移正是由重复定义造成。

### Decision 3: 迁移标签与 URL 时保留已有权益

采用稳定、大小写无关的 tag id/slug 与独立显示名。旧标签和无尾斜杠路径必须永久重定向，若 GitHub Pages 无法原生配置全部规则，则生成静态兼容页，输出指向规范 URL 的 canonical 并从 sitemap/内链移除。

**Alternative considered:** 直接删除旧路径。拒绝，因为会制造 404 并丢失外部链接权益。

> 2026-07-12 修订：尾斜杠部分由 Decision 11（REV-C，配置级强制）接管；标签兼容范围由 Decision 12（REV-D，仅限确认有外链的旧标签）收窄。

### Decision 4: 内容 schema 是质量合同，不是填字段竞赛

frontmatter 增加可选但可验证的 `updated`、`image`、`lang`、作者引用和项目证据字段。发布态拒绝占位符、坏本地资源、重复 tag slug 和非法标题层级；没有真实值时字段保持缺失，Schema 同步省略。

**Alternative considered:** 自动生成作者、更新时间、关键词和结果。拒绝，因为构建时间不是内容更新时间，生成式填充值会损害可信度。

### Decision 5: 首屏内容默认可见，增强效果渐进加载

字体只加载实际使用资源；Pagefind 在首次交互时加载；LCP 候选不依赖定时器显示；图片由构建流水线生成固有尺寸和响应式格式；客户端事件初始化可重复调用但不会重复绑定。

**Alternative considered:** 保留所有全局资源以简化代码。拒绝，因为当前站点的静态特性适合按需加载，且全局成本由每个访问承担。

### Decision 6: 按用户任务区分信息架构

首页回答“Ernest 是谁、解决什么、下一步做什么”；博客支持搜索/主题/精选/归档；项目页提供案例证据；文章页优先阅读和关联发现。组件可以复用，但不同内容类型不再全部表现为同一种箭头卡片。

**Alternative considered:** 只调整颜色、字号与阴影。拒绝，因为主要问题是信息优先级和证据不足，不是装饰细节。

### Decision 7: GEO 以可验证实体和内容为核心

核心投入顺序为身份一致性、可见作者、第一手项目证据、清晰主题集群、上下文内链和可解析结构化数据。机器人策略与 `llms.txt` 由站点所有者选择，不能写成排名保证。

**Alternative considered:** 优先批量创建 FAQ/AI 专用页。拒绝，因为缺乏用户需求与页面证据，并可能增加薄内容。

### Decision 8: 性能与可访问性使用多层证据

确定性构建检查负责语义、资源和数据；固定环境 Lighthouse 使用三次中位数；生产通过 Search Console/CrUX 或自有 RUM 观测 LCP、INP、CLS。WCAG 目标由自动检查加键盘/读屏人工走查共同验证。

**Alternative considered:** 以一次本地 Lighthouse 100 分作为完成。拒绝，因为实验室波动且无法覆盖真实 INP、内容质量和全部交互。

### Decision 9: 字体二选一，先删错付的成本（REV-A）

共同前置：删除全部 18 个 `@fontsource` Geist Sans/Mono 静态字重导入——Geist 不含 CJK 字形，中文正文实际全部落在系统字体上，当前成本只装饰拉丁字符。随后由所有者在两案中决策（进 Open Questions）：**方案 A** 系统字体栈（`-apple-system`/SF Pro/PingFang SC 等，0 KiB 传输，推荐，Apple 质感且天然无 FOUT/CLS）；**方案 B** Retypeset 式自托管中文 VF（unicode-range 分片 + ≤20 KiB 高频子集 preload + `font-display: swap`，西文用单一变量字体文件）。

**Alternative considered:** 仅削减字重数量继续用 @fontsource Geist。拒绝，因为无论保留几个字重，对中文站的主要文本仍然无效。

### Decision 10: 动画体系整体替换为纯 CSS（REV-B）

删除 JS setTimeout `.animate` 体系（含 noscript 补丁）。替代方案：纯 CSS `@keyframes` + `nth-child` 阶梯 `animation-delay`，使用 `animation-fill-mode: backwards` 保证元素静态状态可见（无 JS、爬虫、阅读模式下内容永远可见）；H1 与 LCP 候选豁免动画；入场仅作用于文章正文；移动端第 8 个元素后截断；`prefers-reduced-motion` 下全部禁用。主题切换改用 View Transitions `clip-path` reveal 并删除现有 `* { transition: none !important }` 注入 hack。列表→详情的 `transition:name` shared-element morph 为可选增强。

**Alternative considered:** 保留 JS 体系仅限制到视口下方。拒绝，因为纯 CSS 方案以更少代码同时解决 LCP、noscript 与监听器生命周期问题。

### Decision 11: 尾斜杠用配置级强制（REV-C）

Astro `trailingSlash: "always"` 作为主要防线——框架在构建期直接拦截不一致路径，替代自建 CI 扫描器。URL helper 仅保留用于模板中拼接绝对 URL（canonical、Schema、RSS），不再承担尾斜杠归一职责。修订原 SEO-01 方案。

**Alternative considered:** 自建 `toCanonicalPath()` + CI 扫描。拒绝，配置级强制更简单且回归防护由框架原生保证。

### Decision 12: 降级项汇总（REV-D～J）

按站点规模（65 篇文章的个人静态博客）把以下方案降级，避免过度工程：**REV-D** 标签迁移只为确认有外链的旧标签做兼容页，其余直接归一；**REV-E** 博客归档不分页、不做 URL 筛选，保留单页年份分组 + 锚点；**REV-F** Lighthouse 三次中位数移出 PR 门禁，改为发布后/月度验证，PR 门禁只保留确定性检查；**REV-G** 移除 RUM 与转化事件方案，真实 CWV 以 Search Console/CrUX 为唯一来源；**REV-H** Git 历史重写默认不执行——凭据撤销后泄漏值已失效，重写公开仓库历史收益近零且破坏所有 clone/fork；**REV-I** 引入 autocorrect 中英混排格式化与 new-post 脚手架脚本（借鉴 Retypeset）；**REV-J** astro-og-canvas 按页 OG 图与 LQIP 占位图列为 P2 可选，先用一张静态品牌默认 OG 图。

**Alternative considered:** 维持原全量方案。拒绝，多项基建（分页、RUM、PR 性能门禁、历史重写）的维护成本与站点规模不成比例。

## Performance and Quality Budgets

- 代表页面在约定移动 Lighthouse 配置下，三次中位数 SHALL 达到 LCP ≤ 2.5s、CLS ≤ 0.1、TBT ≤ 200ms；作为发布后/月度验证而非 PR 门禁（REV-F），任何基线退化必须有记录和批准。
- 首屏不得因入场动画延迟可见（H1 与 LCP 候选豁免动画）；未打开搜索时不得请求 Pagefind UI JS/CSS。
- 字体方案 A 下首次页面字体传输为 0 KiB；方案 B 下不超过 300 KiB（含 ≤20 KiB 高频子集）。两案下均不得发布 100–900 全字重的静态字体组合。
- 内容图片必须有固有尺寸；非首屏图片默认 lazy，代表性大图使用响应式现代格式；单页资源预算按页面类型建立并在实施时基于优化后基线锁定。
- 所有普通文本与交互控件达到 WCAG 2.2 AA；关键移动触控目标使用至少 44×44 CSS px，合理的内联文本链接除外。

## Risks / Trade-offs

- **[凭据撤销不彻底]** → 以脱敏失效测试证明原凭据不可用；历史重写默认不执行（REV-H），若所有者坚持执行则单独审批、备份并通知协作者重新同步。
- **[标签/URL 迁移造成流量损失]** → 生成旧到新映射，仅对确认有外链的旧标签做兼容页（REV-D），并通过站长平台观察 404 与索引。
- **[图片转换改变 Markdown 工作流]** → 提供兼容组件/remark 处理和迁移脚本设计，先迁移高流量与超大页面。
- **[字体方案 B 的字形或视觉回退]** → 覆盖中文、英文、代码块页面做视觉回归，使用系统字体 fallback；方案 A 无此风险。
- **[首页文案或项目指标未经证实]** → 所有者审批文案；没有证据的数字不显示。
- **[纯 CSS 入场动画影响 LCP]** → H1 与 LCP 候选豁免动画，`backwards` 保证静态可见；Lighthouse 月度验证 LCP 无回退。

## Migration Plan

1. **P0 containment**：撤销秘密、保留事件证据、核实内容权属；完成前暂停相关页面的推广。
2. **Data cleanup**：修坏图、测试/薄内容、日期矛盾；确认身份、时区、代表项目证据和 tag 映射。
3. **Performance foundation（字体/动画批次，2026-07-12 复审提前）**：按 Decision 9/10 落地字体方案与纯 CSS 动画、按需加载搜索、修复事件生命周期、清理死代码，并锁定预算。
4. **Technical foundation**：建立 AUTHOR/URL/content schema，迁移 canonical、标签、heading、description、404、RSS/sitemap、favicon 和 Schema。
5. **Experience and content**：重构首页、博客、项目、标签、搜索和 404；建设主题集群、案例与内链。
6. **Observability**：扩展 CI、站长平台、真实 CWV 与转化观测；更新 README 和维护手册。
7. **Rollback**：每一阶段独立提交；URL 迁移保留映射；视觉/性能异常时回滚组件但不恢复已撤销的秘密或不可信内容。

## Open Questions

- 最终公开作者名应为 “Ernest Chen” 还是其他法定/职业展示名？`Always Exploring` 是否仅保留为 tagline？
- `short-think.md` 的作者、授权与第三方资产归属是什么？应删除、署名转载还是指向原文 canonical？
- 写作与 `date`/`updated` 统一采用哪个 IANA 时区？当前运行环境为 Asia/Bangkok，但不能直接推定为作者时区。
- 是否拥有 `www.huaruic.com` 的 DNS/重定向配置权限？
- 哪 2–3 个项目可作为代表案例，哪些角色、截图、结果或第三方链接可以公开验证？
- 对 OAI-SearchBot、Claude-SearchBot、PerplexityBot 与训练型 bot 的允许/拒绝策略是什么？
- 是否授权对包含秘密的 Git 历史执行重写与强制推送？默认不执行（REV-H）；若所有者坚持，该操作必须在实施阶段单独确认。
- 字体采用方案 A（系统字体栈）还是方案 B（自托管中文 VF + 分片）？推荐方案 A：Apple 质感即系统字体本身，0 KiB 传输、无 FOUT/CLS、无构建与维护成本；方案 B 仅在明确追求衬线排印个性时选择。
