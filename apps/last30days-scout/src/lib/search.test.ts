import { afterEach, expect, test } from 'bun:test'
import { searchTopic } from './search'
import { TopicError } from './topic'

const now = new Date('2026-09-11T12:00:00Z')
const recent = Math.floor(new Date('2026-09-01T00:00:00Z').getTime() / 1000)

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('rejects an empty topic before fetching', async () => {
  let called = false
  globalThis.fetch = async () => {
    called = true
    return new Response('{}')
  }
  await expect(searchTopic('   ', undefined, now)).rejects.toBeInstanceOf(TopicError)
  expect(called).toBe(false)
})

test('merges healthy sources and warns on a single failure', async () => {
  globalThis.fetch = async (input) => {
    const url = String(input)
    if (url.includes('/api/hn')) {
      return Response.json({
        hits: [
          {
            objectID: '111',
            title: 'Bun on HN',
            url: 'https://news.ycombinator.com/item?id=111',
            author: 'pg',
            points: 200,
            num_comments: 20,
            created_at_i: recent,
          },
        ],
      })
    }
    if (url.includes('/api/reddit')) {
      return new Response('blocked', { status: 403 })
    }
    if (url.includes('/api/github')) {
      return Response.json({
        items: [
          {
            id: 7,
            full_name: 'oven-sh/demo',
            html_url: 'https://github.com/oven-sh/demo',
            description: 'demo',
            stargazers_count: 50,
            forks_count: 2,
            created_at: '2026-08-20T00:00:00Z',
          },
        ],
      })
    }
    return new Response('missing', { status: 404 })
  }

  const result = await searchTopic('bun', undefined, now)
  expect(result.topic).toBe('bun')
  expect(result.hits.map((hit) => hit.source).sort()).toEqual(['github', 'hn'])
  expect(result.warnings).toHaveLength(1)
  expect(result.warnings[0]?.source).toBe('reddit')
})

test('hard-fails when every source errors', async () => {
  globalThis.fetch = async () => new Response('no', { status: 503 })
  await expect(searchTopic('bun', undefined, now)).rejects.toThrow(/hn:/i)
})
