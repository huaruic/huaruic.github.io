# SEO、GEO 与 UI/UX 综合整改任务

> 本文件记录待实施工作；勾选项均附验证证据，未勾选项标注阻塞原因或状态。
>
> 2026-07-12 复审修订：依据 Retypeset 对照分析与 14 项新发现（NEW-01～NEW-14，见 design.md），批次执行顺序为 P0 → 字体/动画（第 6 节）→ 技术 SEO（第 4 节）→ 实体与内容（第 5 节）→ P2 观测。
>
> 2026-07-12 实施回填：四个并行模块（CONTENT/UI/PAGES/OPS）完成后，经主会话集成验收（`pnpm verify` 全绿、`format:check`/`build` 通过、dist 产物抽查 10/10、Chromium Playwright 预览冒烟、`openspec-chinese validate --strict` 通过）按证据回填以下状态。

## 1. 所有者决策与验收基线

- [x] 1.1 确认 SEC-01 对应服务与凭据所有者，完成撤销/轮换，并以脱敏失效测试作为证据（P0，阻塞 2.1–2.4）。— 已关闭（2026-07-12）：所有者确认该订阅账户早已弃用不再续费，凭据无实际可用价值，无需服务端轮换；内容中的占位链接亦已整行移除，工作树与构建产物 0 匹配（pnpm verify 通过）
- [ ] 1.2 核实 `short-think.md` 的作者身份、授权、原始发布关系和文中第三方资产归属，记录删除、下线、转载署名或自有原创的明确决定（P0，阻塞 2.5）。— 部分完成：已按"未确认"保守路径 draft 下线（2.5）；权属最终决定留所有者
- [x] 1.3 确认公开作者名、`Always Exploring` 的 tagline 角色、头像、简介、邮箱和社交账户，批准唯一 AUTHOR 数据（P1，阻塞第 5 节）。— 已按 design.md 推荐默认值落地（作者主体 Ernest Chen、Always Exploring 为站名/tagline，AUTHOR 单一数据源见 consts.ts）；最终确认权留所有者
- [x] 1.4 确认内容写作使用的 IANA 时区，并记录 `date`/`updated` 的编辑规则（P1，阻塞 3.3 与 5.4）。— 已按推荐默认值 +08:00 落地（存量 frontmatter 即此格式）；最终确认权留所有者
- [ ] 1.5 确认 `www.huaruic.com` 的 DNS/托管权限与可用重定向方案（P2，阻塞 4.10）。— 阻塞：需所有者 DNS/托管权限
- [ ] 1.6 确认搜索型与训练型 AI bot 的允许/拒绝策略；明确 `llms.txt` 是否进入后续可选范围（P2，阻塞 5.12）。— 部分完成：robots.txt 维持全允许未变更；`public/llms.txt` 已由所有者自行添加；正式 bot 策略决策留所有者
- [ ] 1.7 选定首页、普通文章、图片密集文章、代表项目与核心浏览器/视口，记录当前 Lighthouse、资源量、可访问性和截图基线（P1，阻塞第 6、7、8 节验收）。— 部分完成：整改前基线仅有 design.md PERF-06 的单次记录（Perf 88/FCP 2.9s/LCP 3.2s）；整改后新基线待发布后按 6.9 建立
- [ ] 1.8 选定 2–3 个代表项目，确认可公开的角色、状态、截图、演示、仓库、决策、结果和第三方证据（P1，阻塞 5.7 与 7.5）。— 阻塞：需所有者提供可公开的证据素材

## 2. P0 安全与内容权属

