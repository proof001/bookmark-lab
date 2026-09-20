import { SourceError, type Hit } from '../hits'
import { engagementScore } from '../score'
import { isWithinWindow, unixSeconds } from '../window'

type AlgoliaHit = {
  objectID?: unknown
  title?: unknown
  story_title?: unknown
  url?: unknown
  author?: unknown
  points?: unknown
  num_comments?: unknown
  created_at_i?: unknown
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

export function parseHnHits(payload: unknown, since: Date, now = new Date()): Hit[] {
  if (!payload || typeof payload !== 'object' || !('hits' in payload)) return []
  const rawHits = (payload as { hits: unknown }).hits
  if (!Array.isArray(rawHits)) return []

  const hits: Hit[] = []
  for (const raw of rawHits) {
    if (!raw || typeof raw !== 'object') continue
    const row = raw as AlgoliaHit
    const objectId = asString(row.objectID)
    const title = asString(row.title) || asString(row.story_title)
    if (!objectId || !title) continue

    const createdAt = new Date(asNumber(row.created_at_i) * 1000)
    if (!isWithinWindow(createdAt, since, now)) continue

    const permalink = `https://news.ycombinator.com/item?id=${encodeURIComponent(objectId)}`
    const url = asString(row.url) || permalink
    const primary = asNumber(row.points)
    const secondary = asNumber(row.num_comments)
    const author = asString(row.author)

    hits.push({
      id: `hn:${objectId}`,
      source: 'hn',
      title,
      url,
      createdAt,
      primary,
      primaryLabel: primary === 1 ? 'point' : 'points',
      secondary,
      secondaryLabel: secondary === 1 ? 'comment' : 'comments',
      subtitle: author ? `by ${author}` : 'Hacker News',
      score: engagementScore(primary, secondary),
    })
  }
  return hits
}

export async function fetchHnHits(
  topic: string,
  since: Date,
  signal?: AbortSignal,
): Promise<Hit[]> {
  const params = new URLSearchParams({
    query: topic,
    tags: 'story',
    hitsPerPage: '25',
    numericFilters: `created_at_i>${unixSeconds(since)}`,
  })
  const response = await fetch(`/api/hn/api/v1/search?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) {
    throw new SourceError(
      'hn',
      `Hacker News returned ${response.status}. Try again in a moment.`,
      response.status,
    )
  }
  return parseHnHits(await response.json(), since)
}
