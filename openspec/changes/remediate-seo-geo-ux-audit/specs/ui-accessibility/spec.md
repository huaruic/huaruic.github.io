## ADDED Requirements

### Requirement: 结果导向的首页首屏

首页首屏 MUST 在无需阅读长段落的情况下表达作者身份、专注领域和访客下一步操作。H1 MUST 是视觉主标题，支持文案 MUST 控制在可快速扫描的范围，并 MUST 提供“查看代表项目”主操作与“联系合作”次操作；所有文案 MUST 经过作者确认。

#### Scenario: 首次访问首页

- **WHEN** 访客在桌面或 375px 宽移动视口打开首页
- **THEN** 首个可见区域 MUST 包含作者身份、结果导向定位和两个可区分操作
- **AND** 主 CTA MUST 指向代表项目入口
- **AND** 次 CTA MUST 指向可访问的联系区域或联系方式
- **AND** 较长个人介绍 MUST 位于首屏核心信息之后

### Requirement: 可定位且可触达的导航

主导航 MUST 显示当前栏目并输出正确 `aria-current`。移动端 MUST 保留可识别的短字标，装饰性分隔符 MUST 不被读屏误读，导航、搜索、主题切换与其他关键非内联控件 MUST 提供至少 44×44 CSS px 的触控区域。

#### Scenario: 访问主栏目

- **WHEN** 用户访问博客、项目或工作页面
- **THEN** 对应导航项 MUST 具有可见当前态
- **AND** 对应链接 MUST 输出 `aria-current="page"`
- **AND** 其他导航项 MUST 不得错误标记为当前页

#### Scenario: 在移动端操作导航

- **WHEN** 视口宽度为 375px
- **THEN** 页眉 MUST 显示作者短字标或等效可识别品牌
- **AND** 关键控件的可点击区域 MUST 至少为 44×44 CSS px
- **AND** 导航 MUST 不产生水平溢出或相互覆盖

### Requirement: 可浏览的博客入口

博客页面 MUST 提供 H1、内容定位、常驻搜索入口、主题入口和可管理的文章集合。在当前约 65 篇的内容规模下，页面 MUST 保留单页按年份分组的归档呈现，并在归档之前先展示 3–5 篇精选或最新内容与年份锚点导航；分页与 URL 筛选状态属于文章数显著增长（如超过 150 篇）后的未来增强，MUST 不作为本变更的验收条件。

#### Scenario: 初次浏览博客

- **WHEN** 用户打开 `/blog/`
- **THEN** 页面 MUST 在完整归档之前显示 H1、介绍、搜索、主题入口和精选/最新内容
- **AND** 每个文章摘要 MUST 显示标题、日期、主题和可读摘要
- **AND** 归档 MUST 按年份分组并提供年份锚点，便于跳转历史内容

#### Scenario: 按年份定位历史文章

- **WHEN** 用户使用年份锚点跳转归档
- **THEN** 页面 MUST 滚动到对应年份分组且标题不被固定页眉遮挡
- **AND** 锚点 URL MUST 可分享并在打开时恢复相同位置
- **AND** 本变更 MUST 不引入分页或客户端筛选状态机作为验收要求

### Requirement: 有证据层级的项目展示

项目入口 MUST 突出 2–3 个代表案例，并展示截图或产品界面、解决的问题、作者角色、状态和已验证结果；其余项目 MUST 使用紧凑索引。项目类别命名 MUST 采用一致语言策略，不同内容类型 MUST 不得全部依赖同一种文本箭头卡片表达。

#### Scenario: 浏览代表项目

- **WHEN** 用户打开项目页或首页代表项目区域
- **THEN** 页面 MUST 优先展示经作者确认的代表案例
- **AND** 每个代表案例 MUST 显示问题、角色、状态与至少一种证据入口
- **AND** 不存在真实结果时页面 MUST 显示学习或当前状态而非虚构指标

#### Scenario: 浏览其他项目

- **WHEN** 用户查看非代表项目集合
- **THEN** 页面 MUST 使用紧凑、可扫描的索引
- **AND** 分类名称 MUST 采用统一的中文或中英双语规则
- **AND** 项目链接 MUST 有可辨识的焦点与已访问状态

### Requirement: 可读且可导航的文章体验

