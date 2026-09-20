import { expect, test } from 'bun:test'
import { windowSince } from '../window'
import { parseGithubHits } from './github'

const now = new Date('2026-09-11T12:00:00Z')
const since = windowSince(now)

test('parses repositories created in the window', () => {
  const hits = parseGithubHits(
    {
      items: [
        {
          id: 42,
          full_name: 'oven-sh/demo',
          html_url: 'https://github.com/oven-sh/demo',
          description: 'A bun starter',
          stargazers_count: 1204,
          forks_count: 33,
          created_at: '2026-08-20T00:00:00Z',
        },
        {
          id: 99,
          full_name: 'old/repo',
          html_url: 'https://github.com/old/repo',
          stargazers_count: 50000,
          forks_count: 10,
          created_at: '2020-01-01T00:00:00Z',
        },
      ],
    },
    since,
    now,
  )
  expect(hits).toHaveLength(1)
  expect(hits[0]).toMatchObject({
    id: 'github:42',
    source: 'github',
    title: 'oven-sh/demo — A bun starter',
    subtitle: 'oven-sh/demo',
    primary: 1204,
    secondary: 33,
  })
})
