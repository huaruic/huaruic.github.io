## ADDED Requirements

### Requirement: 确定性 Pull Request 质量门禁

Pull Request CI MUST 在合并前只执行确定性检查：格式、类型与生产构建、秘密扫描、内容 schema、占位 description、标题层级、日期矛盾、tag slug 冲突、内部链接与本地资源、JSON-LD 可解析性。这些检查 MUST 可用脚本或 grep 级规则实现且结果可复现。Lighthouse、视觉回归等有环境波动的检查 MUST 不得作为 PR 阻塞门禁。所有失败 MUST 提供可定位且不泄密的报告。

#### Scenario: 强制检查失败

- **WHEN** 任一 MUST 级别检查失败
- **THEN** CI MUST 阻止合并
- **AND** 报告 MUST 指出文件、页面或规则
- **AND** 报告 MUST 不得包含完整凭据或敏感内容
- **AND** 宽泛 allowlist 或静默忽略 MUST 不得绕过失败

#### Scenario: 检查因外部网络波动失败

- **WHEN** 不受仓库控制的外部站点暂时不可用
- **THEN** CI MUST 将其与内部坏链接区分
- **AND** 外部失败 MUST 进入可重试报告而不是被误判为内部资源通过

#### Scenario: 波动性检查被提议加入门禁

- **WHEN** 有人提议把 Lighthouse 分数或视觉像素对比设为 PR 必过检查
- **THEN** 该检查 MUST 被安排为发布后或月度的独立验证
- **AND** PR 门禁 MUST 保持仅含确定性检查

### Requirement: OpenSpec 变更一致性

本变更进入实施或归档前 MUST 通过 OpenSpec 严格校验。实现提交 MUST 保持 proposal、specs、design 和 tasks 与实际行为一致，任务只有在验证证据存在时才 MUST 标记完成。

#### Scenario: 验证变更包

- **WHEN** 维护者运行 `openspec-chinese validate remediate-seo-geo-ux-audit --strict`
- **THEN** 命令 MUST 成功且无错误
- **AND** 每个 proposal capability MUST 存在对应 delta spec
- **AND** 每个 requirement MUST 至少包含一个 WHEN/THEN 场景

#### Scenario: 标记实施任务完成

- **WHEN** 维护者将 tasks.md 项目标记为完成
- **THEN** 任务描述中的自动命令或人工证据 MUST 已通过
- **AND** 未解决的所有者决策 MUST 不得被假定为完成

### Requirement: 搜索可见性观测

站点 MUST 在 Google Search Console 与 Bing Webmaster Tools 完成所有权验证、提交规范 sitemap，并维护索引、抓取、查询与页面体验的定期复查。没有平台数据 MUST 被记录为“未配置”或“数据不足”，不得解释为通过。

#### Scenario: 完成站长平台配置

- **WHEN** 所有者提供所需的域名或 HTML 验证权限
- **THEN** apex 站点 MUST 在两个平台完成验证
- **AND** 规范 sitemap MUST 成功提交
- **AND** 首页、代表文章和代表项目 MUST 完成 URL Inspection 抽查并记录结果

#### Scenario: 发现索引异常

- **WHEN** 平台报告 404、重复 canonical、已抓取未索引或结构化数据异常增长
- **THEN** 维护流程 MUST 创建带受影响 URL 样本的跟踪任务
- **AND** 问题 MUST 按安全/权属、技术、内容质量或外部平台原因分类

### Requirement: 真实 Core Web Vitals 观测

真实用户性能观测 MUST 以 Google Search Console 与 CrUX 为唯一数据源（免费、零代码、无隐私成本）；本变更 MUST 不引入自建 RUM 或任何 CTA、搜索、筛选类转化事件采集，此类需求仅在站点所有者未来明确要求时另立变更。当平台数据充足时，维护流程 MUST 按 28 天窗口复查 p75 LCP、INP 和 CLS；样本不足 MUST 显示为“数据不足”。

#### Scenario: 生产样本充足

- **WHEN** Search Console 或 CrUX 提供足够样本
- **THEN** 报告 MUST 按页面类型展示 p75 LCP、INP 与 CLS
- **AND** 超出 LCP 2.5 秒、INP 200 毫秒或 CLS 0.1 的页面组 MUST 创建可追踪任务

#### Scenario: 生产样本不足

- **WHEN** 真实用户数据没有达到最低样本要求
- **THEN** 报告 MUST 显示“数据不足”
- **AND** 系统 MUST 不得把缺失数据标记为 Core Web Vitals 已通过

