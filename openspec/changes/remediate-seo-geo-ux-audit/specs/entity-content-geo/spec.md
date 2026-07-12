## ADDED Requirements

### Requirement: 唯一作者实体配置

站点 MUST 使用单一 AUTHOR 配置作为可见署名、meta 和结构化数据的唯一事实来源。作者名称、别名、头像、简介、邮箱和社交账户 MUST 由站点所有者确认；未确认字段 MUST 被省略，系统 MUST 不得推断 Organization 或其他身份关系。

#### Scenario: 渲染已确认作者身份

- **GIVEN** AUTHOR 配置包含已确认的公开字段
- **WHEN** 首页、文章和项目页面完成构建
- **THEN** 所有页面 MUST 引用 `https://huaruic.com/#person`
- **AND** 页面 MUST 不得分别硬编码互相矛盾的作者对象
- **AND** 可见名称与结构化数据名称 MUST 来自同一配置

#### Scenario: 身份字段尚未确认

- **WHEN** 某个别名、账户或组织关系没有获得所有者确认
- **THEN** 页面与 JSON-LD MUST 省略该字段
- **AND** 构建过程 MUST 不得自动补造信息

### Requirement: 统一页面实体图

首页 MUST 输出相互关联的 `WebSite`、`Person` 和 `ProfilePage` 实体；文章和项目 MUST 输出与页面真实内容一致的实体，并通过 canonical URL 与稳定 `@id` 引用同一作者和站点。

#### Scenario: 构建首页实体图

- **WHEN** 首页完成构建
- **THEN** JSON-LD MUST 包含 `WebSite`、`Person` 和 `ProfilePage`
- **AND** `ProfilePage.mainEntity` MUST 引用统一作者实体
- **AND** 页面实体 MUST 引用 `https://huaruic.com/#website`

#### Scenario: 构建文章实体图

- **WHEN** 可索引文章完成构建
- **THEN** 页面 MUST 输出 `BlogPosting`
- **AND** `author` MUST 引用统一作者 `@id`
- **AND** `isPartOf`、`mainEntityOfPage`、`datePublished` 和 `inLanguage` MUST 与页面内容一致
- **AND** 只有存在真实值时才 MUST 输出 `dateModified` 或 `image`

### Requirement: 可见署名与修订信息

每篇可索引文章 MUST 在页面界面显示作者、发布日期和内容语言，并将作者链接到统一 ProfilePage。只有内容具有明确的实质修订记录时，页面才 MUST 显示更新时间并输出相同的 `dateModified`。

#### Scenario: 文章只有发布日期

- **WHEN** 文章没有显式更新时间
- **THEN** 页面 MUST 显示作者和发布日期
- **AND** JSON-LD MUST 不得输出推测或构建生成的 `dateModified`

#### Scenario: 文章具有更新时间

- **GIVEN** 编辑显式填写经确认的更新时间
- **WHEN** 页面完成构建
- **THEN** 可见更新时间与 JSON-LD `dateModified` MUST 完全一致
- **AND** 更新时间 MUST 不得使用构建时间替代

### Requirement: 证据约束的项目实体与案例

每个可索引项目页 MUST 基于真实信息说明目标用户或问题、作者角色与贡献、项目状态、关键决策与权衡、结果或学习，以及至少一种可核验的演示、仓库、截图、文档或第三方证据。Schema 类型 MUST 与页面证据一致，没有足够信息时 MUST 使用 `CreativeWork`，系统 MUST 不得生成虚构评分、报价、客户、组织或指标。

#### Scenario: 项目没有量化指标

- **WHEN** 项目没有经过验证的用户数、收入、性能或排名数据
- **THEN** 页面 MUST 使用可核验的定性结果或学习描述
- **AND** 页面与结构化数据 MUST 不得生成虚构数值

#### Scenario: 项目使用具体 Schema 类型

- **WHEN** 编辑选择 `SoftwareApplication`、`WebSite`、`Event` 或其他具体类型
- **THEN** 页面可见内容 MUST 提供支持该类型的事实
- **AND** 内容 schema 或构建检查 MUST 验证类型所需的已确认字段

#### Scenario: 项目包含第三方认可声明

- **WHEN** 页面声明获奖、入选、联合组织或其他第三方认可
- **THEN** 页面 MUST 提供可访问的第三方证据
- **AND** 无法核验的声明 MUST 被移除或改写为准确的参与过程

### Requirement: 页面级品牌与分享证据

站点名称、作者名称、tagline 和社交资料 MUST 采用所有者确认的层级：首页 title MUST 以作者/专业定位为主，`Always Exploring` 只能在确认后作为 tagline。文章和项目 MUST 优先使用与页面相关的已确认分享图，没有页面图时 MUST 使用自有品牌默认图。

#### Scenario: 生成首页 title 与实体名称

