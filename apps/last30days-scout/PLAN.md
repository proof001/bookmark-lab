# PLAN: last30days-scout

Single-user MVP: type a topic → fetch the last ~30 days from **Hacker News, Reddit, and GitHub** → engagement-ranked board + a short judged synthesis.

Inspired by [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill). This is a **plain Approve** demo: free public search paths only. It does **not** wrap, install, or shell out to the real `/last30days` CLI, and it does **not** call Polymarket, X/Twitter, YouTube, paid APIs, or any authenticated account.

## Goal

A self-contained Bun + Vite + React + TypeScript app under `apps/last30days-scout/` that:

1. Accepts a topic string and a Search button
2. Queries HN (Algolia), Reddit (public JSON search), and GitHub (unauthenticated Search API) for roughly the last 30 days
3. Renders an engagement-ranked board: score, title/link, source badge (HN / Reddit / GitHub), and raw engagement
4. Shows a short judged synthesis (paragraph + a few cited bullets) over the top hits
5. Surfaces idle, loading, empty, partial-source, and error states
6. Documents the score formula and the GitHub unauthenticated rate limit in the UI

No API keys. No user auth.

## Locked sources (v1)

| Source | Allowed | Path |
|--------|---------|------|
| Hacker News | yes | Algolia HN Search API, stories only, `created_at_i` ≥ now − 30d |
| Reddit | yes | Public `/search.json`, `t=month`, then hard-filter `created_utc` |
| GitHub | yes | Unauthenticated Search API, repositories `created:>YYYY-MM-DD` |
| Polymarket | **no** | — |
| X / Twitter | **no** | — |
| YouTube / TikTok / paid search | **no** | — |

Proof approved this cloud-agent launch on 2026-09-11 with the HN + Reddit + GitHub-only tweak.

## Explicitly out of scope

- Polymarket, X/Twitter, YouTube, TikTok, web-search LLMs
- Paid APIs, API keys, user auth / accounts
- Wrapping or installing the real `last30days-skill` CLI
- Reciprocal-rank fusion, LLM rerank, comment enrichment
- Cloudflare Pages
- Changing other bookmark-lab apps or monorepo root tooling

## Stack

- Bun
- Vite + React + TypeScript (same official `create-vite` + shadcn layout as sibling scouts)
- shadcn/ui (Input, Button, Table, Badge, Card, Alert, Skeleton, Label)
- Vite/Bun proxy for CORS + required User-Agent headers

Run from this folder:

```bash
bun install
bun run dev
```

`bunfig.toml` must exist with `[install] minimumReleaseAge = 259200` **before** the first `bun install`.

## Outcome-oriented tasks

1. Write this `PLAN.md`, then add `bunfig.toml` before any install
2. Scaffold Vite + React + TypeScript (match sibling scout layout)
3. Init shadcn/ui (minimal primitives listed above)
4. Proxy HN Algolia, Reddit, and GitHub in `vite.config.ts`
5. Normalize hits → score → rank → synthesize
6. Wire topic input + Search + loading / empty / error / partial warnings
7. Unit-test scoring, window, parsers, and synthesis
8. Smoke-test in the browser with a topic such as `bun` or `react`; attach screenshot + video

## Engagement score (transparent)

Raw metrics are not comparable (HN points vs Reddit upvotes vs GitHub stars). We log-compress the primary metric and a secondary conversation/fork metric, same weights for every source:

```
score = 10 * log10(1 + primary) + 6 * log10(1 + secondary)
```

| Source | primary | secondary |
|--------|---------|-----------|
| HN | `points` | `num_comments` |
| Reddit | `score` (clamped ≥ 0) | `num_comments` |
| GitHub | `stargazers_count` | `forks_count` |

Board order is `score` descending, then recency. Display the rounded score plus the raw primary/secondary so the ranking stays inspectable.

This is **not** the real skill’s RRF + LLM rerank. It is a demo-sized, fully local formula.

## Source notes

- **HN** — `GET /api/v1/search?query=&tags=story&numericFilters=created_at_i>{unix}&hitsPerPage=25`. Algolia is CORS-friendly; still proxied for consistency.
- **Reddit** — browsers cannot set a User-Agent and often hit CORS. Proxy `www.reddit.com`. Prefer `search.json` (`t=month`, then hard-filter `created_utc`). Many datacenter IPs get HTML 403 on JSON; fall back to public `search.rss` (same `sort=top&t=month`) and keep only `/comments/` posts. RSS has no upvote counts — use feed position as `rss-rank` primary and note it on the row. If both paths fail, keep HN + GitHub and show a source warning.
- **GitHub** — unauthenticated Search API is **10 requests / minute / IP**. This app makes **one** repo search per topic. On HTTP 403/429, surface a clear rate-limit message and still render other sources. No token, no `GITHUB_TOKEN`.

## Judged synthesis

No model. A deterministic judge over the ranked board:

1. Take the top 8 hits (or all, if fewer)
2. Count sources and name the engagement leader
3. Pull a few distinctive title tokens (stopword-filtered) as the “cluster”
4. Emit one short paragraph plus up to three citation bullets (`Source: title — raw metric`)

If the board is empty, skip synthesis and show the empty state.

## Partial failure

Sources are fetched in parallel. One failure is a warning, not a hard error. Hard error only when the topic is invalid or every source fails.

## Implementation notes

- Everything lives under `apps/last30days-scout/` only
- Prefer official scaffold + prebuilt over bespoke
- Loading / empty / error / rate-limit states are first-class UI
- Document the score formula and GitHub 10 req/min limit in the app footer
- Do not add Polymarket or X “just in case”
