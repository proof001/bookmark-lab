# SkillSpector Scout

Single-user MVP: paste a `SKILL.md` (or load a sample) → local static pattern scan → risk score + findings.

Inspired by [NVIDIA SkillSpector](https://github.com/NVIDIA/SkillSpector). This app is a **plain demo**: regex/string rules in the browser only. It does **not** wrap the real `skillspector` CLI and does **not** call NVIDIA APIs.

```bash
bun install
bun run dev
```

See `PLAN.md` for scope.

## Local rules

| ID | Name | Severity | Category |
|----|------|----------|----------|
| P1 | Instruction override | high | Prompt injection |
| P2 | Hidden instructions | high | Prompt injection |
| AR1 | Refusal suppression | high | Anti-refusal |
| AR3 | Safety policy nullification | high | Anti-refusal |
| E1 | External transmission | medium | Data exfiltration |
| E2 | Environment harvest | high | Data exfiltration |
| E4 | Context leakage | high | Data exfiltration |
| PE2 | Sudo / root execution | medium | Privilege escalation |
| PE3 | Credential access | high | Privilege escalation |
| SC1 | Unpinned dependency install | low | Supply chain |
| SC2 | Remote script pipe | critical | Supply chain |
| SC3 | Obfuscated decode-exec | high | Supply chain |
| EA1 | Unrestricted tool access | high | Excessive agency |
| TM1 | Dangerous tool parameters | high | Tool misuse |
| SEC1 | Secret-looking string | high | Secrets |
| NET1 | Unrestricted network hint | medium | Network / files |
| FILE1 | Sensitive file tool hint | medium | Network / files |

Score is a weighted sum of unique rule hits (extra hits of the same rule add 2), capped at 100.

## Samples

- **Risky: exfil + injection** — prompt injection, webhook, env harvest, fake secrets
- **Risky: supply chain** — `curl \| bash`, unpinned installs, sudo, dangerous flags
- **Mostly clean: meeting notes** — straightforward note-taking skill