- **WHEN** 所有者确认公开作者名和 tagline
- **THEN** 首页 title、H1、Person 与 WebSite 名称 MUST 使用同一命名策略
- **AND** 社交账户别名 MUST 作为 `sameAs` 或别名而非竞争的作者主体

#### Scenario: 页面没有封面图

- **WHEN** 文章或项目没有可用页面级图片
- **THEN** 分享元数据 MUST 使用自有品牌默认图
- **AND** JSON-LD MUST 不得假装该默认图是项目成果截图

### Requirement: 主题集群与上下文内链

站点 MUST 围绕真实作品维护有编辑价值的主题集群。核心文章在存在相关目标时 MUST 链接至少一个相关项目和两篇上下文相关文章；项目页 MUST 反向链接对应实践内容，锚文本 MUST 描述目标主题。

#### Scenario: 发布核心技术文章

- **WHEN** 编辑发布属于本地 AI Agent、AI-native 工程或隐私/链上核心主题的文章
- **THEN** 文章 MUST 链接至少一个相关项目
- **AND** 在存在合格内容时 MUST 链接至少两篇上下文相关文章
- **AND** 链接文案 MUST 不得只使用“点击这里”等无描述文本

#### Scenario: 构建主题页

- **WHEN** 某主题缺少独特编辑说明和足够的真实内容
- **THEN** 系统 MUST 不得只为关键词生成可索引空壳页
- **AND** 该主题 MUST 保留在内容计划中而非进入 sitemap

### Requirement: 有价值的主题中心

重要标签或主题页 MUST 使用集中式分类数据提供独特说明、代表内容、最近内容和相关项目。语义重叠、过宽或内容不足的标签 MUST 被合并、重命名或设为 `noindex`。

#### Scenario: 构建重要主题页

- **WHEN** 标签被标记为可索引核心主题
- **THEN** 页面 MUST 包含独特主题介绍
- **AND** 页面 MUST 展示经编辑选择的代表内容及最近内容
- **AND** 页面 MUST 提供到相关项目或相邻主题的关系

#### Scenario: 构建低价值标签页

- **WHEN** 标签缺少清晰意图或只有不足以支撑独立页面的内容
- **THEN** 标签 MUST 被合并、重命名或 `noindex`
- **AND** 页面 MUST 不得进入 sitemap

### Requirement: 搜索意图重叠治理

疑似重复或争夺同一意图的内容 MUST 经过人工评审，并选择差异化定位、合并永久重定向或保留归档中的一种处理。系统 MUST 不得仅按标题相似度自动删除文章。

#### Scenario: 两篇文章服务相同意图

- **WHEN** 内容盘点确认两篇文章主题与答案高度重叠
- **THEN** 编辑 MUST 明确保留主页面与差异化策略或合并方案
- **AND** 被合并的旧 URL MUST 单次永久重定向到相关保留页
- **AND** sitemap 与内链 MUST 更新为主页面

### Requirement: GEO 可回答性与来源证据

核心技术和项目内容 MUST 在开头清晰回答主要问题，并提供适用边界、第一方示例、可扫描标题和来源证据。版本相关事实、第三方行为和行业结论 MUST 优先引用官方文档或原始来源；页面 MUST 不得为生成式搜索堆砌关键词或无证据结论。

#### Scenario: 发布版本相关技术文章

- **WHEN** 文章解释特定框架、产品或依赖版本的行为
- **THEN** 页面 MUST 说明适用版本或时间边界
- **AND** 页面 MUST 链接相关官方文档或原始来源
- **AND** 示例与结论 MUST 能在正文中独立理解

#### Scenario: 引用第一方项目经验

- **WHEN** 文章使用本站项目作为案例
- **THEN** 页面 MUST 链接对应项目页或仓库证据
- **AND** 项目页 MUST 在相关时反向链接该实践文章

### Requirement: 可选生成式搜索发现文件

站点 MUST 只在作者实体、canonical、sitemap、内容质量和站内关系完成验收后评估 `llms.txt`。若启用该文件，其内容 MUST 来自规范内容清单，MUST 不得替代 sitemap、robots、canonical 或正文，也 MUST 不得包含草稿、`noindex`、权属未确认或虚构内容。

#### Scenario: 启用 llms.txt

- **GIVEN** 基础 SEO 与内容治理要求已经通过
- **WHEN** 所有者决定发布 `llms.txt`
- **THEN** 文件 MUST 只列出作者、核心主题、代表项目、关键文章、RSS 和 sitemap 的规范 URL
- **AND** 文件 MUST 明确作为导航清单而非排名保证

#### Scenario: 基础治理尚未完成

- **WHEN** 作者身份、权属或 canonical 仍有未解决问题
- **THEN** 任务计划 MUST 不得把 `llms.txt` 置于这些基础任务之前
- **AND** 站点 MUST 继续以可索引页面和标准发现文件为事实来源
