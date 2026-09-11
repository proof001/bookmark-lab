import {
  MAX_FINDINGS_PER_RULE,
  MAX_SKILL_CHARS,
  RULES,
  SEVERITY_ORDER,
  SEVERITY_WEIGHT,
  SNIPPET_RADIUS,
  type Rule,
  type Severity,
} from '@/lib/rules'

export type Finding = {
  id: string
  ruleId: string
  name: string
  severity: Severity
  category: string
  snippet: string
  index: number
}

export type RiskLabel = 'clean' | 'low' | 'medium' | 'high' | 'critical'

export type ScanResult = {
  findings: Finding[]
  score: number
  label: RiskLabel
  scannedChars: number
  ruleHits: number
}

export class ScanError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScanError'
  }
}

export function snippetAround(source: string, index: number, length: number): string {
  const start = Math.max(0, index - SNIPPET_RADIUS)
  const end = Math.min(source.length, index + length + SNIPPET_RADIUS)
  let snippet = source.slice(start, end).replace(/\s+/g, ' ').trim()
  if (start > 0) snippet = `…${snippet}`
  if (end < source.length) snippet = `${snippet}…`
  if (snippet.length > 140) snippet = `${snippet.slice(0, 137)}…`
  return snippet
}

function compile(rule: Rule): RegExp {
  return new RegExp(rule.pattern.source, rule.pattern.flags)
}

export function collectFindings(source: string): Finding[] {
  const findings: Finding[] = []

  for (const rule of RULES) {
    const pattern = compile(rule)
    let hits = 0
    for (const match of source.matchAll(pattern)) {
      if (hits >= MAX_FINDINGS_PER_RULE) break
      const text = match[0]
      if (!text) continue
      const index = match.index ?? 0
      findings.push({
        id: `${rule.id}-${index}`,
        ruleId: rule.id,
        name: rule.name,
        severity: rule.severity,
        category: rule.category,
        snippet: snippetAround(source, index, text.length),
        index,
      })
      hits += 1
    }
  }

  findings.sort((a, b) => {
    const severity = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
    if (severity !== 0) return severity
    return a.index - b.index
  })

  return findings
}

export function scoreFindings(findings: Finding[]): { score: number; label: RiskLabel } {
  // First hit of a rule is full weight; extra hits of the same rule add 2.
  const seen = new Set<string>()
  let score = 0
  for (const finding of findings) {
    if (seen.has(finding.ruleId)) {
      score += 2
    } else {
      score += SEVERITY_WEIGHT[finding.severity]
      seen.add(finding.ruleId)
    }
  }

  score = Math.min(100, score)

  let label: RiskLabel = 'clean'
  if (score >= 75) label = 'critical'
  else if (score >= 50) label = 'high'
  else if (score >= 25) label = 'medium'
  else if (score > 0) label = 'low'

  return { score, label }
}

export function scanSkill(raw: string): ScanResult {
  if (raw.length > MAX_SKILL_CHARS) {
    throw new ScanError(
      `Skill is ${raw.length.toLocaleString()} characters. Paste at most ${MAX_SKILL_CHARS.toLocaleString()}.`,
    )
  }

  const source = raw.split(String.fromCharCode(0)).join('')
  if (source.trim().length === 0) {
    throw new ScanError('Paste a SKILL.md (or load a sample) before scanning.')
  }

  const findings = collectFindings(source)
  const { score, label } = scoreFindings(findings)
  const ruleHits = new Set(findings.map((finding) => finding.ruleId)).size

  return {
    findings,
    score,
    label,
    scannedChars: source.length,
    ruleHits,
  }
}
