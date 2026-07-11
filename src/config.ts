export const SITE = {
  website: "https://huaruic.github.io/", // replace this with your deployed domain
  author: "Ernest Chen",
  profile: "https://huaruic.github.io/",
  desc: "记录工作、生活、阅读与持续探索的中文个人博客。",
  title: "Always Exploring",
  ogImage: "astropaper-og.jpg",
  lightAndDarkMode: true,
  postPerIndex: 6,
  postPerPage: 10,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showBackButton: true, // show back button in post detail
  editPost: {
    enabled: false,
    text: "编辑此页",
    url: "https://github.com/huaruic/huaruic.github.io/edit/master/",
  },
  dynamicOgImage: false,
  dir: "ltr", // "rtl" | "auto"
  lang: "zh-CN", // html lang code. Set this empty and default will be "en"
  timezone: "Asia/Shanghai", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
} as const;
