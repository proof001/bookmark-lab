# OpenShorts Scout

Lean **UX demo** for [OpenShorts](https://github.com/mutonby/openshorts) — open-source AI clip generator (long video → viral 9:16 shorts). This app uses **mock data only** and does not run the real Python/Docker/GPU pipeline.

| This scout | Full OpenShorts upstream |
|------------|-------------------------|
| Browser-only mock job + sample moments | FFmpeg, Whisper, face tracking, rendering |
| Static 9:16 phone preview (CSS) | Real stacked-speaker video output |
| No uploads or API keys | Self-host with Docker; optional cloud providers |

```bash
bun install
bun run dev
```

Build for a static preview:

```bash
bun run build
bun run preview
```

See `PLAN.md` for scope. Product site: [openshorts.app](https://www.openshorts.app/).

**Demo only — no real rendering.** Self-host upstream with Docker for the full pipeline.
