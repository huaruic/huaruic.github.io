## ADDED Requirements

### Requirement: 字体资源预算

站点 MUST 移除 Head.astro 中 Geist Sans 与 Geist Mono 各 100–900 共 18 个 @fontsource 静态字重导入（现状：Geist 不含 CJK 字形，中文正文实际渲染于系统字体，这 18 个字重只服务拉丁字符）。在此前提下，站点 MUST 按所有者决策（REV-A）采用以下两个方案之一，并 MUST 提供布局稳定的系统字体回退。

方案 A（系统字体栈）：sans 使用 `-apple-system`、`"SF Pro Text"`、`"PingFang SC"` 等系统栈，mono 使用 `ui-monospace` 栈；不发布任何自托管字体。

方案 B（自托管中文可变字体，参照 astro-theme-retypeset 模式）：中文字体 MUST 采用 unicode-range 分片（如 cn-font-split 产物），MUST 提供不超过 20 KiB 的高频子集（符号、拉丁字母、数字与常用汉字）并通过 `<link rel="preload">` 预加载；全部 @font-face MUST 使用 `font-display: swap` 并声明系统回退；西文若保留 Geist MUST 使用单一可变字体文件；分片总量 MUST 纳入静态资产预算。

#### Scenario: 所有者选定方案 A 后构建生产站点

- **GIVEN** 所有者选定方案 A（系统字体栈）
- **WHEN** CI 完成生产构建
- **THEN** 首次页面所需字体传输总量 MUST 为 0 KiB
- **AND** 构建产物 MUST 不包含任何 @fontsource 字体文件
- **AND** 原 300 KiB 字体预算与字体视觉回归要求随本方案作废

#### Scenario: 所有者选定方案 B 后构建生产站点

- **WHEN** CI 完成生产构建且所有者选定方案 B（自托管中文可变字体）
- **THEN** 首屏 MUST 仅同步依赖不超过 20 KiB 的高频子集，其余分片 MUST 由浏览器按 unicode-range 按需请求
- **AND** 系统 MUST 不得发布 Geist Sans 与 Mono 各 100–900 的完整静态字重组合
- **AND** 每个 @font-face MUST 使用 `font-display: swap` 且字体加载失败时页面 MUST 保持可读、不得产生显著布局偏移

### Requirement: 搜索资源按需加载

Pagefind UI 的样式和运行时代码 MUST 只在用户首次表达搜索意图或访问专用搜索页面时加载，并且在一次会话中 MUST 只初始化一次。

#### Scenario: 用户未使用搜索

- **WHEN** 用户访问首页、文章或项目页面但未打开搜索
- **THEN** 初始关键请求链 MUST 不包含 Pagefind UI 同步脚本
- **AND** Pagefind UI CSS MUST 不得成为首屏渲染阻塞资源

#### Scenario: 用户首次打开搜索

- **WHEN** 用户点击搜索入口或使用搜索快捷键
- **THEN** 系统 MUST 加载并初始化一次搜索资源
- **AND** 资源就绪后搜索输入框 MUST 获得焦点
- **AND** 后续打开搜索 MUST 不得重复下载或重复绑定同一监听器

### Requirement: 首屏内容立即可见

首屏标题、摘要、日期、主要操作和其他 LCP 候选内容 MUST 在初始 HTML/CSS 渲染时可见，MUST 不得依赖顺序计时器解除透明或位移状态。系统 MUST 删除现有 JS setTimeout 阶梯动画（Head.astro 的 `animate()`）、`.animate` 默认 `opacity-0` 全局类与 Layout 的 noscript 补丁（REV-B）。

入场动画 MUST 为纯 CSS `@keyframes` 加 `nth-child` 阶梯 `animation-delay` 实现，MUST 通过 `animation-fill-mode: backwards` 或等效方式保证元素的静态状态可见（无脚本、爬虫、阅读模式下内容不被隐藏）。H1、日期、标签等 LCP 候选 MUST 不参与入场动画；入场动画 MUST 仅作用于文章页正文区块，列表页与首页 MUST 不做全页入场；移动端 MUST 在约第 8 个正文元素后截断延迟递增。非必要动画 MUST 遵循用户的减少动态效果偏好。

#### Scenario: 客户端脚本尚未执行

- **WHEN** 页面 HTML 与 CSS 已加载但客户端脚本尚未执行
- **THEN** H1、主要摘要和 CTA MUST 可见
- **AND** LCP 候选元素 MUST 不得处于 `opacity: 0` 或视口外的动画初态
- **AND** 禁用 JavaScript 或以阅读模式访问时正文全部区块 MUST 可见，MUST 不依赖 noscript 补丁

#### Scenario: 文章页正文入场动画

- **WHEN** 用户加载文章页且未启用减少动态效果
- **THEN** 正文区块入场 MUST 由纯 CSS 动画驱动，MUST 不依赖任何 JS 计时器或监听器
- **AND** H1、日期与标签 MUST 不参与入场动画
- **AND** 移动端约第 8 个正文元素之后 MUST 不再递增延迟
- **AND** 列表页与首页 MUST 不出现全页入场动画

