# Last 30 Days Scout

Single-user MVP: type a topic → last ~30 days from **Hacker News, Reddit, and GitHub only** → engagement-ranked board + a short judged synthesis.

Inspired by [mvanhorn/last30days-skill](https://github.com/mvanhorn/last30days-skill). This demo does **not** wrap the real CLI and does **not** call Polymarket, X/Twitter, or paid APIs.

```bash
bun install
bun run dev
```

Local `bun run dev` uses the Vite proxy. On Vercel, `vercel.json` rewrites `/api/hn` to Algolia, and thin `api/` serverless functions proxy `/api/reddit` and `/api/github` with the same User-Agent / GitHub headers (plain rewrites cannot set those outbound headers).

See `PLAN.md` for scope, the score formula, and the GitHub unauthenticated Search API limit (10 req/min).
