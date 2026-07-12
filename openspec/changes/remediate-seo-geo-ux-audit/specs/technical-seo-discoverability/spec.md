## ADDED Requirements

### Requirement: 唯一规范 URL

所有可索引页面 MUST 使用唯一的 HTTPS apex 规范 URL，并采用统一尾斜杠策略。尾斜杠策略 MUST 优先在 Astro 配置层强制（`trailingSlash: "always"` 加 `build.format: "directory"`），由框架在开发与构建期拦截不一致链接；自建 URL helper（如 `toCanonicalPath()`）仅作为 Schema、RSS 等模板拼接绝对 URL 时的辅助，系统 MUST 不再要求独立 CI 扫描器作为尾斜杠一致性的主要防线。站内链接、canonical、Open Graph URL、sitemap、RSS 和结构化数据 MUST 引用相同规范 URL。

#### Scenario: 构建期发现不一致链接

- **WHEN** 模板或内容中出现与全局尾斜杠策略不符的站内链接
- **THEN** Astro 配置层策略 MUST 在开发或构建阶段暴露该不一致
- **AND** 修复 MUST 落在链接来源处而非事后重写

#### Scenario: 构建可索引页面

- **WHEN** 系统生成任意可索引页面
- **THEN** 页面 MUST 且只能包含一个自引用 canonical
- **AND** canonical MUST 使用 `https://huaruic.com`、规范路径和统一尾斜杠
- **AND** 页面内的导航与正文站内链接 MUST 使用相同路径规范

#### Scenario: 请求非规范路径变体

- **WHEN** 用户请求错误主机或错误尾斜杠形式的公开 URL
- **THEN** 系统 MUST 通过最多一次永久重定向到规范 URL
- **AND** 有效路径和查询参数 MUST 被保留
- **AND** 非规范 URL MUST 不得进入 sitemap 或 RSS

### Requirement: 标签 URL 规范化

标签系统 MUST 将标签归一为小写稳定 slug，并使用单一映射文件维护展示名称；Unicode 归一化及大小写折叠后 slug MUST 唯一。旧标签路径的兼容页或重定向 SHOULD 仅针对经确认存在外部链接或搜索流量的旧标签（预计 1–2 个）提供，其余旧标签路径允许返回 404；系统 MUST 不要求维护覆盖全部历史标签的别名注册表。

#### Scenario: 标签仅有大小写差异

- **GIVEN** 内容同时使用 `Java` 和 `java` 等归一化后相同的标签
- **WHEN** 系统生成标签路由
- **THEN** 系统 MUST 只生成一个可索引标签页面
- **AND** sitemap MUST 不包含冲突 URL

#### Scenario: 处置旧标签路径

- **WHEN** 标签归一导致旧标签 URL 不再生成
- **THEN** 经确认有外部链接或搜索流量的旧标签 SHOULD 获得单跳永久重定向或指向规范页的兼容 canonical 页
- **AND** 其余旧标签路径 MAY 返回 404，且 MUST 不进入 sitemap 或站内链接

#### Scenario: 新内容产生 slug 冲突

- **WHEN** Pull Request 引入归一化后冲突的标签
- **THEN** 内容质量门禁 MUST 失败
- **AND** 报告 MUST 列出冲突文件、稳定 ID 和展示名称

### Requirement: 唯一且有意义的页面元数据

每个可索引页面 MUST 具有准确、独立、可读的 title 和纯文本 description。description MUST 不得是占位符、通用重复模板、Markdown 表格、裸 URL、截断片段或与正文不符的文字；系统 MUST 以语义质量规则而非机械填充字符数进行校验。

#### Scenario: 发布内容包含无效描述

- **WHEN** description 为 `***`、`---`、重复的“随笔与记录。”、Markdown 表格或 URL 截断文本
- **THEN** 内容检查 MUST 失败
- **AND** 页面 MUST 不得进入生产可索引集合

#### Scenario: 页面使用唯一摘要

- **WHEN** 多个可索引页面完成构建
- **THEN** 每个 description MUST 准确概括对应页面的独特主题
- **AND** 完全重复的非品牌模板 description MUST 被报告

### Requirement: 语义标题层级

每个页面 MUST 包含一个描述页面主题的 H1，后续标题 MUST 按 H2、H3 等顺序表达内容层级。文章布局 MUST 拥有页面 H1，Markdown 正文 MUST 从 H2 开始且不得创建第二个 H1。

#### Scenario: 构建文章页面

- **WHEN** Markdown 正文包含额外 H1 或从 H1 直接跳到 H3/H4
- **THEN** 标题层级检查 MUST 失败
- **AND** 报告 MUST 给出内容文件和违规标题

#### Scenario: 构建博客索引

- **WHEN** 系统生成 `/blog/`
- **THEN** 页面 MUST 包含唯一的“文章”主题 H1
- **AND** H1 附近 MUST 提供能解释内容范围的可见介绍

### Requirement: 页面级索引控制

Head 和 Layout MUST 支持显式控制 robots、canonical、Open Graph 类型和站内搜索收录。错误页、权属未确认页、草稿及低价值集合页 MUST 按其真实状态排除索引与发现入口。

#### Scenario: 生成 404 页面

- **WHEN** 系统生成或返回 404 页面
- **THEN** 页面 MUST 包含 `noindex,follow`
- **AND** 页面 MUST 不输出 canonical
- **AND** 页面 MUST 从 sitemap、RSS 和 Pagefind 中排除
- **AND** 响应链 MUST 不把 404 内容伪装成可索引的普通页面

