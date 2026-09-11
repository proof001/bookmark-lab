import {
  SOURCE_LABEL,
  countBySource,
  formatEngagement,
  type Hit,
  type SourceId,
} from './hits'
import { WINDOW_DAYS } from './window'

const STOPWORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'for',
  'from',
  'how',
  'i',
  'in',
  'into',
  'is',
  'it',
  'my',
  'of',
  'on',
  'or',
  'our',
  'the',
  'this',
  'to',
  'vs',
  'we',
  'with',
  'you',
  'your',
])

export type Citation = {
  source: SourceId
  title: string
  url: string
  metric: string
}

export type Synthesis = {
  paragraph: string
  citations: Citation[]
}

function tokensFromTitle(title: string, topic: string): string[] {
  const topicNorm = topic.toLowerCase()
  return title
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s/-]/gu, ' ')
    .split(/[\s/]+/)
    .map((token) => token.trim())
    .filter(
      (token) =>
        token.length >= 3 &&
        !STOPWORDS.has(token) &&
        token !== topicNorm &&
        !topicNorm.split(' ').includes(token),
    )
}

function clusterPhrase(hits: Hit[], topic: string): string | null {
  const counts = new Map<string, number>()
  for (const hit of hits) {
    for (const token of tokensFromTitle(hit.title, topic)) {
      counts.set(token, (counts.get(token) ?? 0) + 1)
    }
  }
  const ranked = [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 3)
    .map(([token]) => token)
  if (ranked.length === 0) return null
  if (ranked.length === 1) return ranked[0] ?? null
  if (ranked.length === 2) return `${ranked[0]} and ${ranked[1]}`
  return `${ranked[0]}, ${ranked[1]}, and ${ranked[2]}`
}

function sourceMix(hits: Hit[]): string {
  const counts = countBySource(hits)
  const parts = (['hn', 'reddit', 'github'] as const)
    .filter((source) => counts[source] > 0)
    .map((source) => `${SOURCE_LABEL[source]} (${counts[source]})`)
  if (parts.length === 0) return 'no sources'
  if (parts.length === 1) return parts[0] ?? 'no sources'
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`
  return `${parts[0]}, ${parts[1]}, and ${parts[2]}`
}

function firstSentence(topic: string, board: Hit[]): string {
  return `Over the last ${WINDOW_DAYS} days, “${topic}” showed up across ${sourceMix(board)}.`
}

function secondSentence(topic: string, board: Hit[]): string {
  const leader = board[0]
  const cluster = clusterPhrase(board, topic)
  const clusterBit = cluster
    ? ` Titles clustered around ${cluster}.`
    : ' Titles did not share an obvious cluster beyond the query.'
  if (!leader) return clusterBit.trim()
  return ` The board is led by “${leader.title}” on ${SOURCE_LABEL[leader.source]} (${formatEngagement(leader)}).${clusterBit}`
}

export function synthesize(topic: string, hits: Hit[]): Synthesis | null {
  if (hits.length === 0) return null
  const board = hits.slice(0, 8)
  const paragraph = `${firstSentence(topic, board)}${secondSentence(topic, board)}`
  const citations = board.slice(0, 3).map((hit) => ({
    source: hit.source,
    title: hit.title,
    url: hit.url,
    metric: formatEngagement(hit),
  }))
  return { paragraph, citations }
}
