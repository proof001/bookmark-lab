import { GITHUB_PROXY_HEADERS, proxyUpstream } from '../../src/lib/prod-proxy'

export const config = { runtime: 'edge' }

export default function handler(request: Request) {
  return proxyUpstream(request, '/api/github', 'https://api.github.com', GITHUB_PROXY_HEADERS)
}
