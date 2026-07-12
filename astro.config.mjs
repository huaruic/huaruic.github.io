import { readFileSync, readdirSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";

// slug -> ISO 日期映射，供 sitemap lastmod 使用（updatedDate 优先）
const blogDates = Object.fromEntries(
  readdirSync("./src/content/blog")
    .filter(f => f.endsWith(".md") || f.endsWith(".mdx"))
    .map(f => {
      const fm = readFileSync(`./src/content/blog/${f}`, "utf8").match(
        /^---\n([\s\S]*?)\n---/
      )?.[1];
      const date =
        fm?.match(/^updatedDate:\s*(\S+)/m)?.[1] ??
        fm?.match(/^date:\s*(\S+)/m)?.[1];
      const parsed = date ? new Date(date) : null;
      return [
        f.replace(/\.mdx?$/, ""),
        parsed && !isNaN(parsed) ? parsed.toISOString() : null,
      ];
    })
    .filter(([, d]) => d)
);

// https://astro.build/config
export default defineConfig({
  site: "https://huaruic.com",
  trailingSlash: "always",
  // 静态构建生成 meta-refresh 跳转页，承接历史 URL：
  // AstroPaper 时代 /posts/<slug>/、Hugo 时代 /blog/zh/<slug>/（slug 与现文件名一致，已核对 git 历史）
  redirects: {
    "/posts/[...id]": "/blog/[...id]",
    "/blog/zh/[...id]": "/blog/[...id]",
    // short-think 已下线（draft），旧 URL 承接到博客归档
    "/art/zh/short-think": "/blog/",
  },
  integrations: [
    sitemap({
      filter: page => !page.includes("/404"),
      // lastmod 只在有真实内容日期时输出（updatedDate 优先于 date）
      serialize(item) {
        const slug = item.url.match(/\/blog\/([^/]+)\/$/)?.[1];
        if (slug && blogDates[slug]) item.lastmod = blogDates[slug];
        return item;
      },
    }),
    mdx(),
    pagefind(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
});