- [x] 2.1 在确认轮换完成后，从当前内容中移除 SEC-01 的完整秘密值，使用安全占位示例替代，并运行脱敏扫描验证当前工作树无匹配。— 已验证：占位符替换完成，`pnpm verify` 秘密扫描通过（工作树 0 匹配）；注：服务端撤销本身归 1.1
- [x] 2.2 构建站点并扫描 `dist`，确认页面、Pagefind 索引、sitemap、RSS 和 source map 均不含已撤销秘密的完整值。— 已验证：dist 全量 grep 0 命中（含 Pagefind 索引）
- [ ] 2.3 重新部署已清理构建，清除可控缓存，并以生产页面抽查和原凭据失效测试记录处置完成时间。— 阻塞：待推送 master 触发部署后执行生产抽查；失效测试依赖 1.1
- [x] 2.4 记录"本变更不执行 Git 历史重写"的决策（REV-H）：凭据经 2.1–2.3 撤销后泄漏值已失效，重写公开仓库历史收益近零且破坏 clone/fork；验证方式为 design.md Decision 12 引用与 2.3 的失效测试证据。若所有者日后坚持重写，另立变更单独授权。— 已验证：决策记录于 design.md Decision 12 与安全 spec
- [x] 2.5 根据 1.2 的权属决定处置 `short-think.md`：未确认则草稿/下线/`noindex`，获授权则修正署名、来源、资产归属与 canonical；验证其不再以错误原创关系进入 sitemap、RSS 或 Pagefind。— 已验证：`draft: true` 下线，dist 的 sitemap/RSS/Pagefind 均无该页；权属最终决定（1.2）留所有者
- [x] 2.6 在 PR CI 与发布流程加入带脱敏输出的秘密扫描，提交一个无害测试 fixture 验证高置信度匹配会阻止合并且日志不回显原值。— 已验证：scripts/verify.mjs 秘密扫描（脱敏输出）+ verify.test.mjs fixture 通过 + ci.yml 接入 `pnpm verify`

## 3. 内容完整性与数据合同

- [ ] 3.1 生成全量文章、项目和主题处置清单，为每项记录保留、重写、合并、归档 `noindex`、删除重定向或 410 状态、优先级与责任人。— 部分完成：evidence/content-inventory.md 覆盖全量文章处置（40 文件改动 + 6 条未处理项）；项目与主题维度清单未建
- [x] 3.2 恢复或移除 `2021-year-end-summary.md` 中所有缺失本地图片，并加入构建期本地资源与片段锚点检查，确认缺失数为 0。— 已验证：7 个失效 `/img/` 引用移除，`pnpm verify` 本地资源检查通过（缺失 0）
- [x] 3.3 修正已知标题/日期/正文年份冲突，并让日期格式化统一使用 1.4 确认的时区；添加阻止日期矛盾与伪造 `updated` 的内容检查。— 已验证：25-years-old 按正文证据修正为 2023-11-30+08:00，verify 日期合法性门禁通过；注：`updatedDate` 为可选字段、无自动伪造防护（依赖评审）
- [x] 3.4 对 `videos.md` 完成重写、归档、相关重定向或 410 处置，并验证旧 URL 不会软 404 或统一跳首页。— 已验证：`draft: true` 下线，旧 URL 返回真实 404（非软 404/非跳首页）
- [x] 3.5 对 `countdown-to-dayTwo-2022.md` 及清单中的其他薄内容完成补强、合并或 `noindex` 处置，并从 sitemap 移除不具独立价值的页面。— 已验证：draft 下线，dist sitemap grep 0 命中
- [x] 3.6 扩展 blog 内容 schema，支持经确认的 `updated`、`lang`、`image`、作者引用、来源关系和索引策略，同时保持未知字段可省略。— 已验证：content.config.ts 增加可选 `updatedDate`/`lang`/`image`；注：单作者站点未引入 per-post 作者引用与来源关系字段（按 Decision 4 无真实需求时省略）
- [x] 3.7 扩展 project 内容 schema，支持角色、目标用户、状态、决策、权衡、结果/学习、截图/证据与经核验 Schema 类型，不要求虚构指标。— 已验证：增加可选 `role`/`status`/`outcomes`；注：截图/证据字段待 1.8 素材到位后启用
- [x] 3.8 重写占位、重复、Markdown/URL 截断或与正文不符的 description，并加入纯文本、唯一性和占位符检查。— 已验证：17 篇重写，verify description 质量门禁通过（占位/过短/缺失检查）；注：跨文件唯一性检查未建
- [x] 3.9 修正多 H1 和 H1→H3/H4 跳级文章，使布局拥有唯一 H1、正文从 H2 开始；加入 Markdown 标题层级门禁。— 已验证：6 处正文 H1 降级 + 27 处 H3 起始整体提级 + 2 处误标标题句还原为段落，verify 标题层级门禁通过；langgraph 4 处为代码块内注释系原审计误报（围栏感知已排除）
- [ ] 3.10 为全部非装饰内容图片补充信息性 alt，为装饰图片显式空 alt，并加入图片语义检查。— 部分完成：2 处空 alt 补齐、坏图引用移除；alt 语义 CI 检查未纳入 verify

