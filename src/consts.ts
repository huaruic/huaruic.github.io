import type { Metadata, Site, Socials } from "@types";

export const SITE: Site = {
  TITLE: "Always Exploring",
  DESCRIPTION: "记录工作、生活、阅读与持续探索的中文个人博客。",
  EMAIL: "ernestchen247@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 6,
};

export const HOME: Metadata = {
  TITLE: "首页",
  DESCRIPTION: "记录工作、生活、阅读与持续探索的中文个人博客。",
};

export const BLOG: Metadata = {
  TITLE: "博客",
  DESCRIPTION: "所有文章的归档。",
};

export const SOCIALS: Socials = [
  {
    NAME: "X",
    HREF: "https://x.com/0xErnest247",
  },
  {
    NAME: "GitHub",
    HREF: "https://github.com/huaruic",
  },
];
