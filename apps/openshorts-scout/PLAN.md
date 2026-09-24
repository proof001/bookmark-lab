# PLAN: openshorts-scout

Single-user MVP: paste a long-form URL → mock job progress → ranked viral moments + 9:16 phone preview.

Inspired by [OpenShorts](https://github.com/mutonby/openshorts) / [openshorts.app](https://www.openshorts.app/). **Lean scout only** — no Python backend, Docker, FFmpeg, Whisper, YOLO, or cloud APIs.

## Goal

Self-contained Bun + Vite + React + TypeScript under `apps/openshorts-scout/` that:

1. Header with product name + GitHub + homepage links
2. Tabs: Clip Generator (full mock), AI Shorts + YouTube Studio (shells)
3. Clip flow: URL input → generate → step progress → 3–5 mock moments (title, duration, score, reason)
4. Phone-frame preview: stacked speakers, seam caption, hook overlay (CSS only)
5. Clear demo disclaimer

## Out of scope

- Real ingest, render, upload, publish, MCP
- Monorepo root tooling changes beyond `tracking/seen-bookmarks.json`

## Stack

- Bun, Vite, React, TypeScript (same pattern as sibling scouts)
- shadcn/ui minimal (Button, Card, Input, Badge, Alert, Skeleton)

```bash
bun install
bun run dev
```

## Tasks

1. Scaffold from sibling scout template + `bunfig.toml`
2. Fixtures for mock moments + job steps
3. `PhonePreview` component
4. `App.tsx` tabs + clip generator UX
5. README + tracking entry
6. Screenshot + video on PR
