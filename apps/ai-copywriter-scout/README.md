# AI Copywriter Scout

Lean bookmark-lab demo inspired by [ai-copywriter](https://github.com/mikiarlo3/ai-copywriter) (~1.1k★). Paste draft copy, pick a mode (Humanize, Caption, Hook, Script beat), and get **browser-only mock rewrites** — not the upstream 33-pattern skill pack and **not** a production copy API.

**Proof Approve 2026-09-24** (Peasant Master / Recon). Pairs with the openshorts-scout lane (clips → captions); this app is copy-only.

## Run locally

```bash
cd apps/ai-copywriter-scout
bun install
bun run dev
```

Open the URL Vite prints (default `http://localhost:5173`).

## Lean vs full upstream

| | This scout | [mikiarlo3/ai-copywriter](https://github.com/mikiarlo3/ai-copywriter) |
|---|---|---|
| Transforms | Deterministic local heuristics | Rich pattern library + agent workflows |
| API | None required | May use LLM providers in real use |
| Goal | Feel the UX in bookmark-lab | Production-oriented copy tooling |

See `PLAN.md` for scope.
