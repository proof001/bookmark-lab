import { REDDIT_PROXY_HEADERS, proxyUpstream } from '../../src/lib/prod-proxy'

export const config = { runtime: 'edge' }

export default function handler(request: Request) {
  return proxyUpstream(request, '/api/reddit', 'https://www.reddit.com', REDDIT_PROXY_HEADERS)
}
