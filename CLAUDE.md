# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Chinese personal blog ("Always Exploring") built on **AstroPaper** (Astro 5 + Tailwind 4). Deployed to GitHub Pages automatically on push to `master` (`.github/workflows/gp.yml` runs `pnpm astro build`). CI on PRs runs lint + format check + build (`.github/workflows/ci.yml`).

## Commands

Package manager is **pnpm** (v10, Node 20).

```bash
pnpm dev            # local dev server
pnpm build          # astro check + build + pagefind index (copied into public/)
pnpm preview        # preview built site
pnpm lint           # eslint
pnpm format         # prettier --write (format:check to verify)
pnpm sync           # regenerate astro content types
```

No tests. Verification = `pnpm build` passing (it includes type-checking via `astro check`).

## Writing posts

Posts live in `src/data/blog/*.md` (filenames starting with `_` are excluded). Frontmatter schema is defined in `src/content.config.ts`:

- Required: `title`, `description`, `pubDatetime` (a date, e.g. `2026-07-11T12:00:00+08:00`)
- Optional: `tags` (defaults to `["others"]`), `featured`, `draft`, `modDatetime`, `ogImage`, `author` (defaults to site author), `canonicalURL`, `timezone`

Publishing = commit the markdown and push to `master`; GitHub Actions builds and deploys.

## Architecture

- `src/config.ts` — site-wide settings (SITE object: title, author, URL, lang `zh-CN`, timezone `Asia/Shanghai`, posts per page, feature toggles like `dynamicOgImage`)
- `src/content.config.ts` — blog collection loader + zod frontmatter schema
- `src/pages/` — routes (index, posts, tags, archives, search, rss, og image, robots)
- `src/utils/` — post sorting/filtering/slugs, OG image generation (satori + resvg), shiki transformers
- `astro.config.ts` — markdown pipeline (remark-toc, remark-collapse, shiki code themes/transformers), sitemap
- Search is pagefind, indexed at build time

The site was migrated from Hugo (old post URLs were `/blog/zh/<slug>/`; current ones are `/posts/<slug>/`). All Hugo-era files have been removed.