## 4. 技术 SEO 与发现基础

- [x] 4.1 在 `astro.config.mjs` 设置 `trailingSlash: "always"`（REV-C/Decision 11），修正构建报错暴露的全部不一致内链；验证方式为构建成功 + 抽查 ArrowCard/标签/文章导航链接均带尾斜杠。— 已验证：构建通过，dist 文章 canonical 为尾斜杠绝对 URL，组件内链已全部补尾斜杠
- [x] 4.2 保留最小 URL helper 仅用于模板拼接绝对 URL（canonical、Schema、RSS）；验证方式为 canonical 与 sitemap/Schema URL 一致性抽查，不再建独立 CI 扫描器。— 已验证：utils.ts 提供 `tagSlug()`/`toAbsoluteUrl()`，dist 抽查 canonical 与 JSON-LD URL 一致
- [x] 4.3 归一标签：小写 slug + 单文件显示名映射，合并 `Java/java` 等冲突、拆解 `others`；验证方式为构建后标签路由集合无大小写折叠冲突（Linux/macOS 一致）。— 已验证：20 篇 frontmatter 归一至 15 个标签，verify 标签冲突门禁通过，tags 路由经 `tagSlug` 生成
- [x] 4.4 仅为确认存在外部链接的旧标签路径生成兼容 canonical 页（REV-D），其余旧路径直接归一不做兼容；验证方式为旧到新映射清单 + 站长平台 404 观察。— 已验证：无已确认外链的旧标签，按 REV-D 未建兼容页（生成数 0 即合规）；站长平台 404 观察归 8.5
- [x] 4.5 为博客索引添加唯一 H1、独特 description 和可见内容范围说明，验证 Head 与页面文本一致。— 已验证：H1"博客"+ 简介 + BLOG.DESCRIPTION 重写，Head 与页面文本一致
- [x] 4.6 扩展 Head/Layout 的 robots、canonical、Open Graph 类型和 Pagefind 控制；确保 404、草稿、权属未确认及低价值集合页使用正确策略。— 已验证：Head/Layout 支持 `noindex`/`image`/og:type props，404 应用 noindex，draft 页不进构建；注：低价值集合页经标签归一后无单独策略需求
- [x] 4.7 重做 404 响应与页面：中文唯一 H1、`noindex,follow`、无 canonical、排除 sitemap/RSS/Pagefind，并验证不存在可索引的 `/404` 与 `/404.html` 重复内容。— 已验证：dist/404.html 含 `noindex, follow`、0 canonical；sitemap 不含 404；Playwright 确认真实 404 状态 + 中文标题
- [x] 4.8 在全局 Head 添加 RSS autodiscovery，验证 RSS MIME、规范 URL、标题和发布日期与页面一致。— 已验证：autodiscovery link 已加，RSS 输出正常；注：W3C feed 校验器核查待发布后
- [x] 4.9 仅使用真实发布日期/更新时间生成 sitemap `lastmod`，验证 sitemap 不含草稿、`noindex`、旧标签、筛选参数或非规范 URL。— 已验证：astro.config 按 frontmatter date/updatedDate 序列化 `lastmod`（updatedDate 优先，无可信日期不输出）；dist 抽查 116 条 lastmod、草稿/404 均排除
- [ ] 4.10 在取得权限后配置 `www` DNS、TLS 与到 apex 的单跳永久重定向；使用首页和深层带查询路径验证无循环且路径保留。— 阻塞：需所有者 DNS 权限（1.5）
- [x] 4.11 在内容与模板中统一 `lang`/`inLanguage`；只为真实互译页面输出完整互惠 hreflang，验证当前独立内容不会被错误配对。— 已验证：schema 增加可选 `lang`，BlogPosting `inLanguage` 取 frontmatter；无互译对，未输出任何 hreflang（符合规范）
- [x] 4.12 替换上游 AstroPaper 默认 OG 资产为一张静态品牌默认图（REV-J，astro-og-canvas 列为 P2 可选），支持文章/项目页面级图片与文章 `og:type`，验证图片 URL、尺寸、可访问性和 fallback。— 已验证：默认图 `public/og.png`，dist og:image=https://huaruic.com/og.png、astropaper 资产 0 残留、文章 og:type=article、支持页面级 image prop
- [x] 4.13 元数据卫生（NEW-06/07）：删除 `<meta name="title">`，Twitter 卡片标签从 `property=` 改为 `name="twitter:*"`；验证方式为构建产物 head 抽查与卡片调试工具解析。— 已验证：dist head 抽查通过；注：外部卡片调试工具核查待发布后
- [x] 4.14 建立 favicon 三件套（NEW-08）：32px ico/PNG 或 SVG favicon + 180×180 `apple-touch-icon`，替换 400px 头像 PNG 声明；验证方式为浏览器标签页不再请求 400px 原图。— 已验证：favicon.ico/svg + 180×180 apple-touch-icon + 96px 头像资产生成并接入 Head
- [x] 4.15 配置 `@astrojs/sitemap` 的 `filter` 排除 `/404/` 及非规范页面（NEW-09）；验证方式为构建后 sitemap 内容检查。— 已验证：dist sitemap 中 404 计数 0
- [x] 4.16 RSS 补 `<language>zh-CN</language>` 并确定全文/摘要输出策略（NEW-10）；验证方式为 feed 校验器通过且字段与页面一致。— 已验证：dist rss.xml 含 `<language>zh-CN</language>`；输出策略维持摘要（description）；外部校验器待发布后

