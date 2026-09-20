import { afterEach, expect, test } from 'bun:test'
import {
  GITHUB_PROXY_HEADERS,
  LAST30_USER_AGENT,
  REDDIT_PROXY_HEADERS,
  proxyUpstream,
  rewriteApiPrefix,
} from './prod-proxy'

const originalFetch = globalThis.fetch

afterEach(() => {
  globalThis.fetch = originalFetch
})

test('strips the /api prefix and keeps the query string', () => {
  expect(
    rewriteApiPrefix(
      'https://app.vercel.app/api/github/search/repositories?q=bun+created%3A%3E2026-08-01&sort=stars',
      '/api/github',
      'https://api.github.com',
    ),
  ).toBe(
    'https://api.github.com/search/repositories?q=bun+created%3A%3E2026-08-01&sort=stars',
  )
  expect(
    rewriteApiPrefix(
      'https://app.vercel.app/api/reddit/search.json?q=bun&t=month&raw_json=1',
      '/api/reddit',
      'https://www.reddit.com',
    ),
  ).toBe('https://www.reddit.com/search.json?q=bun&t=month&raw_json=1')
})

test('GitHub proxy sets Vite headers and forwards the body', async () => {
  const calls: { url: string; init?: RequestInit }[] = []
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init })
    return new Response('{"items":[]}', {
      status: 200,
      headers: { 'content-type': 'application/json' },
    })
  }

  const request = new Request(
    'https://demo.vercel.app/api/github/search/repositories?q=bun&sort=stars',
    {
      method: 'POST',
      headers: { Accept: 'text/plain', 'content-type': 'application/json' },
      body: '{"probe":true}',
    },
  )
  const response = await proxyUpstream(
    request,
    '/api/github',
    'https://api.github.com',
    GITHUB_PROXY_HEADERS,
  )

  expect(calls).toHaveLength(1)
  expect(calls[0]?.url).toBe(
    'https://api.github.com/search/repositories?q=bun&sort=stars',
  )
  const headers = new Headers(calls[0]?.init?.headers)
  expect(headers.get('Accept')).toBe('application/vnd.github+json')
  expect(headers.get('User-Agent')).toBe(LAST30_USER_AGENT)
  expect(headers.get('X-GitHub-Api-Version')).toBe('2022-11-28')
  expect(calls[0]?.init?.method).toBe('POST')
  expect(calls[0]?.init?.body).toBeTruthy()
  expect(response.status).toBe(200)
  expect(response.headers.get('content-type')).toContain('application/json')
  expect(await response.text()).toBe('{"items":[]}')
})

test('Reddit proxy sets User-Agent and forwards the client Accept', async () => {
  const calls: { url: string; init?: RequestInit }[] = []
  globalThis.fetch = async (input, init) => {
    calls.push({ url: String(input), init })
    return new Response('blocked', { status: 403 })
  }

  const request = new Request(
    'https://demo.vercel.app/api/reddit/search.rss?q=bun&sort=top',
    { headers: { Accept: 'application/atom+xml' } },
  )
  const response = await proxyUpstream(
    request,
    '/api/reddit',
    'https://www.reddit.com',
    REDDIT_PROXY_HEADERS,
  )

  expect(calls[0]?.url).toBe('https://www.reddit.com/search.rss?q=bun&sort=top')
  const headers = new Headers(calls[0]?.init?.headers)
  expect(headers.get('User-Agent')).toBe(LAST30_USER_AGENT)
  expect(headers.get('Accept')).toBe('application/atom+xml')
  expect(response.status).toBe(403)
})
