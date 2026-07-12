## ADDED Requirements

### Requirement: 敏感凭据事故处置

仓库和已部署站点 MUST 不包含任何有效的访问凭据、订阅密钥、令牌或其他可复用秘密。已暴露的值 MUST 先被撤销或轮换，再从当前源码、构建产物和可控缓存中清理，所有记录和工具输出 MUST 脱敏。凭据一经服务端撤销即告失效，因此本变更 MUST NOT 执行 Git 历史重写：公开 GitHub Pages 仓库重写历史的收益趋近于零，且会破坏所有既有 clone 与 fork。

#### Scenario: 完成已知凭据处置

- **GIVEN** 审计已发现历史内容包含疑似可复用秘密
- **WHEN** 维护者完成撤销或轮换、当前内容清理、重新部署和失效验证
- **THEN** 原凭据 MUST 无法再用于访问对应服务
- **AND** 当前工作树、生产构建和公开页面 MUST 不再包含该秘密
- **AND** 处置记录 MUST 只保存脱敏指纹、位置、时间和验证结论

#### Scenario: 有人提议重写 Git 历史

- **GIVEN** 已撤销的秘密仍存在于可达 Git 历史
- **WHEN** 维护者或工具提议执行 `git filter-repo` 或等效历史重写
- **THEN** 本变更范围内 MUST 不执行该操作
- **AND** 仅当站点所有者未来明确要求时 MUST 另立独立变更处理
- **AND** 该独立变更 MUST 记录备份、强制推送范围和协作者重新同步方案后方可实施

### Requirement: 持续秘密防护

Pull Request 和发布流程 MUST 对源码、内容和生成产物执行高置信度秘密扫描，扫描结果 MUST 脱敏，新增有效秘密 MUST 阻止合并或发布。

#### Scenario: 新提交匹配秘密规则

- **WHEN** Pull Request 引入匹配高置信度规则的内容
- **THEN** CI MUST 失败
- **AND** 报告 MUST 仅显示文件位置、规则编号和脱敏指纹
- **AND** 误报豁免 MUST 包含最小匹配范围、理由和审查人

### Requirement: 可验证的内容权属与来源

公开内容 MUST 具有可验证的原创、授权、转载或跨域再发布依据。与第三方内容高度相似且归属不明的页面 MUST 在确认前停止作为原创内容索引和分发；页面 MUST 不得把未经证明的第三方资产、服务、仓库或账户描述为本站作者所有。

#### Scenario: 权属尚未确认

- **GIVEN** 内容审计已标记某页面与第三方内容高度相似
- **WHEN** 维护者尚不能提供原创身份、授权或转载依据
- **THEN** 页面 MUST 被设为草稿、下线或 `noindex`
- **AND** 页面 MUST 从 sitemap、RSS 和 Pagefind 中排除
- **AND** 处置清单 MUST 记录待确认事项、责任人和状态

#### Scenario: 权属已经确认

- **GIVEN** 维护者提供可核验的原创或授权依据
- **WHEN** 页面恢复公开发布
- **THEN** 页面 MUST 显示准确作者、来源和发布关系
- **AND** canonical MUST 按实际关系自引用或指向原始来源
- **AND** 所有资产归属陈述 MUST 与证据一致

### Requirement: 本地资源完整性

所有公开页面引用的站内图片、脚本、样式、下载文件和片段锚点 MUST 在构建产物中存在并可解析；缺失的本地资源 MUST 阻止发布。

#### Scenario: 内容引用不存在的本地图片

- **WHEN** Markdown、MDX 或 Astro 文件引用不存在的本地资源
- **THEN** 内容质量门禁 MUST 失败
- **AND** 报告 MUST 给出来源文件、行号和缺失路径

#### Scenario: 页面引用不存在的锚点

- **WHEN** 构建产物中的内部片段链接没有对应目标 ID
- **THEN** 链接检查 MUST 失败
- **AND** 报告 MUST 指出来源页面和目标片段

### Requirement: 遗留内容处置

现有文章和项目 MUST 具有可审计的处置状态：保留、重写、合并、归档 `noindex`、删除并重定向或返回 410。测试页、占位页和内容过薄页 MUST 不得在未评审时继续作为独立可索引内容，重定向目标 MUST 与原始意图相关。

#### Scenario: 处理模板测试内容

- **GIVEN** `videos.md` 被识别为遗留模板或测试内容
- **WHEN** 编辑完成内容评审
- **THEN** 页面 MUST 被重写为真实内容、归档、删除并相关重定向或返回 410
- **AND** 最终决定 MUST 写入内容处置清单

#### Scenario: 处理薄内容

- **GIVEN** 页面主要由少量图片或缺少独立信息价值
- **WHEN** 编辑无法补充可验证的独特内容
- **THEN** 页面 MUST 被合并、归档 `noindex` 或删除
- **AND** 页面 MUST 不再作为空壳 URL 出现在 sitemap

### Requirement: 内容事实与日期一致性

标题、frontmatter 日期、正文年份、更新时间和项目事实 MUST 相互一致。系统 MUST 使用站点所有者确认的 IANA 写作时区；构建时间或 Git 当前时间 MUST 不得被自动当作内容更新时间。

#### Scenario: 内容日期互相冲突

- **WHEN** 标题、文件名、frontmatter 和正文中的年份或日期发生冲突
- **THEN** 内容检查 MUST 要求人工确认正确值
- **AND** 页面 MUST 在冲突解决前停止发布或保留明确审查状态

#### Scenario: 内容经过实质修订

- **GIVEN** 编辑显式填写真实更新时间
- **WHEN** 页面完成构建
- **THEN** 可见更新时间、meta 和 JSON-LD `dateModified` MUST 完全一致
- **AND** 日期格式化 MUST 使用已确认的站点时区