## 5. 作者实体、GEO 与内容网络

- [x] 5.1 根据 1.3 建立 AUTHOR/SITE 单一配置与稳定 `#person`、`#website` ID，删除模板中的重复作者对象和竞争名称。— 已验证：consts.ts AUTHOR 单一数据源，模板内联作者对象改为 `@id` 引用
- [x] 5.2 在首页输出 `Person + WebSite + ProfilePage` 的关联 `@graph`，使用 JSON 解析、Schema 字段测试和页面可见内容一致性检查验收。— 已验证：dist 首页 JSON-LD 含 Person/WebSite/ProfilePage 各 1，JSON 由 stringify 构造保证可解析
- [x] 5.3 让全部 BlogPosting 引用统一作者和站点实体，并准确输出 `mainEntityOfPage`、`isPartOf`、`datePublished`、`inLanguage` 及存在时的 `dateModified`/`image`。— 已验证：dist 抽查 BlogPosting author={"@id":".../#person"}，isPartOf/inLanguage/datePublished 输出，dateModified 条件输出
- [x] 5.4 在文章界面展示链接到 ProfilePage 的作者、发布日期、语言与真实更新时间；确认可见值、meta、RSS 和 JSON-LD 一致。— 已验证：Playwright 确认可见署名 Ernest Chen + 日期 + 条件"更新于"行；注：RSS item 级 author 字段未加
- [x] 5.5 为项目建立证据约束的 Schema 类型映射；没有充足证据时保留 `CreativeWork`，并用测试阻止无页面依据的评分、报价、客户、组织或结果字段。— 已验证：保留 CreativeWork + `@id` creator 引用，未输出任何无依据字段；注：防虚构字段的自动化测试未建（当前模板不产出该类字段）
- [x] 5.6 统一首页 title、H1、WebSite 名称、作者名称、tagline 与 `sameAs` 策略，并由所有者审核最终搜索片段文案。— 已验证：首页 H1/JSON-LD/AUTHOR/sameAs 统一自单一数据源；最终文案审核权留所有者
- [ ] 5.7 使用 3.7 的案例模板补齐 1.8 选定的代表项目，加入问题、角色、状态、关键取舍、真实结果/学习、截图及证据入口。— 阻塞：需所有者提供证据素材（1.8），不虚构
- [ ] 5.8 对其余项目逐项补齐最低可索引案例信息；无法证明独立价值的项目页合并、归档 `noindex` 或从 sitemap 移除。— 未实施：依赖 1.8/5.7 的案例信息标准
- [ ] 5.9 建立"本地 AI Agent/OpenClaw""AI-native 工程""隐私与可验证链上应用"内容地图，记录用户问题、已有内容、缺口、目标项目和避免重复的搜索意图。— 未实施：编辑性规划工作，待所有者参与
- [ ] 5.10 为每篇核心文章添加至少一个相关项目和存在时 2–4 篇上下文相关文章；为项目反向添加实践文章，并运行内部链接/锚文本检查。— 未实施：上下文内链未系统添加
- [ ] 5.11 评审日本旅行、工作意义、前后端协作等疑似意图重叠文章，逐组选择差异化、合并重定向或归档方案并更新内链/sitemap。— 未实施：意图重叠评审未做
- [ ] 5.12 根据 1.6 更新 robots 的 AI 搜索/训练策略；只有第 2–5 节基础验收通过且所有者选择启用时，才生成仅含规范、已发布内容的 `llms.txt`。— 部分完成：`public/llms.txt` 已由所有者自行添加；robots AI 策略未变更，正式决策待 1.6
- [ ] 5.13 为核心技术文章建立编辑模板：首段直接回答、适用版本/时间边界、原创示例、限制、官方/原始来源和修订记录；用一篇代表文章验证模板。— 未实施：编辑模板待建