#### Scenario: 有人提议接入自建 RUM 或转化事件

- **WHEN** 维护者或工具建议为站点加入自建 RUM 脚本或转化事件埋点
- **THEN** 该提议 MUST 被排除在本变更范围之外
- **AND** 采纳前 MUST 由站点所有者以新的 OpenSpec 变更明确批准

### Requirement: 性能审计节奏

Lighthouse 移动端三次取中位数的审计 MUST 作为发布后或月度的定期验证执行，结果 MUST 记录到维护清单；该审计 MUST 不阻塞 Pull Request 合并。

#### Scenario: 完成一次定期性能审计

- **WHEN** 维护者在发布后或月度周期运行固定环境的 Lighthouse 三次审计
- **THEN** 报告 MUST 记录三次中位数的 LCP、CLS 与 TBT
- **AND** 超出预算的项 MUST 转化为可追踪任务而不是回滚门禁

### Requirement: 项目与维护文档同步

README 和维护文档 MUST 准确描述当前站点品牌、技术栈、内容模型、本地命令、GitHub Pages 部署、SEO/性能约束、外部平台配置和 OpenSpec 工作流，MUST 不得继续把上游 AstroPaper 品牌或无关部署方式描述为当前项目事实。

#### Scenario: 新维护者阅读 README

- **WHEN** 新维护者从仓库根目录开始工作
- **THEN** README MUST 提供安装、开发、格式、构建和验证命令
- **AND** README MUST 指向当前 OpenSpec 变更和内容治理规则
- **AND** 部署说明 MUST 与 GitHub Actions 和规范域名一致

### Requirement: 定期内容与链接复查

维护流程 MUST 至少按季度复查内容权属、失效外链、薄内容、搜索意图重叠、项目证据和过期版本陈述。每次复查 MUST 产出带状态、责任人和处置方式的清单，并 MUST 保留上次结果以观察新增与关闭项。

#### Scenario: 执行季度复查

- **WHEN** 到达计划复查周期
- **THEN** 维护者 MUST 扫描全部可索引文章、项目与主题页
- **AND** 每个发现 MUST 映射到保留、更新、合并、归档、删除或进一步核实状态
- **AND** 高风险安全或权属发现 MUST 立即升级为 P0 而不等待下一周期

### Requirement: 多浏览器与辅助技术回归

本次整改改版完成后，站点 MUST 在 Chromium、Safari/WebKit 和 Firefox 的桌面与移动代表视口完成一次核心路径检查，并 MUST 对首页、导航、搜索、博客、文章和 404 进行一次键盘及至少一种读屏验证并保留证据。此后 MUST 由 CI 确定性检查守护回归，MUST 不要求每次发布重复人工走查。

#### Scenario: 本次改版完成验收

- **WHEN** 本变更的 UI 与可访问性任务全部实施完毕
- **THEN** 人工矩阵 MUST 覆盖三个浏览器引擎各一次
- **AND** 320px、375px 与桌面视口 MUST 无关键阻断
- **AND** 键盘、焦点恢复、对话框名称和主要 landmark MUST 通过人工验证并记录证据

#### Scenario: 改版之后的常规发布

- **WHEN** 后续发布只包含内容或小型样式变更
- **THEN** CI 确定性检查通过即 MUST 视为回归守护完成
- **AND** 人工跨浏览器与读屏走查 MUST 不作为发布前置条件

### Requirement: 内容工具链

仓库 MUST 提供两项内容工具：一次性 autocorrect 全量格式化（统一中英文混排空格与标点，参照 astro-theme-retypeset 的 format-posts 脚本），其格式规则 MUST 纳入 `pnpm verify` 的检查范围；以及 new-post 脚手架脚本，MUST 生成包含 title、description、date、tags 以及可选 lang、updated 字段的完整 frontmatter 模板。

#### Scenario: 对存量文章执行格式化

- **WHEN** 维护者对全部现有文章运行 autocorrect 格式化
- **THEN** 中英文混排空格与标点 MUST 被统一
- **AND** 之后 `pnpm verify` MUST 能检出新引入的混排格式偏差

#### Scenario: 创建新文章

- **WHEN** 作者使用 new-post 脚手架创建文章
- **THEN** 生成的 frontmatter MUST 包含全部必填字段和可选字段占位
- **AND** 未填写的可选字段 MUST 可以安全省略而不产生伪造值
