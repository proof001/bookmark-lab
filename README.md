# bookmark-lab

Public-tech playground: one self-contained Bun app per demo under `apps/<kebab-slug>/`. Ideas are planned in-repo, then built by later Cursor cloud agents on pull requests.

## Layout

| Path | Role |
| --- | --- |
| `AGENTS.md` | Operating rules for cloud agents working in this repo |
| `apps/<kebab-slug>/` | One demo per directory; empty until the first demo lands |
| `skills/project-planning/SKILL.md` | Plan-first skill; write `apps/<slug>/PLAN.md` before building |
| `tracking/seen-bookmarks.json` | Bookmark pipeline state (`proposed`, `skipped`, `built`) |

## How a new demo lands

1. **Plan** — follow `skills/project-planning/SKILL.md` and write `apps/<slug>/PLAN.md`.
2. **Build** — implement only under that `apps/<slug>/` directory. Runtime is Bun (`bun install && bun run dev` from the app).
3. **PR** — open a pull request for that app. Attach **both** at least one screenshot **and** at least one video of the running app.

Do not create a new GitHub repository for a demo. Stay in this repo.

See `AGENTS.md` for runtime, scaffold, UI, evidence, and future Cloudflare preview rules.