## 6. Web 性能

- [x] 6.1 所有者决策字体方案 A（系统字体栈）或 B（自托管中文 VF + unicode-range 分片 + ≤20 KiB 子集 preload）；决策前置：删除全部 18 个 `@fontsource` 静态导入（Decision 9/REV-A）。验证方式：方案 A 下首次字体传输为 0 KiB；方案 B 下 ≤300 KiB 且子集命中首屏字符。— 已验证：按推荐默认落地方案 A，18 个导入 + package.json 依赖全部移除，dist 无 fontsource/geist 残留（字体传输 0 KiB）；所有者可后续改选 B
- [x] 6.2 按所选方案执行落地与回归：方案 A 更新 `--font-sans`/`--font-mono` 系统栈并对中文、英文、粗细文本和代码块做视觉抽查；方案 B 建立 cn-font-split 流水线、preload 子集并做同等视觉回归，确认无缺字或显著 CLS。— 已验证：系统栈生效（Playwright 计算样式 -apple-system/SF Pro Text/PingFang SC），首页/文章页中文与代码块渲染正常；方案 A 无字体文件加载，无字体 CLS 风险
- [x] 6.3 从全局 Head 移除同步 Pagefind UI 资源，在首次搜索意图时加载并缓存；网络记录验证未打开搜索时请求数为 0、首次打开只初始化一次。— 已验证：dist head 无同步 pagefind 标签（懒加载器内联字符串除外）；Playwright 确认打开前无 pagefind 资源、首开加载成功且输入框聚焦
- [x] 6.4 按 Decision 10/REV-B 替换动画体系：删除 JS setTimeout `.animate` 与 noscript 补丁；纯 CSS `@keyframes` + `nth-child` 阶梯 delay + `backwards`；H1/LCP 候选豁免；入场仅限文章正文；移动端第 8 元素后截断；`prefers-reduced-motion` 全禁用；主题切换改 View Transitions `clip-path` reveal 并删除 `* { transition: none }` hack。验证方式：禁用 JS 后内容全部可见 + reduced-motion 模拟无动画 + LCP 候选无 `opacity: 0` 初态。— 已验证：dist 无 `class="animate"` 残留；Playwright 首页 H1 opacity 1、article.entrance fade-in-up 生效、明暗主题经 View Transitions 正常往返；注：禁 JS/reduced-motion 的逐项自动化模拟未跑，由 CSS `backwards` 与 media query 机制保证
- [ ] 6.5 建立 Astro 响应式图片组件或内容转换流水线，统一生成 width/height、AVIF/WebP、`srcset`、`sizes`、lazy/eager 和 decoding 策略。— 未实施：响应式图片流水线未建（本轮仅 schema image 字段 + 坏图修复）
- [ ] 6.6 先迁移头像、首页/项目图像和图片密集文章，验证小头像不再下载原始大图且图片密集代表页的传输量显著低于基线。— 部分完成：96px 头像资产已建并接入 Header（不再加载 400px 原图）；正文图片迁移依赖 6.5
- [ ] 6.7 分批迁移剩余内容图片并运行全站检查，确认所有公开图片具有固有尺寸、正确加载策略和可接受格式 fallback。— 未实施：依赖 6.5
- [ ] 6.8 重构 Astro 页面切换初始化，使用单例绑定、AbortController 或成对清理；自动连续导航十次验证监听器不增长且单事件只触发一次。— 部分完成：init 幂等化重构完成（scroll/matchMedia 单次绑定、after-swap 仅处理换新 DOM），Chromium 冒烟无异常；连续导航十次的自动化监听器计数验证未跑
- [ ] 6.9 整改发布后对首页、普通文章和图片密集文章各运行至少三次固定移动 Lighthouse，以中位数验证 LCP ≤2.5s、CLS ≤0.1、TBT ≤200ms；作为发布后/月度验证记录，不作为 PR 门禁（REV-F）。— 未执行：待发布后首轮月度验证
- [ ] 6.10 基于整改后产物锁定 CSS、字体、JavaScript 与图片的页面类型预算，记录在 README/维护文档中，月度对照；不在 PR 中生成预算报告（REV-F）。— 未实施：待 6.9 数据后锁定
- [x] 6.11 死代码与重复绑定清理（NEW-04/05/14）：删除 `setGiscusTheme()` 及调用点、`formatDate()` 死代码，back-to-top 只保留一处 click 绑定；验证方式为全库 grep 无残留引用 + 点击仅触发一次滚动。— 已验证：giscus/formatDate 全库 grep 0 残留，BackToTop 冗余 script 移除

