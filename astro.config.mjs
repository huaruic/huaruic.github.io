import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import pagefind from "astro-pagefind";
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://huaruic.com",
  // 静态构建生成 meta-refresh 跳转页，承接历史 URL：
  // AstroPaper 时代 /posts/<slug>/、Hugo 时代 /blog/zh/<slug>/（slug 与现文件名一致，已核对 git 历史）
  redirects: {
    "/posts/[...id]": "/blog/[...id]",
    "/blog/zh/[...id]": "/blog/[...id]",
    "/art/zh/short-think": "/blog/short-think",
  },
  integrations: [sitemap(), mdx(), pagefind()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    shikiConfig: {
      theme: "css-variables",
    },
  },
});
