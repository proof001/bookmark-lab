# CRT Name Scout

Single-user MVP that queries [crt.name](https://crt.name)’s passive Certificate Transparency subdomain index.

```bash
bun install
bun run dev
```

Paste an apex (`example.com`, `https://NeverSSL.com/path`). Results are proxied through Vite to avoid browser CORS, then filtered, sorted, copied, or exported as CSV/TXT.

See `PLAN.md` for scope.