#### Scenario: 生成普通文章页面

- **WHEN** 页面满足公开发布和内容质量要求
- **THEN** 页面 MUST 允许索引并输出一个自引用 canonical
- **AND** 页面 MUST 只在 Pagefind 预期收录范围内进入站内搜索

### Requirement: 搜索发现文件一致性

robots、sitemap 与 RSS MUST 可解析、可访问且只引用符合各自策略的规范 URL。全局 Head MUST 提供 RSS autodiscovery；sitemap 的 `lastmod` MUST 只来自可信发布日期或实质更新时间。

#### Scenario: 生成 sitemap

- **WHEN** 系统完成生产构建
- **THEN** sitemap MUST 只包含可索引规范 URL
- **AND** `@astrojs/sitemap` MUST 配置 filter，`/404/` 等错误页 MUST 不进入 sitemap
- **AND** `lastmod` MUST 只在存在可信内容日期时输出
- **AND** 构建时间 MUST 不得被伪装成全部页面的更新时间

#### Scenario: 生成普通页面 Head

- **WHEN** 系统生成可索引页面
- **THEN** Head MUST 包含指向规范 RSS URL 的 `rel="alternate"` 链接
- **AND** RSS MUST 返回正确 MIME 类型并包含规范文章 URL
- **AND** RSS feed MUST 输出 `<language>zh-CN</language>`
- **AND** 系统 SHOULD 评估通过 customData 输出全文或摘要以提升订阅体验

#### Scenario: 生成 robots 策略

- **WHEN** 站点所有者确认搜索抓取与模型训练策略
- **THEN** robots MUST 准确表达该策略
- **AND** 系统 MUST 不得把显式允许某个 bot 描述为排名保证

### Requirement: 生产域名统一

站点 MUST 通过有效 DNS 和 TLS 接收 apex 与 `www` 请求，并将 `www` 通过最多一次永久重定向到 apex，路径与有效查询参数 MUST 被保留。

#### Scenario: 访问 www 深层路径

- **WHEN** 用户访问 `https://www.huaruic.com/<path>?<query>`
- **THEN** DNS 与 TLS MUST 正常工作
- **AND** 响应 MUST 永久重定向到对应的 apex 规范 URL
- **AND** 重定向 MUST 不形成循环或多跳链

### Requirement: 页面语言与翻译关系

HTML `lang`、内容语言字段、可见文案和结构化数据 `inLanguage` MUST 一致。系统 MUST 只在页面存在真实互译关系时输出完整、互惠且自引用的 hreflang 集合。

#### Scenario: 构建中文内容

- **WHEN** 内容语言为简体中文
- **THEN** 页面根元素 MUST 输出 `lang="zh-CN"`
- **AND** BlogPosting `inLanguage` MUST 使用对应语言值

#### Scenario: 页面没有真实翻译版本

- **WHEN** 内容不存在经确认的对应翻译页面
- **THEN** 页面 MUST 不得输出推测的 hreflang
- **AND** 不同语言的独立文章 MUST 不得被错误配对

### Requirement: 页面社交分享元数据

站点 MUST 使用自有品牌默认分享图，并允许文章和项目提供与页面内容相关的独立图片。第一步 MUST 先替换为一张自有品牌静态默认图；按页生成 OG 图（astro-og-canvas 等）为 P2 可选增强，MUST 不作为本需求的验收条件。文章页面 MUST 输出与内容类型一致的 Open Graph 类型，所有社交图片 URL MUST 可访问且具有明确尺寸与替代描述。

#### Scenario: 分享文章页面

- **WHEN** 文章提供经过确认的封面图
- **THEN** Open Graph 与 Twitter 元数据 MUST 使用该页面图片
- **AND** `og:type` MUST 表达文章内容类型
- **AND** 图片 URL MUST 使用规范绝对 URL

#### Scenario: 页面没有独立分享图

- **WHEN** 页面没有经过确认的页面级图片
- **THEN** 系统 MUST 使用 Ernest 自有品牌默认图
- **AND** 系统 MUST 不得继续发布上游模板品牌资产

### Requirement: 基础元数据卫生

页面 Head MUST 只输出被消费方实际解析的元数据标签：系统 MUST 移除无效的 `<meta name="title">`；Twitter 卡片标签 MUST 使用 `name="twitter:*"` 属性而非 `property=`。

#### Scenario: 生成页面 Head

- **WHEN** 系统生成任意页面的 Head
- **THEN** 输出 MUST 不包含 `<meta name="title">`
- **AND** 全部 Twitter 卡片标签 MUST 以 `name="twitter:*"` 形式输出

### Requirement: Favicon 与触摸图标

站点 MUST 提供小尺寸 favicon（32px ICO 或 SVG）与 180×180 的 apple-touch-icon，并 MUST 不得将 400px 头像 PNG 直接声明为唯一 icon。

#### Scenario: 浏览器请求站点图标

- **WHEN** 浏览器或系统请求站点图标资源
- **THEN** 响应 MUST 提供 32px ICO 或 SVG favicon
- **AND** iOS 添加主屏时 MUST 获得 180×180 的 apple-touch-icon
- **AND** 标签页图标 MUST 不再依赖 400px 头像原图
