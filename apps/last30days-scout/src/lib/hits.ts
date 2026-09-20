import { roundScore } from './score'

export const SOURCE_IDS = ['hn', 'reddit', 'github'] as const

export type SourceId = (typeof SOURCE_IDS)[number]

export const SOURCE_LABEL: Record<SourceId, string> = {
  hn: 'HN',
  reddit: 'Reddit',
  github: 'GitHub',
}

export type Hit = {
  id: string
  source: SourceId
  title: string
  url: string
  createdAt: Date
  primary: number
  primaryLabel: string
  secondary: number
  secondaryLabel: string
  subtitle: string
  score: number
}

export type SourceWarning = {
  source: SourceId
  message: string
}

export class SourceError extends Error {
  readonly source: SourceId
  readonly status?: number

  constructor(source: SourceId, message: string, status?: number) {
    super(message)
    this.name = 'SourceError'
    this.source = source
    this.status = status
  }
}

export function formatMetric(value: number, label: string): string {
  return `${value.toLocaleString()} ${label}`
}

export function formatEngagement(hit: Hit): string {
  return `${formatMetric(hit.primary, hit.primaryLabel)}, ${formatMetric(hit.secondary, hit.secondaryLabel)}`
}

export function rankHits(hits: Hit[]): Hit[] {
  return [...hits].sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    return b.createdAt.getTime() - a.createdAt.getTime()
  })
}

export function dedupeHits(hits: Hit[]): Hit[] {
  const seen = new Set<string>()
  const out: Hit[] = []
  for (const hit of hits) {
    const key = hit.url.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push({ ...hit, score: roundScore(hit.score) })
  }
  return out
}

export function countBySource(hits: Hit[]): Record<SourceId, number> {
  const counts: Record<SourceId, number> = { hn: 0, reddit: 0, github: 0 }
  for (const hit of hits) counts[hit.source] += 1
  return counts
}
