# PLAN: crt-name-scout

Single-user MVP: paste an apex domain, query crt.name’s passive Certificate Transparency subdomain index, show a filterable/sortable list with copy/export.

## Goal

A self-contained Bun + Vite + React + TypeScript app under `apps/crt-name-scout/` that:

1. Accepts an apex domain (normalized: strip scheme/path, lowercase)
2. Queries `GET https://crt.name/v1/search?apex=<domain>&dates=1` via a same-origin proxy (browsers will hit CORS if called directly)
3. Parses the **plain text** response — one host per line: `hostname ISO8601` or `hostname unknown`
4. Renders a table (hostname + first-seen date) with client filter, sort, copy, and export
5. Surfaces loading, empty, and error states
6. Notes that results are passive index records (may not resolve)

No API key is required (~1000 free req/IP/day).

## Explicitly out of scope

- Auth, accounts, history persistence
- DNS probing, crt.sh merge
- Rate-limit accounts
- Cloudflare Pages
- Monorepo root tooling

## Stack

- Bun
- Vite + React + TypeScript (official `create-vite` scaffold)
- shadcn/ui (minimalist: Input, Button, Table, plus loading/empty primitives)
- Vite/Bun proxy for CORS

Run from this folder:

```bash
bun install
bun run dev
```

## Outcome-oriented tasks

1. Scaffold Vite + React + TypeScript via `bunx create-vite` (skip install if possible)
2. Add `bunfig.toml` with `[install] minimumReleaseAge = 259200` **before** `bun install`
3. Init shadcn/ui (minimalist); add only Input, Button, Table, and whatever is needed for loading/empty
4. Proxy crt.name server-side (Vite proxy or tiny Bun handler)
5. Parse plaintext lines → `{ hostname, firstSeen: Date | null }`
6. Wire search UI + filter + sort + copy/export
7. Smoke-test with `example.com` (large list) and a smaller apex; attach screenshot + video

## Implementation notes

- Everything lives under `apps/crt-name-scout/` only
- Prefer official scaffold + prebuilt over bespoke
- Normalize apex input (strip scheme/path, lowercase)
- Response is **not JSON** — do not `response.json()`
- `firstSeen` is `Date` when the second token is ISO8601, otherwise `null` (`unknown`)
- Copy: one host, all filtered hosts
- Export filtered results as CSV or TXT
- Loading / empty / error states are first-class UI, not afterthoughts
