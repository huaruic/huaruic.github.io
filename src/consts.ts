import type { Author, Metadata, Site, Socials } from "@types";

export const AUTHOR: Author = {
  NAME: "Ernest Chen",
  ALIAS: "Ernest",
  URL: "https://huaruic.com",
  EMAIL: "ernestchen247@gmail.com",
  AVATAR: "/ernest-avatar.png",
  X: "https://x.com/0xErnest247",
  GITHUB: "https://github.com/huaruic",
};

export const SITE: Site = {
  TITLE: "Always Exploring",
  DESCRIPTION:
    "Ernest 的个人网站：专注 AI Agent、本地优先应用与 AI-native 工程实践，也记录工作与持续探索。",
  EMAIL: "ernestchen247@gmail.com",
  NUM_POSTS_ON_HOMEPAGE: 4,
  NUM_PROJECTS_ON_HOMEPAGE: 4,
  NUM_WORKS_ON_HOMEPAGE: 3,
};

export const HOME: Metadata = {
  TITLE: "首页",
  DESCRIPTION:
    "Ernest 是一名专注 AI Agent 的独立开发者，持续构建本地优先、真正可用的智能体产品。",
};

export const BLOG: Metadata = {
  TITLE: "博客",
  DESCRIPTION:
    "Ernest 的全部文章：AI Agent 工程实践、工作复盘，以及阅读、旅行与生活记录。",
};

export const WORK: Metadata = {
  TITLE: "工作经历",
  DESCRIPTION: "Ernest 的工作经历，以及在不同团队中解决过的问题。",
};

export const PROJECTS: Metadata = {
  TITLE: "项目",
  DESCRIPTION: "Ernest 正在构建的 AI、隐私链上应用、开放网络与生活实验。",
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
