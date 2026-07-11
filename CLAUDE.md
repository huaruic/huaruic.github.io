# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Chinese personal blog ("Always Exploring") built on **Astro Micro** (Astro 5 + Tailwind 4, fork of Astro Nano). Deployed to GitHub Pages automatically on push to `master` (`.github/workflows/gp.yml` runs `pnpm build`). CI on PRs runs format check + build (`.github/workflows/ci.yml`).

## Commands

Package manager is **pnpm** (v10, Node 20).

```bash
pnpm dev            # local dev server (port 4321)
pnpm build          # astro check + astro build (pagefind index built by astro-pagefind integration)
pnpm preview        # preview built site
pnpm format         # prettier --write (format:check to verify; CI enforces it)
```

No tests. Verification = `pnpm build` passing (includes type-checking via `astro check`).

## Writing posts

Posts live in `src/content/blog/*.md` (URL: `/blog/<filename>/`). Frontmatter schema is in `src/content.config.ts`:

- Required: `title`, `description`, `date` (e.g. `2026-07-12T12:00:00+08:00`)
- Optional: `tags` (string array), `draft: true` (excluded from build)

Publishing = commit the markdown and push to `master`; GitHub Actions builds and deploys.

## Architecture

- `src/consts.ts` — site title/description/email/socials, posts-per-homepage
- `src/content.config.ts` — blog collection (glob loader) + zod schema
- `src/pages/` — routes: index (bio + latest posts), blog, tags, rss, 404
- `src/components/` — Head (SEO/OG), Header, search (Pagefind modal), TOC, post navigation
- `src/styles/global.css` — Tailwind theme; CJK font stack and 1.9 line-height for Chinese prose
- `astro.config.mjs` — site URL, sitemap/mdx/pagefind integrations, shiki css-variables theme
- Search is Pagefind via the astro-pagefind integration (index generated during `astro build`)

## Local customizations vs upstream Astro Micro

Kept deliberately different from the upstream theme — do not "restore" these when pulling theme updates:

- Projects collection/pages and Giscus comments removed entirely
- `lang="zh-CN"` in Layout; UI strings translated to Chinese
- `TableOfContents.astro` buildToc fixed to tolerate skipped heading levels (upstream crashes on h3-without-h2)
- ESLint dropped; Prettier only (`.prettierrc.mjs`)

History: the site ran Hugo, then AstroPaper (old post URLs `/posts/<slug>/`, Hugo-era `/blog/zh/<slug>/`); current URLs are `/blog/<slug>/`.
