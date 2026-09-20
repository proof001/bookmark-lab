# Agent operating rules

Rules for Cursor cloud agents working in this repository. Read this file before planning or building a demo.

## Scope and repositories

- This repo is the only playground. **Do not create a new GitHub repository.**
- For a given demo, only add or update files under `apps/<kebab-slug>/`.
- Do not touch other apps. Do not move, rename, or delete another demo's directory.

## Runtime

- Runtime, package manager, and script runner is **Bun**.
- Each app is self-contained. From that app directory: `bun install && bun run dev`.
- Every new Bun app must include a `bunfig.toml` with:

  ```toml
  [install]
  minimumReleaseAge = 259200
  ```

  Create or preserve that file **before** `bun install` or `bun add`. Prefer scaffold flags that skip the initial install, then run `bun install`.

## Plan first

- Before writing app code, follow `skills/project-planning/SKILL.md`.
- Write the plan to `apps/<slug>/PLAN.md`.
- Later cloud agents implement from that plan on a PR. This scaffold PR does not include demo apps.

## Stack defaults

- Start from an official scaffold via `bunx create-*` (`create-next-app`, `create-vite`, `create-t3-app`, `create-tanstack`, `create-expo`).
- One opinionated framework per app. Do not mix framework-grade stacks in a single demo.
- UI default: **shadcn/ui** (`bunx shadcn@latest init`, minimalist preset, add components on demand).

## Evidence on every app PR

Every PR that adds or updates an app **must** attach **both**:

1. At least one screenshot of the running app
2. At least one video of the running app

This is not optional. A PR without both is incomplete.

## Model for demo builds

Use **claude-fable-5** (Fable 5) for future demo builds. Do not default to Composer.

## Cloudflare preview (later — do not configure now)

A single Cloudflare Pages project will later cover the whole repo, with one preview path per `apps/<slug>/`. Do **not** create one Pages project per app.

When that is set up, the repo will need GitHub secrets:

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

Do not add CI, Cloudflare config, or secrets in a planning-only or scaffold change.
