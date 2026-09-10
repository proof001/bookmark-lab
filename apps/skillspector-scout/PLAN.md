# PLAN: skillspector-scout

Single-user MVP: paste a `SKILL.md` (or load a sample skill) → static pattern scan → risk score + findings list.

Inspired by [NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector). This is a **plain Approve** demo: local regex/string rules only. It does **not** wrap, install, or shell out to the real `skillspector` CLI, and it does **not** call NVIDIA cloud APIs.

## Goal

A self-contained Bun + Vite + React + TypeScript app under `apps/skillspector-scout/` that:

1. Accepts pasted `SKILL.md` markdown (frontmatter + instructions)
2. Offers built-in sample skills (risky fixtures + one mostly-clean)
3. Runs a curated subset of SkillSpector-style **local** static checks
4. Renders an overall risk score (0–100) plus a findings table (severity, rule id/name, matched snippet)
5. Surfaces idle, loading, empty, and error states
6. Lists the implemented rules in the UI so they stay transparent

No network calls are required for a scan. All matching happens in the browser.

## Explicitly out of scope

- Auth, accounts, history persistence
- NVIDIA cloud APIs / hosted SkillSpector
- Wrapping or installing the real `skillspector` CLI
- Full SkillSpector parity (71 patterns, AST, YARA, OSV.dev, LLM semantic stage)
- Cloudflare Pages
- Monorepo root tooling

## Stack

- Bun
- Vite + React + TypeScript (official `create-vite` scaffold)
- shadcn/ui (minimal: Textarea, Button, Table, Badge, plus loading/empty primitives)

Run from this folder:

```bash
bun install
bun run dev
```

## Outcome-oriented tasks

1. Scaffold Vite + React + TypeScript via `bunx create-vite` (skip install if possible)
2. Add `bunfig.toml` with `[install] minimumReleaseAge = 259200` **before** `bun install`
3. Init shadcn/ui (minimal); add Textarea, Button, Table, Badge, and whatever is needed for loading/empty
4. Implement a local rule engine (regex/string patterns) with clear severities
5. Wire UI: paste / load sample → scan → score + findings
6. Include 1–2 sample `SKILL.md` fixtures that trigger findings and one mostly-clean sample
7. Smoke-test in the browser; attach screenshot + video

## Implementation notes

- Everything lives under `apps/skillspector-scout/` only
- Prefer official scaffold + prebuilt over bespoke
- Rules are a **curated subset** inspired by SkillSpector categories, not a clone:
  - Prompt injection / instruction override / anti-refusal
  - Exfil patterns (external POST, webhooks, env harvest)
  - Supply-chain smells (`curl | bash`, unpinned install, obfuscated decode)
  - Dangerous tool calls (sudo, `shell=True`, unrestricted Bash)
  - Secret-looking strings (API keys, PEM, AWS-style IDs)
  - Unrestricted network / file tool hints (`~/.ssh`, `/etc/passwd`, `allowed-domains: ["*"]`)
- Score is a transparent weighted sum of finding severities, capped at 100
- Loading / empty / error states are first-class UI, not afterthoughts
- Document every rule in the app UI (and a short in-folder README)
