const SCHEME_RE = /^[a-z][a-z0-9+.-]*:\/\//i
const APEX_RE =
  /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/

/** Strip scheme/path/port/userinfo, lowercase, drop a trailing dot. */
export function normalizeApex(raw: string): string {
  let value = raw.trim()
  if (!value) return ''

  value = value.replace(SCHEME_RE, '')

  const host = value.split(/[/?#]/, 1)[0] ?? ''
  let hostname = host.trim().toLowerCase()

  const at = hostname.lastIndexOf('@')
  if (at !== -1) {
    hostname = hostname.slice(at + 1)
  }

  if (hostname.startsWith('[')) {
    const end = hostname.indexOf(']')
    hostname = end === -1 ? hostname.slice(1) : hostname.slice(1, end)
  } else {
    hostname = hostname.replace(/:\d+$/, '')
  }

  return hostname.replace(/\.$/, '')
}

export function isValidApex(apex: string): boolean {
  return apex.length > 0 && apex.length <= 253 && APEX_RE.test(apex)
}
