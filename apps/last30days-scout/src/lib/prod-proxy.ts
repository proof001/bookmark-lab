export const LAST30_USER_AGENT =
  'last30days-scout/0.0.1 (bookmark-lab demo; +https://github.com/proof001/bookmark-lab)'

export const GITHUB_PROXY_HEADERS: Record<string, string> = {
  Accept: 'application/vnd.github+json',
  'User-Agent': LAST30_USER_AGENT,
  'X-GitHub-Api-Version': '2022-11-28',
}

export const REDDIT_PROXY_HEADERS: Record<string, string> = {
  'User-Agent': LAST30_USER_AGENT,
}

export function rewriteApiPrefix(
  requestUrl: string,
  prefix: string,
  origin: string,
): string {
  const incoming = new URL(requestUrl, 'http://local.test')
  if (!incoming.pathname.startsWith(prefix)) {
    throw new Error(`pathname ${incoming.pathname} does not start with ${prefix}`)
  }
  const suffix = incoming.pathname.slice(prefix.length)
  const target = new URL(suffix || '/', origin)
  target.search = incoming.search
  return target.href
}

export async function proxyUpstream(
  request: Request,
  prefix: string,
  origin: string,
  extraHeaders: Record<string, string>,
): Promise<Response> {
  const target = rewriteApiPrefix(request.url, prefix, origin)
  const headers = new Headers(extraHeaders)
  if (!headers.has('Accept')) {
    const accept = request.headers.get('Accept')
    if (accept) headers.set('Accept', accept)
  }

  const init: RequestInit = { method: request.method, headers }
  if (request.method !== 'GET' && request.method !== 'HEAD' && request.body) {
    init.body = request.body
    Object.assign(init, { duplex: 'half' })
  }

  const upstream = await fetch(target, init)
  const out = new Headers()
  const contentType = upstream.headers.get('content-type')
  if (contentType) out.set('content-type', contentType)

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: out,
  })
}
