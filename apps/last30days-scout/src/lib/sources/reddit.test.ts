import { expect, test } from 'bun:test'
import { windowSince } from '../window'
import { parseRedditHits, parseRedditRss } from './reddit'

const now = new Date('2026-09-11T12:00:00Z')
const since = windowSince(now)

test('parses link posts and drops NSFW plus stale rows', () => {
  const hits = parseRedditHits(
    {
      data: {
        children: [
          {
            kind: 't3',
            data: {
              id: 'abc',
              title: 'Switched CI to bun',
              permalink: '/r/javascript/comments/abc/switched/',
              score: 890,
              num_comments: 120,
              created_utc: Math.floor(new Date('2026-09-02T00:00:00Z').getTime() / 1000),
              subreddit: 'javascript',
              over_18: false,
            },
          },
          {
            kind: 't3',
            data: {
              id: 'nsfw',
              title: 'skip me',
              permalink: '/r/all/comments/nsfw/x/',
              score: 9999,
              num_comments: 1,
              created_utc: Math.floor(now.getTime() / 1000),
              over_18: true,
            },
          },
          {
            kind: 't1',
            data: { id: 'comment', title: 'not a post' },
          },
        ],
      },
    },
    since,
    now,
  )
  expect(hits).toHaveLength(1)
  expect(hits[0]).toMatchObject({
    id: 'reddit:abc',
    source: 'reddit',
    subtitle: 'r/javascript',
    url: 'https://www.reddit.com/r/javascript/comments/abc/switched/',
    primary: 890,
    secondary: 120,
  })
})

test('parses Atom search.rss posts and skips community pages', () => {
  const xml = `<?xml version="1.0"?>
<feed>
  <entry>
    <id>t5_2ug38</id>
    <title>/bun/</title>
    <link href="https://www.reddit.com/r/bun/" />
    <published>2026-09-06T01:00:00Z</published>
  </entry>
  <entry>
    <id>t3_abc123</id>
    <title>Switched CI to bun</title>
    <link href="https://www.reddit.com/r/javascript/comments/abc123/switched/" />
    <category term="javascript" label="r/javascript"/>
    <published>2026-09-06T01:00:00Z</published>
  </entry>
</feed>`
  const hits = parseRedditRss(xml, since, now)
  expect(hits).toHaveLength(1)
  expect(hits[0]).toMatchObject({
    id: 'reddit:abc123',
    title: 'Switched CI to bun',
    subtitle: 'r/javascript · RSS (upvotes unavailable)',
    primaryLabel: 'rss-rank',
  })
})
