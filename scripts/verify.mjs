#!/usr/bin/env node
// 确定性质量门禁（openspec remediate-seo-geo-ux-audit：任务 2.6/8.1/8.2 精简版）。
// 纯 Node 标准库，零依赖。任何检查失败 exit 1，输出可定位的 文件:行号。
// 秘密扫描输出必须脱敏：只报文件、行号与模式名，绝不回显匹配值。

import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = fileURLToPath(new URL("..", import.meta.url));
const BLOG_DIR = join(ROOT, "src/content/blog");
const PUBLIC_DIR = join(ROOT, "public");

// ---------- 通用 ----------

const TEXT_EXT = /\.(md|mdx|astro|ts|js|mjs|json|css|ya?ml|txt|xml|svg)$/;

export function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      walk(p, out);
    } else {
      out.push(p);
    }
  }
  return out;
}

// 拆 frontmatter：返回 { fm, fmStartLine, body, bodyStartLine }；无 frontmatter 时 fm 为 null。
export function splitFrontmatter(text) {
  const lines = text.split("\n");
  if (lines[0]?.trim() !== "---") {
    return { fm: null, fmStartLine: 0, body: text, bodyStartLine: 1 };
  }
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === "---") {
      return {
        fm: lines.slice(1, i).join("\n"),
        fmStartLine: 2,
        body: lines.slice(i + 1).join("\n"),
        bodyStartLine: i + 2,
      };
    }
  }
  return { fm: null, fmStartLine: 0, body: text, bodyStartLine: 1 };
}

