# OPS 模块产出记录（2026-07-12）

## 产出清单

| 文件 | 说明 | 对应任务 |
| --- | --- | --- |
| `scripts/verify.mjs` | 确定性质量门禁（纯 Node 零依赖，失败 exit 1，输出文件:行号） | 8.1、8.2 精简版 |
| `scripts/verify.test.mjs` | 秘密扫描 fixture 自检：伪造高置信度秘密 → 断言命中且输出不含原值 | 2.6 |
| `scripts/new-post.mjs` | 新文章脚手架，frontmatter 字段完整（title/description/date+08:00/tags/draft） | 8.12 |
| `package.json` | 移除 `@fontsource/geist-sans`、`@fontsource/geist-mono`；新增 `verify`、`new-post` scripts | 6.1 前置、6.11 依赖清理 |
| `.github/workflows/ci.yml` | format → **verify** → build；未加 Lighthouse/视觉回归（REV-F：不阻塞 PR） | 8.1、8.3 精简版 |
| `README.md` | 重写：站点定位、技术栈、内容模型、命令、部署、质量约束、OpenSpec 工作流 | 8.9 |

## verify 检查项 ↔ 验收映射

1. 秘密扫描（dler.cloud / 带令牌 subscribe URL / sk- / AKIA / ghp_，输出脱敏）→ 2.6
2. 占位 description（空、<10 字符、纯符号）→ 3.8
3. 标题层级（正文禁 H1、禁跳级）→ 3.9
4. 标签大小写冲突（lowercase 折叠去重）→ 4.3
5. 本地资源存在性（站点绝对路径图片/附件）→ 3.2
6. 日期合法性（可解析、不晚于当前 +1 天）→ 3.3

## 当前 verify 运行结果（2026-07-12，内容组并行整改中）

- ✓ 秘密扫描（SEC-01 凭据已从内容清除）
- ✓ 标签冲突（Java/java 已归一）
- ✓ 本地资源、✓ 日期合法性
- ✗ description 质量 1 项：`countdown-to-dayTwo-2022.md`（"随笔与记录。" <10 字符）
- ✗ 标题层级 27 项：存量文章正文以 H3 开头（H2 缺失导致跳级）

后两类属内容组（第 3 节任务）范围；门禁按规范执行、未为存量放松。fixture 自检 `node scripts/verify.test.mjs` 通过（4 类模式命中、输出脱敏断言通过）。

## 仓库外阻塞任务（需站点所有者亲自操作）

| 任务 | 所有者需要做什么 |
| --- | --- |
| 1.1 撤销凭据 | 登录 dler.cloud 账户，重置/轮换订阅令牌，确认旧订阅 URL 返回失效 |
| 1.5 / 4.10 www DNS | 在 Cloudflare DNS 为 `www.huaruic.com` 配置到 apex 的 301 重定向（Redirect Rule），验证路径与查询保留 |
| 8.5 站长平台 | 在 Google Search Console 与 Bing Webmaster Tools 验证 huaruic.com，提交 `sitemap-index.xml` |
| 8.6 / 8.7 观测 | GSC 索引/CWV（CrUX）报告建立月度查看习惯；无自建 RUM（REV-G） |
| 9.5 / 9.6 发布后验证 | 部署后抽查生产页 robots/sitemap/RSS/canonical/Schema 与无秘密残留；在站长平台请求重新抓取 |
