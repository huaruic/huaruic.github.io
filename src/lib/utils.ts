import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 标签 slug：ASCII 转小写去首尾空白，中文原样保留
export function tagSlug(tag: string) {
  return tag.trim().toLowerCase();
}

// 拼站点绝对 URL，统一尾斜杠
export function toAbsoluteUrl(path: string) {
  const normalized = path.endsWith("/") ? path : `${path}/`;
  return new URL(normalized, "https://huaruic.com").href;
}

export function readingTime(html: string) {
  const textOnly = html.replace(/<[^>]+>/g, "");
  // 中文按字数统计（400 字/分钟），西文按空格分词（200 词/分钟）
  const cjkCount = (textOnly.match(/[一-鿿]/g) || []).length;
  const wordCount = textOnly
    .replace(/[一-鿿]/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const readingTimeMinutes = (cjkCount / 400 + wordCount / 200 + 1).toFixed();
  return `${readingTimeMinutes} 分钟`;
}

export function dateRange(startDate: Date, endDate: Date | string): string {
  const formatMonth = (date: Date) =>
    `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}`;

  const end = typeof endDate === "string" ? endDate : formatMonth(endDate);

  return `${formatMonth(startDate)} — ${end}`;
}
