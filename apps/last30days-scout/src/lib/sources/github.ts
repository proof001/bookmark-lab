import { SourceError, type Hit } from '../hits'
import { engagementScore } from '../score'
import { isoDate, isWithinWindow } from '../window'

type GithubRepo = {
  id?: unknown
  full_name?: unknown
  html_url?: unknown
  description?: unknown
  stargazers_count?: unknown
  forks_count?: unknown
  created_at?: unknown
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function parseGithubHits(payload: unknown, since: Date, now = new Date()): Hit[] {
  if (!payload || typeof payload !== 'object' || !('items' in payload)) return []
  const items = (payload as { items: unknown }).items
  if (!Array.isArray(items)) return []

  const hits: Hit[] = []
  for (const raw of items) {
    if (!raw || typeof raw !== 'object') continue
    const row = raw as GithubRepo
    const fullName = asString(row.full_name)
    const url = asString(row.html_url)
    if (!fullName || !url) continue

    const createdAt = new Date(asString(row.created_at))
    if (Number.isNaN(createdAt.getTime()) || !isWithinWindow(createdAt, since, now)) {
      continue
    }

    const description = asString(row.description).trim()
    const title = description ? `${fullName} — ${description}` : fullName
    const primary = asNumber(row.stargazers_count)
    const secondary = asNumber(row.forks_count)

    hits.push({
      id: `github:${row.id == null ? fullName : String(row.id)}`,
      source: 'github',
      title,
      url,
      createdAt,
      primary,
      primaryLabel: primary === 1 ? 'star' : 'stars',
      secondary,
      secondaryLabel: secondary === 1 ? 'fork' : 'forks',
      subtitle: fullName,
      score: engagementScore(primary, secondary),
    })
  }
  return hits
}

function githubFailureMessage(status: number): string {
  if (status === 403 || status === 429) {
    return 'GitHub unauthenticated Search API allows 10 requests per minute per IP. Wait a minute and try again — HN and Reddit may still be listed.'
  }
  return `GitHub returned ${status}. Unauthenticated search is rate-limited (10 req/min).`
}

export async function fetchGithubHits(
  topic: string,
  since: Date,
  signal?: AbortSignal,
): Promise<Hit[]> {
  const params = new URLSearchParams({
    q: `${topic} created:>${isoDate(since)}`,
    sort: 'stars',
    order: 'desc',
    per_page: '20',
  })
  const response = await fetch(`/api/github/search/repositories?${params}`, {
    signal,
    headers: { Accept: 'application/vnd.github+json' },
  })
  if (!response.ok) {
    throw new SourceError('github', githubFailureMessage(response.status), response.status)
  }
  return parseGithubHits(await response.json(), since)
}