文章页面 MUST 保持无水平溢出的可读正文、正确标题层级和清晰的发布日期/作者信息。目录、返回博客、标签、上下篇与正文链接 MUST 具有可辨识的 hover、`focus-visible` 和 `:visited` 状态；非内联移动控件 MUST 满足触控尺寸要求。

#### Scenario: 键盘阅读文章

- **WHEN** 用户只使用键盘浏览文章
- **THEN** 用户 MUST 能跳到主内容并按逻辑顺序访问目录、正文链接和文章导航
- **AND** 当前焦点 MUST 使用至少 2px 的高对比轮廓与足够 offset
- **AND** 固定页眉 MUST 不得遮挡跳转后的标题或焦点目标

#### Scenario: 在移动端阅读文章

- **WHEN** 用户在 320–375px 宽视口打开普通或代码密集文章
- **THEN** 正文 MUST 不产生页面级水平滚动
- **AND** 代码块 MUST 在自身容器内滚动
- **AND** 目录、标签和返回操作 MUST 保持可触达且不相互重叠

### Requirement: WCAG 2.2 AA 基线

站点普通文本、控件、焦点、名称、状态和动画 MUST 达到 WCAG 2.2 AA。小号浅色辅助文本 MUST 达到至少 4.5:1 对比度；可访问名称 MUST 包含或匹配可见标签；页面 MUST 支持 skip link、语义 landmark 与 `prefers-reduced-motion`。

#### Scenario: 检查浅色与深色主题

- **WHEN** 自动与人工审计检查首页、博客、文章、项目、标签和 404
- **THEN** 普通文本对比度 MUST 不低于 4.5:1
- **AND** 键盘焦点 MUST 在两种主题下可见
- **AND** 状态 MUST 不得只通过颜色表达

#### Scenario: 检查可访问名称

- **WHEN** 控件显示邮箱地址、搜索、关闭或主题名称
- **THEN** accessible name MUST 包含或匹配屏幕可见文字
- **AND** 重复图标按钮 MUST 具有唯一且准确的名称

#### Scenario: 检查页面 landmark

- **WHEN** 读屏用户浏览首页
- **THEN** 主要内容 MUST 位于 `main` 内而不是被标记为补充性的 `aside`
- **AND** 页面 MUST 提供可见于聚焦时的“跳到主内容”链接

### Requirement: 完整的搜索对话框

搜索弹层 MUST 使用中文界面，提供显式 44px 关闭按钮、正确 dialog 语义（`<dialog>` 或等效 role）、名称与描述、稳定 input `id`/`name`、初始焦点、焦点约束和关闭后的焦点恢复，同时 MUST 支持 Escape 与点击遮罩关闭。打开时遮罩 MUST 呈现真实生效的半透明变暗背景（现状 `bg-[rgba(0, 0, 0, 0.5]` 为含空格且缺右括号的非法 Tailwind arbitrary value，不产生任何背景色）。关闭对话框时系统 MUST 清空搜索输入框的实际 `<input>` 值（现状对容器 div 设置 `.value` 无效，重开残留上次查询）。

#### Scenario: 打开与关闭搜索

- **WHEN** 用户通过按钮或键盘打开搜索
- **THEN** 焦点 MUST 移到搜索输入框
- **AND** 遮罩 MUST 可见地压暗底层页面内容
- **AND** 读屏 MUST 宣布对话框名称和用途
- **AND** Tab 焦点 MUST 保持在对话框内
- **AND** 关闭后焦点 MUST 返回触发搜索的控件

#### Scenario: 重新打开搜索

- **WHEN** 用户关闭搜索对话框后再次打开
- **THEN** 搜索输入框 MUST 为空且不显示上次查询与结果
- **AND** 系统 MUST 不重复绑定事件监听器

#### Scenario: 在可编辑区域按下快捷键

- **GIVEN** 焦点位于 input、textarea 或 contenteditable 元素内
- **WHEN** 用户键入 `/` 字符
- **THEN** 字符 MUST 正常输入到当前编辑区域
- **AND** 系统 MUST 不劫持按键打开搜索对话框

#### Scenario: 搜索资源加载失败

- **WHEN** Pagefind 资源无法加载
- **THEN** 对话框 MUST 显示中文错误与恢复建议
- **AND** 用户 MUST 仍可关闭对话框并继续浏览站点

### Requirement: 主题中心与错误恢复体验

Tags 页面 MUST 作为中文主题中心提供 H1、主题说明、热门/全部主题、最近内容和返回博客入口；主题控件 MUST 满足触控要求。404 页面 MUST 使用中文唯一 H1，并提供返回首页、搜索文章和浏览项目的恢复动作。