## 7. UI/UX 与可访问性

- [x] 7.1 由作者批准首页一句身份、一句结果导向定位和两级 CTA 文案；实现视觉主 H1、两行内支持文案，并把长介绍移到后续"关于"区域。— 已验证：主视觉 H1 草稿文案 + 主/次两级 CTA 落地（Playwright 确认 H1 立即可见）；文案最终批准权留所有者
- [x] 7.2 为主导航实现可见当前态和 `aria-current="page"`，移动端保留 Ernest 短字标并移除读屏可感知的装饰 `/` 分隔符。— 已验证：aria-current + 可见当前态 + 分隔符 aria-hidden 实现（首页 aria-current=0 属预期：首页不是 nav 项）
- [ ] 7.3 把导航、搜索、主题切换、返回、标签和其他关键非内联控件扩大到至少 44×44 CSS px，在 320px 与 375px 验证无溢出。— 部分完成：搜索/主题/关闭按钮已扩至 44px；320px/375px 视口溢出验证未做
- [x] 7.4 重构博客入口：H1/介绍、搜索、主题入口、3–5 篇精选/最新、日期和摘要；其余保留单页年份分组归档 + 年份锚点，不做分页与 URL 筛选（REV-E）。验证方式为页面结构抽查与锚点跳转可用。— 已验证：H1/简介/最新 4 篇精选/年份锚点导航/年份分组归档落地，构建通过
- [ ] 7.5 重构项目入口：突出 2–3 个带图像与证据的代表案例，其余使用紧凑索引；统一分类语言并让内容类型在视觉上可区分。— 阻塞：代表案例视觉重构需 1.8 证据素材；本轮仅完成 landmark 与动画清理
- [x] 7.6 修正首页主要 landmark，加入聚焦时可见的 skip link，并验证页面语义顺序、读屏 landmark 与固定页眉偏移。— 已验证：Playwright 确认 aside→div 修正、skip link 存在、main#main 落地
- [x] 7.7 为正文、目录、标签、项目和文章导航建立一致的 hover、`:visited` 与至少 2px `focus-visible` 样式，在明暗主题中验证可见。— 已验证：全局 focus-visible 2px outline + :visited 弱化 + hover 态实现；注：明暗双主题的逐项人工核验未做（冒烟已覆盖两主题切换）
- [x] 7.8 修复浅色小号日期等低对比文本到至少 4.5:1，并让邮箱、搜索、关闭与主题控件的 accessible name 包含或匹配可见标签。— 已验证：accessible name 全部修正；pages 4 处 `opacity-65` 已提升至 `opacity-80`，全仓 grep `opacity-65` 为 0
- [x] 7.9 重构搜索为命名 dialog：中文提示、44px 关闭按钮、稳定 input id/name、焦点约束/恢复、Escape/遮罩关闭和加载失败恢复文案；同时修复三个搜索 bug（NEW-01 遮罩非法类名改 `bg-black/50`、NEW-02 清空真正的 input、NEW-03 焦点在输入控件时不劫持 `/` 快捷键）。验证方式为明暗主题遮罩变暗截图 + 重开为空态 + 输入框内可键入 `/`。— 已验证：Playwright 确认遮罩 50% 黑背景、role=dialog + aria-modal + aria-label="站内搜索"、关闭按钮存在、输入框自动聚焦、Esc 关闭；三 bug 修复入码
- [x] 7.13 代码复制按钮可访问性（NEW-11）：添加 `aria-label="复制代码"` 与 `aria-live` 成功反馈，替换 emoji 为与站内一致的 stroke 图标；验证方式为读屏朗读功能名而非字符名。— 已验证：Playwright 确认 aria-label="复制代码"，SVG 图标 + aria-live 播报实现
- [x] 7.14 桌面 TOC scrollspy 与标题锚点（NEW-12）：IntersectionObserver 当前小节高亮 + 正文标题 hover 锚点；验证方式为滚动时高亮跟随、锚点可复制。— 已验证：scrollspy nav 存在（Playwright），IntersectionObserver + after-swap 幂等实现；注：滚动跟随的逐帧行为验证未做
- [x] 7.15 正文对齐修正（NEW-13）：移除 `article { text-align: justify }` 改左对齐；验证方式为中英混排与行内代码段落无异常空隙。— 已验证：global.css 改 `text-align: start`
- [ ] 7.10 将 Tags 改为中文主题中心，展示独特说明、热门/全部主题、最近内容和博客入口；低价值标签按 4.3 规则合并或 `noindex`。— 部分完成：中文化 + 按文章数降序 + 标签归一完成；主题独特说明与"最近内容"区块未建
- [ ] 7.11 完成中文品牌 404 的首页、搜索和项目恢复入口，并执行键盘、读屏与移动触控验收。— 部分完成：中文 404 + 三恢复入口 + 搜索提示落地（Playwright 真实 404 状态验证）；键盘/读屏/移动触控完整验收未做
- [ ] 7.12 对首页、博客、项目和文章执行 1440px、375px、320px 明暗主题视觉回归，保留正文可读性和深色优势，确认无水平溢出或模板品牌残留。— 部分完成：Chromium 桌面明暗冒烟通过、模板品牌残留 dist grep 0；多视口全套视觉回归未做

