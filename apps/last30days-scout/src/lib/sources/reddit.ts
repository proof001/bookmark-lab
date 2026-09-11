import { SourceError, type Hit } from '../hits'
import { engagementScore } from '../score'
import { isWithinWindow } from '../window'

type RedditChild = {
  kind?: unknown
  data?: {
    id?: unknown
    title?: unknown
    url?: unknown
    permalink?: unknown
    score?: unknown
    num_comments?: unknown
    created_utc?: unknown
    subreddit?: unknown
    over_18?: unknown
  }
}

function asNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function tagValue(block: string, name: string): string {
  const match = block.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`, 'i'))
  return match?.[1] ? decodeXml(match[1].trim()) : ''
}

function attr(block: string, tag: string, name: string): string {
  const match = block.match(new RegExp(`<${tag}[^>]*\\s${name}="([^"]+)"`, 'i'))
  return match?.[1] ? decodeXml(match[1]) : ''
}

export function parseRedditHits(payload: unknown, since: Date, now = new Date()): Hit[] {
  if (!payload || typeof payload !== 'object' || !('data' in payload)) return []
  const listing = (payload as { data?: { children?: unknown } }).data
  if (!listing || !Array.isArray(listing.children)) return []

  const hits: Hit[] = []
  for (const child of listing.children as RedditChild[]) {
    if (!child || child.kind !== 't3' || !child.data) continue
    const row = child.data
    if (row.over_18 === true) continue

    const id = asString(row.id)
    const title = asString(row.title)
    if (!id || !title) continue

    const createdAt = new Date(asNumber(row.created_utc) * 1000)
    if (!isWithinWindow(createdAt, since, now)) continue

    const permalinkPath = asString(row.permalink)
    const permalink = permalinkPath
      ? `https://www.reddit.com${permalinkPath}`
      : asString(row.url)
    const url = permalink || asString(row.url)
    if (!url) continue

    const primary = Math.max(0, asNumber(row.score))
    const secondary = asNumber(row.num_comments)
    const subreddit = asString(row.subreddit)

    hits.push({
      id: `reddit:${id}`,
      source: 'reddit',
      title,
      url,
      createdAt,
      primary,
      primaryLabel: primary === 1 ? 'upvote' : 'upvotes',
      secondary,
      secondaryLabel: secondary === 1 ? 'comment' : 'comments',
      subtitle: subreddit ? `r/${subreddit}` : 'Reddit',
      score: engagementScore(primary, secondary),
    })
  }
  return hits
}

export function parseRedditRss(xml: string, since: Date, now = new Date()): Hit[] {
  const entries = xml.split(/<entry[\s>]/i).slice(1)
  const hits: Hit[] = []

  for (const [index, raw] of entries.entries()) {
    const block = raw.includes('</entry>') ? raw : `${raw}</entry>`
    const id = tagValue(block, 'id')
    if (!id.startsWith('t3_')) continue

    const url = attr(block, 'link', 'href')
    if (!url.includes('/comments/')) continue

    const title = tagValue(block, 'title')
    if (!title) continue

    const published = tagValue(block, 'published') || tagValue(block, 'updated')
    const createdAt = new Date(published)
    if (Number.isNaN(createdAt.getTime()) || !isWithinWindow(createdAt, since, now)) {
      continue
    }

    const subreddit = attr(block, 'category', 'term')
    const primary = Math.max(0, 40 - index)

    hits.push({
      id: `reddit:${id.slice(3)}`,
      source: 'reddit',
      title,
      url,
      createdAt,
      primary,
      primaryLabel: 'rss-rank',
      secondary: 0,
      secondaryLabel: 'comments',
      subtitle: subreddit
        ? `r/${subreddit} · RSS (upvotes unavailable)`
        : 'Reddit · RSS (upvotes unavailable)',
      score: engagementScore(primary, 0),
    })
  }

  return hits
}

async function readResponse(response: Response): Promise<string> {
  return await response.text()
}

function looksLikeJsonListing(text: string): boolean {
  const trimmed = text.trim()
  return trimmed.startsWith('{') && trimmed.includes('"children"')
}

export async function fetchRedditHits(
  topic: string,
  since: Date,
  signal?: AbortSignal,
): Promise<Hit[]> {
  const params = new URLSearchParams({
    q: topic,
    sort: 'top',
    t: 'month',
    limit: '25',
    type: 'link',
    raw_json: '1',
  })

  const jsonResponse = await fetch(`/api/reddit/search.json?${params}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  const jsonText = await readResponse(jsonResponse)
  if (jsonResponse.ok && looksLikeJsonListing(jsonText)) {
    try {
      const hits = parseRedditHits(JSON.parse(jsonText), since)
      if (hits.length > 0) return hits
    } catch {
      // fall through to RSS
    }
  }

  const rssResponse = await fetch(`/api/reddit/search.rss?${params}`, {
    signal,
    headers: { Accept: 'application/atom+xml, application/xml, text/xml' },
  })
  const rssText = await readResponse(rssResponse)
  if (rssResponse.ok && rssText.includes('<entry')) {
    const hits = parseRedditRss(rssText, since)
    if (hits.length > 0) return hits
  }

  throw new SourceError(
    'reddit',
    jsonResponse.ok
      ? 'Reddit JSON and RSS returned no posts in the last 30 days.'
      : `Reddit JSON returned ${jsonResponse.status} and RSS did not yield posts. Public JSON is often blocked from datacenter IPs.`,
    jsonResponse.status,
  )
}