#### Scenario: 浏览主题中心

- **WHEN** 用户从博客进入 Tags 页面
- **THEN** 页面 MUST 使用中文 H1 与说明
- **AND** 页面 MUST 区分重要主题与全部标签
- **AND** 标签控件 MUST 至少提供 44px 高的触控区域
- **AND** 页面 MUST 展示相关最近内容而非只显示标签计数

#### Scenario: 访问不存在的页面

- **WHEN** 用户到达 404 页面
- **THEN** 页面 MUST 显示品牌一致的中文 H1
- **AND** 页面 MUST 提供首页、搜索和项目三个恢复方向
- **AND** 所有操作 MUST 可由键盘与读屏使用

### Requirement: 保留优势并建立个人视觉识别

视觉改造 MUST 保留现有克制配色、正文可读性和稳定深色模式，同时 MUST 通过作者短字标、代表项目图像、清晰排版层级和按内容类型区分的布局建立个人识别。系统 MUST 不得为追求“高端感”牺牲性能、可读性或可访问性。

#### Scenario: 完成视觉回归评审

- **WHEN** 首页、博客、项目和文章改版完成
- **THEN** 各内容类型 MUST 在层级和视觉锚点上可区分
- **AND** 深色与浅色主题 MUST 保持一致的信息优先级
- **AND** 320px、375px 与桌面视口 MUST 不出现遮挡或水平溢出
- **AND** 视觉资源 MUST 满足既定性能预算

### Requirement: 代码复制按钮可访问性

代码块复制按钮 MUST 具有描述用途的 accessible name（如 `aria-label="复制代码"`），MUST 不得仅以 emoji（现状 📋/✅）作为控件内容的唯一语义来源；复制成功状态 MUST 通过 `aria-live` 区域或等效机制向读屏用户反馈。

#### Scenario: 读屏用户复制代码

- **WHEN** 读屏用户聚焦代码块的复制按钮
- **THEN** 读屏 MUST 宣布“复制代码”或等效中文名称
- **AND** 复制成功后读屏 MUST 收到成功状态通知
- **AND** 视觉状态变化 MUST 不是唯一的反馈渠道

### Requirement: 目录当前小节指示

桌面侧栏目录 MUST 随滚动高亮当前阅读小节（基于 IntersectionObserver 的 scrollspy 或等效实现），目录链接 MUST 具有可辨识的 hover、`focus-visible` 与当前态样式。正文标题 SHOULD 提供 hover 时可见的锚点链接以便分享定位。

#### Scenario: 滚动阅读长文章

- **WHEN** 用户在桌面视口滚动阅读带目录的文章
- **THEN** 目录 MUST 高亮当前所在小节的对应条目
- **AND** 高亮 MUST 随滚动进入新小节而更新
- **AND** 当前态 MUST 在明暗主题下均清晰可辨且不只依赖颜色

#### Scenario: 通过目录跳转小节

- **WHEN** 用户点击目录中的小节链接
- **THEN** 页面 MUST 滚动到对应标题且不被固定页眉遮挡
- **AND** 目录高亮 MUST 同步更新到目标小节

### Requirement: 正文排版对齐

文章正文 MUST 使用左对齐（`text-align: start`）替代现有两端对齐（现状 `article { text-align: justify }` 在中英混排与行内代码场景产生不均匀的大空隙）。

#### Scenario: 阅读中英混排段落

- **WHEN** 用户阅读包含英文术语、链接或行内代码的中文段落
- **THEN** 正文 MUST 呈现左对齐、右侧自然参差的文本
- **AND** 词间距 MUST 不因两端对齐被异常拉伸

### Requirement: 列表到文章的共享元素过渡

站点 SHOULD 为文章卡片标题与文章页 H1 配置 Astro `transition:name` 共享元素过渡，使点击卡片进入文章时标题平滑变形衔接。启用该增强时，系统 MUST 在用户偏好 `prefers-reduced-motion: reduce` 时禁用该过渡动画。

#### Scenario: 用户要求减少动画

- **GIVEN** 用户启用 `prefers-reduced-motion: reduce`
- **WHEN** 用户从列表页进入文章页
- **THEN** 页面切换 MUST 不播放共享元素变形动画
- **AND** 导航结果与内容可达性 MUST 与启用动画时一致
