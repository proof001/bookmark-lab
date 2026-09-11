import { expect, test } from 'bun:test'
import { countBySource, dedupeHits, rankHits, type Hit } from './hits'

function hit(partial: Partial<Hit> & Pick<Hit, 'id' | 'source' | 'score'>): Hit {
  return {
    title: partial.id,
    url: `https://example.com/${partial.id}`,
    createdAt: new Date('2026-09-01T00:00:00Z'),
    primary: 1,
    primaryLabel: 'points',
    secondary: 0,
    secondaryLabel: 'comments',
    subtitle: 'x',
    ...partial,
  }
}

test('ranks by score then recency and rounds on dedupe', () => {
  const ranked = rankHits(
    dedupeHits([
      hit({
        id: 'a',
        source: 'hn',
        score: 12.34,
        createdAt: new Date('2026-09-01T00:00:00Z'),
      }),
      hit({
        id: 'dup',
        source: 'reddit',
        url: 'https://example.com/a',
        score: 99,
      }),
      hit({
        id: 'b',
        source: 'github',
        score: 12.34,
        createdAt: new Date('2026-09-10T00:00:00Z'),
      }),
    ]),
  )
  expect(ranked.map((row) => row.id)).toEqual(['b', 'a'])
  expect(ranked[0]?.score).toBe(12.3)
})

test('counts sources', () => {
  expect(
    countBySource([
      hit({ id: '1', source: 'hn', score: 1 }),
      hit({ id: '2', source: 'hn', score: 1 }),
      hit({ id: '3', source: 'github', score: 1 }),
    ]),
  ).toEqual({ hn: 2, reddit: 0, github: 1 })
})
