import { expect, test } from 'bun:test'
import { windowSince } from '../window'
import { parseHnHits } from './hn'

const now = new Date('2026-09-11T12:00:00Z')
const since = windowSince(now)

test('parses Algolia stories inside the window', () => {
  const hits = parseHnHits(
    {
      hits: [
        {
          objectID: '111',
          title: 'Bun 1.3',
          url: 'https://bun.sh/blog',
          author: 'jarred',
          points: 412,
          num_comments: 89,
          created_at_i: Math.floor(new Date('2026-09-01T00:00:00Z').getTime() / 1000),
        },
        {
          objectID: '222',
          title: 'Too old',
          points: 9000,
          num_comments: 1,
          created_at_i: Math.floor(new Date('2026-01-01T00:00:00Z').getTime() / 1000),
        },
        {
          objectID: '333',
          story_title: 'Ask HN fallback',
          points: 10,
          num_comments: 2,
          created_at_i: Math.floor(now.getTime() / 1000),
        },
      ],
    },
    since,
    now,
  )
  expect(hits).toHaveLength(2)
  expect(hits[0]).toMatchObject({
    id: 'hn:111',
    source: 'hn',
    title: 'Bun 1.3',
    url: 'https://bun.sh/blog',
    subtitle: 'by jarred',
    primary: 412,
    secondary: 89,
  })
  expect(hits[1]?.url).toBe('https://news.ycombinator.com/item?id=333')
})

test('ignores malformed payloads', () => {
  expect(parseHnHits(null, since, now)).toEqual([])
  expect(parseHnHits({ hits: 'nope' }, since, now)).toEqual([])
})
