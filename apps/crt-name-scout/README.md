# CRT Name Scout

Single-user MVP that queries [crt.name](https://crt.name)’s passive Certificate Transparency subdomain index.

```bash
bun install
bun run dev
```

Paste an apex (`example.com`, `https://NeverSSL.com/path`). The client calls `/api/crt/...` (not crt.name directly). Locally that is the Vite `server.proxy`; on Vercel, `vercel.json` rewrites `/api/crt/:path*` to `https://crt.name/:path*` and keeps the query string. Results are then filtered, sorted, copied, or exported as CSV/TXT.

See `PLAN.md` for scope.