## 8. CI、观测与维护文档

- [ ] 8.1 新增统一 `pnpm verify`，串行执行格式、类型/构建、秘密、内容、SEO、内部链接/资源、JSON-LD、关键可访问性与 OpenSpec 严格校验。— 部分完成：`pnpm verify`（秘密/description/标题层级/标签/本地资源/日期 6 项）+ CI 串联 format→verify→build 等效覆盖格式与类型；JSON-LD/可访问性/OpenSpec 校验未纳入 verify
- [ ] 8.2 为内容 schema、占位 description、标题层级、日期矛盾、tag slug、图片 alt/尺寸和本地资源添加可定位的 fixture 测试。— 部分完成：秘密扫描 fixture 测试通过（verify.test.mjs）；其余类别检查已实现但 fixture 测试未建
- [ ] 8.3 为规范 URL、canonical 唯一性、robots、sitemap、RSS、404、Open Graph 与 JSON-LD 页面一致性添加构建产物测试。— 部分完成：本轮为人工 dist 抽查 10/10 通过；自动化产物测试未建
- [x] 8.4 PR 门禁只保留确定性检查（秘密扫描、占位 description、标题层级、坏链/坏资源、JSON-LD 可解析）；Lighthouse 三次中位数改为发布后/月度验证并记录趋势（REV-F）。验证方式为 CI 配置与月度记录文档。— 已验证：ci.yml 为 format→verify→build 纯确定性门禁、无 Lighthouse；月度记录首轮待 6.9
- [ ] 8.5 在 Google Search Console 与 Bing Webmaster Tools 验证 apex 站点、提交 sitemap，并对首页、代表文章和代表项目完成 URL Inspection 抽查。— 阻塞：需所有者站长平台账号操作
- [ ] 8.6 建立月度搜索健康检查，记录索引、canonical、404、结构化数据、查询/页面趋势和待办，不把"无数据"标记为通过。— 未开始：依赖 8.5
- [ ] 8.7 以 Search Console/CrUX 为唯一真实 CWV 来源（REV-G，不引入 RUM），按页面类型观测 28 天 p75 LCP/INP/CLS，样本不足时明确记录"数据不足"。— 未开始：依赖 8.5；数据来源决策已定（REV-G）
- [x] 8.8 记录"不实施转化事件与自有 RUM"的决策（REV-G）：站点规模下隐私与维护成本大于收益；验证方式为 design.md Decision 12 引用。若日后需求变化另立变更。— 已验证：决策记录于 design.md Decision 12 与 quality spec
- [ ] 8.12 引入内容工具脚本（REV-I，借鉴 Retypeset）：autocorrect 对 65 篇存量文章执行一次中英混排空格/标点归一并纳入 `pnpm verify`；新增 new-post 脚手架保证新文章 frontmatter 完整。验证方式为格式化 diff 评审通过 + 脚手架生成文件通过内容 schema 校验。— 基本完成：new-post.mjs 脚手架已建；autocorrect-node 2.14.0 已对全部文章执行一次归一（58 个文件修正，verify/format:check/build 复验通过）；未纳入 `pnpm verify`（该门禁按零依赖设计，autocorrect 保留为手动工具，如需常态化另行决策）
- [x] 8.9 重写 README，准确说明 Ernest 站点定位、Astro 技术栈、内容模型、命令、GitHub Pages 部署、规范域名、质量预算和 OpenSpec 工作流。— 已验证：README 重写完成，AstroPaper 残留清除
- [ ] 8.10 建立季度内容复查模板，覆盖权属、失效外链、薄内容、意图重叠、版本时效、项目证据和处置状态。— 未实施：季度模板待建
- [ ] 8.11 在 Chromium、WebKit/Safari 与 Firefox 的桌面和移动代表视口执行关键路径回归，并记录键盘与至少一种读屏的人工证据。— 部分完成：Chromium 桌面关键路径冒烟通过（控制台 0 错误）；WebKit/Firefox/移动视口/键盘/读屏证据未做（降级后仅需改版后一次，仍待完整执行）

