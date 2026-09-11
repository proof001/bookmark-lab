import { expect, test } from 'bun:test'
import { engagementScore } from './score'
import { synthesize } from './synthesize'
import type { Hit } from './hits'

function hit(
  source: Hit['source'],
  title: string,
  primary: number,
  extra: Partial<Hit> = {},
): Hit {
  return {
    id: `${source}:${title}`,
    source,
    title,
    url: `https://example.com/${encodeURIComponent(title)}`,
    createdAt: new Date('2026-09-01T00:00:00Z'),
    primary,
    primaryLabel: 'points',
    secondary: 10,
    secondaryLabel: 'comments',
    subtitle: source,
    score: engagementScore(primary, 10),
    ...extra,
  }
}

test('returns null for an empty board', () => {
  expect(synthesize('bun', [])).toBeNull()
})

test('writes a paragraph that cites the leader and mixed sources', () => {
  const result = synthesize('bun', [
    hit('hn', 'Bun runtime tooling release', 400),
    hit('reddit', 'Bun runtime install notes', 200, {
      primaryLabel: 'upvotes',
    }),
    hit('github', 'oven-sh/demo — bun tooling', 100, {
      primaryLabel: 'stars',
      secondaryLabel: 'forks',
    }),
  ])
  expect(result).not.toBeNull()
  expect(result?.paragraph).toContain('“bun”')
  expect(result?.paragraph).toContain('HN (1)')
  expect(result?.paragraph).toContain('Reddit (1)')
  expect(result?.paragraph).toContain('GitHub (1)')
  expect(result?.paragraph).toContain('Bun runtime tooling release')
  expect(result?.paragraph).toContain('runtime')
  expect(result?.citations).toHaveLength(3)
  expect(result?.citations[0]?.source).toBe('hn')
})
