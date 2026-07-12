---
title: "CleanCut"
description: "AI 驱动的语音净化流水线，识别口头语并输出更干净的音视频与字幕。"
category: "ai"
order: 30
featured: 4
repoURL: "https://github.com/huaruic/cleancut"
---

CleanCut 面向播客、口播和视频后期：先识别语音中的填充词与不必要停顿，再生成更干净的媒体文件和字幕，减少机械的手工剪辑。

## 工作流

- 使用 Whisper 完成语音识别与时间轴对齐。
- 通过 LLM 判断需要清理的口头语片段。
- 使用 FFmpeg 处理音视频，并由 FastAPI 串联整条流水线。

## 技术

Python、FastAPI、Whisper、FFmpeg，以及 OpenAI-compatible LLM API。
