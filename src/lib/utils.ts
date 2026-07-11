import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date) {
  return Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
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
