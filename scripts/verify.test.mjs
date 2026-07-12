#!/usr/bin/env node
// 秘密扫描 fixture 自检（openspec 任务 2.6）：
// 断言高置信度伪造秘密会被命中，且脱敏输出不包含原值。
import { strict as assert } from "node:assert";
import { mkdtempSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { scanSecrets } from "./verify.mjs";

const dir = mkdtempSync(join(tmpdir(), "verify-fixture-"));
try {
  // 伪造值，非真实凭据
  const fakeToken = "C7FAKEFAKEo3h1s1hH";
  const fixture = [
    `订阅链接 https://dler.cloud/subscribe/${fakeToken}?mu=ssr`,
    "api key: sk-abcdefghijklmnopqrstuvwx",
    "aws: AKIAABCDEFGHIJKLMNOP",
  ].join("\n");
  writeFileSync(join(dir, "leak.md"), fixture);

  const hits = scanSecrets([dir]);

  // 至少命中 dler.cloud、/subscribe/、sk-、AKIA 四类
  const patterns = new Set(hits.map(h => h.pattern));
  assert.ok(patterns.size >= 4, `期望命中 ≥4 类模式，实际 ${patterns.size}`);
  assert.ok(hits.every(h => h.line >= 1), "命中必须带行号");

  // 脱敏：结构化结果与格式化输出都不得包含秘密原值
  const rendered = hits
    .map(h => `${h.file}:${h.line}: 命中模式「${h.pattern}」（值已脱敏）`)
    .join("\n");
  assert.ok(!rendered.includes(fakeToken), "输出不得回显订阅令牌");
  assert.ok(!rendered.includes("sk-abcdefghijklmnopqrstuvwx"), "输出不得回显 key");
  for (const h of hits) {
    assert.ok(!JSON.stringify(h).includes(fakeToken), "结构化结果不得含原值");
  }

  console.log(`✓ verify.test 通过（${hits.length} 次命中，输出已脱敏）`);
} finally {
  rmSync(dir, { recursive: true, force: true });
}
