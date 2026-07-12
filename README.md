# huaruic.com

Ernest Chen 的中文个人站：AI Agent 工程实践、项目作品集与博客。基于 Astro Micro 主题深度定制（Astro 5 + Tailwind CSS 4），部署在 GitHub Pages，规范域名 [huaruic.com](https://huaruic.com)。

## 技术栈

- **框架**：Astro 5（静态生成，`trailingSlash: "always"`）
- **样式**：Tailwind CSS 4 + `@tailwindcss/typography`（中文正文 1.9 行高、系统字体栈）
- **搜索**：Pagefind（astro-pagefind 集成，构建时生成索引）
- **包管理**：pnpm 10 / Node 20

## 内容模型

内容源在 `src/content/`，schema 定义于 `src/content.config.ts`：

| Collection | 路径                        | 路由                | 必填 frontmatter                                     |
| ---------- | --------------------------- | ------------------- | ---------------------------------------------------- |
| blog       | `src/content/blog/*.md`     | `/blog/<slug>/`     | `title`、`description`、`date`                       |
| projects   | `src/content/projects/*.md` | `/projects/<slug>/` | `title`、`description`、`category`、`order`          |
| work       | `src/content/work/*.md`     | `/work/`（聚合）    | `company`、`role`、`summary`、`dateStart`、`dateEnd` |

blog 可选字段：`tags`（字符串数组）、`draft: true`（构建排除）。写新文章用脚手架：

```bash
pnpm new-post "文章标题" my-english-slug
```

## 常用命令

```bash
pnpm dev            # 本地开发（4321 端口）
pnpm build          # astro check + astro build
pnpm preview        # 预览构建产物
pnpm format         # prettier 格式化（format:check 校验）
pnpm verify         # 确定性质量门禁（见下）
pnpm new-post       # 新文章脚手架
```

## 质量约束

- **零字体传输**：使用系统字体栈（SF Pro / PingFang SC 等），不发布任何 web font
- **纯 CSS 入场动画**：无 JS 定时器，H1/LCP 候选不参与动画，尊重 `prefers-reduced-motion`
- **确定性门禁** `pnpm verify`（CI 在构建前强制执行）：秘密扫描（脱敏输出）、占位 description、正文标题层级、标签大小写冲突、本地资源存在性、日期合法性
- 秘密扫描的 fixture 自检：`node scripts/verify.test.mjs`

## 部署

push 到 `master` 后 GitHub Actions 自动构建部署（`.github/workflows/gp.yml`）；PR 由 `.github/workflows/ci.yml` 跑 format + verify + build。`public/CNAME`（huaruic.com）是自定义域名必需文件，不要删除。

## OpenSpec 工作流

站点整改与规范记录在 `openspec/`（当前变更：`openspec/changes/remediate-seo-geo-ux-audit/`）。修改规范后用严格校验：

```bash
openspec-chinese validate remediate-seo-geo-ux-audit --strict
```

提案只记录需求与任务；业务代码只有在所有者明确要求实施后才修改。