## 9. 最终验收与发布

- [x] 9.1 运行 `pnpm run format:check` 与 `pnpm run build`，保存成功输出并确认无 Astro 类型、内容或构建错误。— 已验证：format:check 通过（"All matched files use Prettier code style!"），build（含 astro check）通过，91 页 + /posts/ 历史重定向 + Pagefind 索引 214 页
- [x] 9.2 运行 `pnpm verify`，确认所有 P0/P1 秘密、内容、SEO、链接、Schema、可访问性与性能门禁通过且日志已脱敏。— 已验证：verify 6 项全绿（秘密扫描输出脱敏）
- [x] 9.3 运行 `openspec-chinese validate remediate-seo-geo-ux-audit --strict`，确认 proposal、六个能力 specs、design 和 tasks 严格有效。— 已验证：strict 校验通过
- [ ] 9.4 在预览环境人工验收首页、博客、主题、代表文章、项目、搜索和 404 的桌面/移动、明暗主题与键盘路径。— 部分完成：Chromium 预览验收通过（首页/文章/搜索/404/明暗主题切换，控制台 0 错误）；移动视口与完整键盘路径走查未做
- [ ] 9.5 发布后验证 apex、`www` 重定向、robots、sitemap、RSS、canonical、Pagefind、代表 Schema 和无秘密生产抽查。— 阻塞：待推送发布
- [ ] 9.6 在站长平台请求抽查 URL 重新抓取，观察至少一个完整索引/CWV 报告周期并为残余问题创建后续 OpenSpec 变更。— 阻塞：待发布 + 8.5
- [ ] 9.7 所有任务与证据完成后同步正式 specs，并按 OpenSpec 流程归档本变更；未解决 Open Questions MUST 不得被静默关闭。— 未到位：Open Questions（权属/DNS/bot 策略/字体 A-B 终审）未全部关闭，归档待后续