#### Scenario: 用户要求减少动画

- **GIVEN** 用户启用 `prefers-reduced-motion: reduce`
- **WHEN** 用户加载或切换页面
- **THEN** 系统 MUST 禁用非必要淡入、位移和光滑滚动动画
- **AND** 禁用动画 MUST 不得隐藏内容或阻塞操作

### Requirement: 主题切换过渡

主题切换 SHOULD 使用 View Transitions 的 clip-path reveal 过渡；浏览器不支持 `startViewTransition` 时 MUST 退回瞬时切换。系统 MUST 移除现有通过注入 `* { transition: none !important }` 样式禁用全局过渡的 hack（Head.astro `toggleTheme()`）。

#### Scenario: 用户切换明暗主题

- **WHEN** 用户点击主题切换按钮
- **THEN** 支持 View Transitions 的浏览器 SHOULD 播放 clip-path reveal 过渡，不支持时 MUST 瞬时完成切换
- **AND** 切换过程 MUST 不向文档注入全局 `transition: none` 样式
- **AND** 用户启用 `prefers-reduced-motion: reduce` 时 MUST 跳过过渡动画

### Requirement: 响应式图片流水线

内容图片 MUST 提供固有尺寸和与用途相符的替代文本，并 MUST 生成适合视口的现代格式与响应式来源。只有被确定为 LCP 候选的图片可以立即加载，其余内容图片 MUST 默认 lazy 与异步解码。

#### Scenario: 渲染普通内容图片

- **WHEN** 系统构建非首屏内容图片
- **THEN** 图片 MUST 包含 `width`/`height` 或等效宽高比
- **AND** 图片 MUST 提供适当的 AVIF/WebP、`srcset` 和 `sizes`
- **AND** 图片 MUST 使用 lazy loading 和 async decoding
- **AND** 非装饰图片 MUST 使用描述信息用途的 alt 文本

#### Scenario: 渲染头像或缩略图

- **WHEN** 图片的实际显示尺寸为小头像或缩略图
- **THEN** 系统 MUST 传输接近显示尺寸的派生资源
- **AND** 系统 MUST 不得为 24px 头像发送原始 400px 资源作为唯一候选

#### Scenario: 渲染 LCP 图片

- **WHEN** 图片被明确标记为页面 LCP 候选
- **THEN** 图片 MUST 不使用延迟懒加载
- **AND** 图片资源 MUST 匹配实际视口和显示尺寸
- **AND** 页面 MUST 只为真正关键的图片使用高优先级加载

### Requirement: 幂等客户端生命周期

通过 Astro 页面过渡重复进入页面时，全局滚动、主题、媒体查询、搜索和按钮事件监听 MUST 保持幂等，并 MUST 在不再需要时释放。已知的两个具体实例 MUST 消除：back-to-top 按钮在 BackToTop.astro 与 Head.astro `init()` 中被双重绑定（单次点击触发两次处理）；Giscus 评论已移除但 `setGiscusTheme()` 仍在每次 `init()` 与 `toggleTheme()` 中执行，该死代码 MUST 删除。

#### Scenario: 连续客户端页面切换

- **WHEN** 自动化测试连续执行至少十次页面切换
- **THEN** 单次滚动、主题变化或返回顶部操作 MUST 只触发一个处理流程
- **AND** 监听器数量 MUST 不得随切换次数持续增长
- **AND** 被替换页面专属监听器 MUST 被清理

#### Scenario: 清理已知重复绑定与死代码

- **WHEN** 用户在任意页面点击 back-to-top 按钮
- **THEN** 滚动到顶部处理 MUST 只执行一次，back-to-top MUST 只保留一处事件绑定
- **AND** 客户端脚本 MUST 不再包含或调用 `setGiscusTheme()` 等已移除功能的死代码

### Requirement: 实验室性能预算

站点 MUST 在固定移动端测试条件下对首页、普通文章和图片密集文章执行至少三次性能测试，并使用中位数判定。代表页面 MUST 达到 LCP 不高于 2.5 秒、CLS 不高于 0.1、TBT 不高于 200 毫秒；预算环境、页面和结果 MUST 被记录。

#### Scenario: 运行发布性能验收

- **WHEN** CI 或发布验收运行代表页面测试
- **THEN** 每类页面 MUST 至少运行三次并使用中位数
- **AND** LCP、CLS 与 TBT MUST 满足项目预算
- **AND** 任何预算豁免 MUST 记录基线、原因、期限和跟踪任务

### Requirement: 页面资源预算可追踪

系统 MUST 对 CSS、字体、JavaScript 与图片建立按页面类型的传输预算，初始预算 MUST 基于整改后的测量基线锁定。图片密集页面和普通页面 MUST 分开管理，新增资源导致的预算回归 MUST 在 Pull Request 中可见。

#### Scenario: Pull Request 增加页面资源

- **WHEN** 变更使代表页面超过已批准预算
- **THEN** 性能门禁 MUST 失败或要求有期限的显式豁免
- **AND** 报告 MUST 按 CSS、字体、JavaScript 与图片列出差异
- **AND** 单次 Lighthouse 总分 MUST 不得代替资源明细
