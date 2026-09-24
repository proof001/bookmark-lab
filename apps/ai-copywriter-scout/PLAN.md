# PLAN: ai-copywriter-scout

Single-user lean demo: paste draft copy → pick a rewrite mode → see transformed output in the browser.

Inspired by [mikiarlo3/ai-copywriter](https://github.com/mikiarlo3/ai-copywriter) (humanizer / blader lineage). This is a **Proof Approve 2026-09-24** playground: **local mock transforms only**. It does **not** ship the upstream 33-pattern skill pack or call a production copy API.

Pairs conceptually with **openshorts-scout** (clip moments → captions/scripts); this app stays copy-focused.

## Goal

A self-contained Bun + Vite + React + TypeScript app under `apps/ai-copywriter-scout/` that:

1. Accepts pasted draft text (or loads short-form caption presets)
2. Offers mode chips: **Humanize**, **Caption**, **Hook**, **Script beat**
3. Runs deterministic local string transforms (no network required)
4. Shows output in a copy-friendly panel with idle / empty / error states
5. Links to upstream GitHub and states “lean demo — not production copy API”

Optional later: OpenAI-compatible endpoint behind a clearly labeled local-only setting (not required for this MVP).

## Explicitly out of scope

- Full upstream ai-copywriter parity or skill install
- Paid API keys required to run the demo
- Auth, persistence, Vercel deploy in this PR
- openshorts-scout, Mimik, Clip Bot

## Stack

- Bun
- Vite + React + TypeScript
- shadcn/ui (Textarea, Button, Badge, Card, Alert)

```bash
bun install
bun run dev
```

## UI sketch

- Header: title, badge “local mock transforms”, upstream link
- Input card: textarea + preset chips
- Mode row: Humanize | Caption | Hook | Script beat
- Output card: monospace-friendly result + Copy button
- Footer note: lean demo disclaimer