function fmField(fm, key) {
  const m = fm?.match(new RegExp(`^${key}:\\s*(.*)$`, "m"));
  return m ? m[1].trim().replace(/^["']|["']$/g, "") : null;
}

function fmTags(fm) {
  if (!fm) return [];
  const inline = fm.match(/^tags:\s*\[(.*)\]\s*$/m);
  if (inline) {
    return inline[1]
      .split(",")
      .map(t => t.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  const block = fm.match(/^tags:\s*$([\s\S]*?)(?=^\S|\s*$(?![\s\S]))/m);
  if (!block) return [];
  return [...block[1].matchAll(/^\s+-\s+(.+)$/gm)].map(m =>
    m[1].trim().replace(/^["']|["']$/g, "")
  );
}

// ---------- 1. 秘密扫描（输出脱敏） ----------

export const SECRET_PATTERNS = [
  { name: "dler.cloud 订阅域名", re: /dler\.cloud/ },
  { name: "带令牌的 /subscribe/ URL", re: /\/subscribe\/[A-Za-z0-9_-]{8,}/ },
  { name: "OpenAI 风格密钥 (sk-...)", re: /\bsk-[A-Za-z0-9]{20,}\b/ },
  { name: "AWS Access Key (AKIA...)", re: /\bAKIA[0-9A-Z]{16}\b/ },
  { name: "GitHub PAT (ghp_...)", re: /\bghp_[A-Za-z0-9]{36}\b/ },
];

// 返回 [{ file, line, pattern }]，绝不包含匹配值本身。
export function scanSecrets(dirs) {
  const hits = [];
  for (const dir of dirs) {
    if (!existsSync(dir)) continue;
    for (const file of walk(dir)) {
      if (!TEXT_EXT.test(file)) continue;
      const lines = readFileSync(file, "utf8").split("\n");
      lines.forEach((line, i) => {
        for (const { name, re } of SECRET_PATTERNS) {
          if (re.test(line)) hits.push({ file, line: i + 1, pattern: name });
        }
      });
    }
  }
  return hits;
}

// ---------- 2-6. 内容检查 ----------

export function checkDescriptions(files) {
  const errs = [];
  for (const { file, fm } of files) {
    // 质量合同只约束发布态内容；draft 不进入构建产物
    if (/^draft:\s*true/m.test(fm)) continue;
    const desc = fmField(fm, "description");
    if (desc === null || desc === "") {
      errs.push(`${file}: description 缺失或为空`);
    } else if (/^[*\-—.~\s]+$/.test(desc)) {
      errs.push(`${file}: description 为占位符 (${desc})`);
    } else if ([...desc].length < 10) {
      errs.push(`${file}: description 过短（<10 字符）: ${desc}`);
    }
  }
  return errs;
}

export function checkHeadings(files) {
  const errs = [];
  for (const { file, body, bodyStartLine } of files) {
    let inFence = false;
    let prevLevel = 1; // 布局提供唯一 H1，正文基线为 1
    body.split("\n").forEach((line, i) => {
      if (/^(```|~~~)/.test(line.trim())) {
        inFence = !inFence;
        return;
      }
      if (inFence) return;
      const m = line.match(/^(#{1,6})\s/);
      if (!m) return;
      const level = m[1].length;
      const lineNo = bodyStartLine + i;
      if (level === 1) {
        errs.push(`${file}:${lineNo}: 正文不得使用一级标题（布局已有唯一 H1）`);
      } else if (level > prevLevel + 1) {
        errs.push(
          `${file}:${lineNo}: 标题跳级 H${prevLevel} → H${level}（层级需顺序嵌套）`
        );
      }
      prevLevel = level;
    });
  }
  return errs;
}

export function checkTagCollisions(files) {
  const byLower = new Map();
  for (const { file, fm } of files) {
    for (const tag of fmTags(fm)) {
      const key = tag.toLowerCase();
      if (!byLower.has(key)) byLower.set(key, new Map());
      const forms = byLower.get(key);
      if (!forms.has(tag)) forms.set(tag, []);
      forms.get(tag).push(file);
    }
  }
  const errs = [];
  for (const [key, forms] of byLower) {
    if (forms.size > 1) {
      const detail = [...forms.entries()]
        .map(([form, fs]) => `"${form}" (${fs.length} 篇，如 ${fs[0]})`)
        .join(" vs ");
      errs.push(`标签大小写冲突 [${key}]: ${detail}`);
    }
  }
  return errs;
}

export function checkLocalAssets(files) {
  const errs = [];
  const re = /!\[[^\]]*\]\((\/[^)\s]+)\)|\[[^\]]*\]\((\/assets\/[^)\s]+)\)/g;
  for (const { file, body, bodyStartLine } of files) {
    body.split("\n").forEach((line, i) => {
      for (const m of line.matchAll(re)) {
        const raw = (m[1] || m[2]).split("#")[0].split("?")[0];
        const target = join(PUBLIC_DIR, decodeURIComponent(raw));
        if (!existsSync(target)) {
          errs.push(`${file}:${bodyStartLine + i}: 本地资源不存在: ${raw}`);
        }
      }
    });
  }
  return errs;
}

export function checkDates(files) {
  const errs = [];
  const max = Date.now() + 24 * 60 * 60 * 1000;
  for (const { file, fm } of files) {
    const raw = fmField(fm, "date");
    if (!raw) {
      errs.push(`${file}: frontmatter 缺少 date`);
      continue;
    }
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) {
      errs.push(`${file}: date 不可解析: ${raw}`);
    } else if (d.getTime() > max) {
      errs.push(`${file}: date 晚于当前日期 +1 天: ${raw}`);
    }
  }
  return errs;
}

// ---------- 主流程 ----------

function loadBlogFiles() {
  if (!existsSync(BLOG_DIR)) return [];
  return walk(BLOG_DIR)
    .filter(f => /\.(md|mdx)$/.test(f))
    .map(f => {
      const text = readFileSync(f, "utf8");
      const { fm, body, bodyStartLine } = splitFrontmatter(text);
      return { file: relative(ROOT, f), fm, body, bodyStartLine };
    });
}

export function runAll() {
  const files = loadBlogFiles();
  const secretHits = scanSecrets([join(ROOT, "src")]);
  const sections = [
    [
      "秘密扫描",
      secretHits.map(
        h => `${relative(ROOT, h.file)}:${h.line}: 命中模式「${h.pattern}」（值已脱敏）`
      ),
    ],
    ["description 质量", checkDescriptions(files)],
    ["标题层级", checkHeadings(files)],
    ["标签冲突", checkTagCollisions(files)],
    ["本地资源", checkLocalAssets(files)],
    ["日期合法性", checkDates(files)],
  ];
  return sections;
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  let failed = 0;
  for (const [title, errs] of runAll()) {
    if (errs.length === 0) {
      console.log(`✓ ${title}`);
    } else {
      failed += errs.length;
      console.error(`✗ ${title}（${errs.length} 项）`);
      for (const e of errs) console.error(`  ${e}`);
    }
  }
  if (failed > 0) {
    console.error(`\nverify 失败：共 ${failed} 项问题`);
    process.exit(1);
  }
  console.log("\nverify 通过");
}
