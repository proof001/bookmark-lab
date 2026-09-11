export type Severity = 'critical' | 'high' | 'medium' | 'low'

export type Rule = {
  id: string
  name: string
  severity: Severity
  category: string
  description: string
  pattern: RegExp
}

/** Curated SkillSpector-style static patterns. Local regex only — not the real CLI. */
export const RULES: readonly Rule[] = [
  {
    id: 'P1',
    name: 'Instruction override',
    severity: 'high',
    category: 'Prompt injection',
    description: 'Commands to ignore safety constraints or prior instructions.',
    pattern:
      /\b(?:ignore|disregard|forget)\s+(?:all\s+)?(?:(?:your|the|any|previous|prior|above|system)\s+)+(?:instructions?|rules?|guidelines?|safety|constraints?|prompts?)\b|\boverride\s+(?:the\s+)?(?:system|safety)\b/gi,
  },
  {
    id: 'P2',
    name: 'Hidden instructions',
    severity: 'high',
    category: 'Prompt injection',
    description: 'Directives hidden in HTML comments or zero-width characters.',
    pattern:
      /<!--[\s\S]{0,240}?(?:ignore|secret|hidden\s+instruction|do\s+not\s+tell)[\s\S]{0,240}?-->|(?:\u200B|\u200C|\u200D|\u2060|\uFEFF){3,}/g,
  },
  {
    id: 'AR1',
    name: 'Refusal suppression',
    severity: 'high',
    category: 'Anti-refusal',
    description: 'Instructions to never refuse or always comply.',
    pattern:
      /\b(?:never\s+refuse|always\s+comply|you\s+must\s+always\s+(?:obey|comply|agree)|do\s+not\s+refuse)\b/gi,
  },
  {
    id: 'AR3',
    name: 'Safety policy nullification',
    severity: 'high',
    category: 'Anti-refusal',
    description: 'Jailbreak framing that nullifies guardrails.',
    pattern:
      /\b(?:you\s+have\s+no\s+restrictions?|ignore\s+your\s+(?:guidelines?|guardrails?|safety)|do\s+anything\s+now|\bDAN\s+mode\b|jailbreak)\b/gi,
  },
  {
    id: 'E1',
    name: 'External transmission',
    severity: 'medium',
    category: 'Data exfiltration',
    description: 'Sending data to an external URL, webhook, or pastebin.',
    pattern:
      /\b(?:curl|wget|fetch|axios|http(?:s)?:\/\/)\b[^ \n]{0,160}|(?:webhook\.site|requestbin|discord(?:app)?\.com\/api\/webhooks|hooks\.slack\.com|api\.telegram\.org\/bot|pastebin\.com)/gi,
  },
  {
    id: 'E2',
    name: 'Environment harvest',
    severity: 'high',
    category: 'Data exfiltration',
    description: 'Enumerating or copying environment variables to collect secrets.',
    pattern:
      /\b(?:printenv|env\s*\|(?:\s*grep)?|process\.env|os\.environ|Get-ChildItem\s+Env:|dump\s+(?:the\s+)?(?:env(?:ironment)?\s+)?(?:vars?|variables|secrets))\b/gi,
  },
  {
    id: 'E4',
    name: 'Context leakage',
    severity: 'high',
    category: 'Data exfiltration',
    description: 'Instructions to transmit conversation context or chat history.',
    pattern:
      /\b(?:exfiltrat\w*|send|post|upload|forward)\b[^.\n]{0,80}\b(?:conversation|chat\s+history|full\s+context|system\s+prompt|user\s+(?:messages?|data)|secrets?)\b/gi,
  },
  {
    id: 'PE2',
    name: 'Sudo / root execution',
    severity: 'medium',
    category: 'Privilege escalation',
    description: 'Invoking elevated system privileges.',
    pattern: /\b(?:sudo\s+(?:-i|-s|su\b)|sudo\s+\w+|chmod\s+777|pkexec)\b/gi,
  },
  {
    id: 'PE3',
    name: 'Credential access',
    severity: 'high',
    category: 'Privilege escalation',
    description: 'Reading SSH keys, cloud credentials, or password files.',
    pattern:
      /(?:~\/|\.\/)?(?:\.ssh\/(?:id_rsa|id_ed25519|authorized_keys)|\.aws\/credentials|\.gnupg\/|\/etc\/(?:passwd|shadow|sudoers))/gi,
  },
  {
    id: 'SC1',
    name: 'Unpinned dependency install',
    severity: 'low',
    category: 'Supply chain',
    description: 'Package install without a pinned version.',
    pattern:
      /\b(?:npm\s+i(?:nstall)?|pnpm\s+add|yarn\s+add|pip(?:3)?\s+install|pipx\s+install)\s+[a-zA-Z0-9_.\-/@]+(?!\s*[@=]\s*\d)/gi,
  },
  {
    id: 'SC2',
    name: 'Remote script pipe',
    severity: 'critical',
    category: 'Supply chain',
    description: 'curl/wget piped to a shell — remote code execution smell.',
    pattern:
      /\b(?:curl|wget)\b[^\n|]{0,200}\|\s*(?:ba)?sh\b|\b(?:iwr|Invoke-WebRequest)\b[^\n|]{0,200}\|\s*iex\b/gi,
  },
  {
    id: 'SC3',
    name: 'Obfuscated decode-exec',
    severity: 'high',
    category: 'Supply chain',
    description: 'Base64/hex decode followed by eval or execution.',
    pattern:
      /\b(?:base64\s+-d|base64\s+--decode|atob\s*\(|Buffer\.from\([^)]*base64|eval\s*\(|exec\s*\(|new\s+Function\s*\()/gi,
  },
  {
    id: 'EA1',
    name: 'Unrestricted tool access',
    severity: 'high',
    category: 'Excessive agency',
    description: 'Wildcard or unconstrained tool / network grants.',
    pattern:
      /(?:allowed[-_\s]?tools|allowed[-_\s]?domains|permissions)\s*[:=]\s*[[("']?\s*\*|Bash\s*\(\s*unrestricted|network\s*[:=]\s*["']?(?:unrestricted|\*)/gi,
  },
  {
    id: 'TM1',
    name: 'Dangerous tool parameters',
    severity: 'high',
    category: 'Tool misuse',
    description: 'Destructive or unsandboxed tool parameters.',
    pattern:
      /\bshell\s*=\s*True\b|\brm\s+-rf\s+[/~]|\b--no-sandbox\b|\b--force\b.{0,40}\b(?:delete|destroy|drop)\b/gi,
  },
  {
    id: 'SEC1',
    name: 'Secret-looking string',
    severity: 'high',
    category: 'Secrets',
    description: 'API keys, tokens, or PEM material that look like live secrets.',
    pattern:
      /\b(?:AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}|sk-(?:ant-|proj-)?[A-Za-z0-9_-]{20,}|-----BEGIN (?:RSA |OPENSSH |EC )?PRIVATE KEY-----)/g,
  },
  {
    id: 'NET1',
    name: 'Unrestricted network hint',
    severity: 'medium',
    category: 'Network / files',
    description: 'Skill asks for outbound network with no host allowlist.',
    pattern:
      /\b(?:allow(?:ed)?[-_\s]?network|outbound\s+https?|fetch\s+any\s+url|unrestricted\s+network|network:\s*true)\b/gi,
  },
  {
    id: 'FILE1',
    name: 'Sensitive file tool hint',
    severity: 'medium',
    category: 'Network / files',
    description: 'Hints to read or write sensitive local paths via tools.',
    pattern:
      /\b(?:read|write|cat|open|upload)\b[^.\n]{0,60}(?:\/etc\/|~\/\.(?:ssh|aws|gnupg)|\$HOME\/\.ssh)/gi,
  },
]

export const SEVERITY_WEIGHT: Record<Severity, number> = {
  critical: 40,
  high: 18,
  medium: 8,
  low: 3,
}

export const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
}

export const MAX_SKILL_CHARS = 200_000
export const MAX_FINDINGS_PER_RULE = 8
export const SNIPPET_RADIUS = 48
