export type HostRecord = {
  hostname: string
  firstSeen: Date | null
}

export type SortKey = 'hostname' | 'date'
export type SortDir = 'asc' | 'desc'

/** Parse crt.name plaintext: `hostname ISO8601` or `hostname unknown` per line. */
export function parseCrtNameText(text: string): HostRecord[] {
  const records: HostRecord[] = []
  const seen = new Set<string>()

  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed) continue

    const match = trimmed.match(/^(\S+)(?:\s+(\S+))?$/)
    if (!match?.[1]) continue

    const hostname = match[1]
    if (seen.has(hostname)) continue
    seen.add(hostname)

    records.push({
      hostname,
      firstSeen: parseFirstSeen(match[2]),
    })
  }

  return records
}

function parseFirstSeen(token: string | undefined): Date | null {
  if (!token || token.toLowerCase() === 'unknown') return null
  const date = new Date(token)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatFirstSeen(date: Date | null): string {
  if (!date) return 'unknown'
  return date.toISOString()
}

export function filterRecords(
  records: readonly HostRecord[],
  query: string,
): HostRecord[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return [...records]
  return records.filter((record) =>
    record.hostname.toLowerCase().includes(needle),
  )
}

export function sortRecords(
  records: readonly HostRecord[],
  key: SortKey,
  dir: SortDir,
): HostRecord[] {
  const sign = dir === 'asc' ? 1 : -1
  return [...records].sort((a, b) => {
    if (key === 'hostname') {
      return a.hostname.localeCompare(b.hostname) * sign
    }

    const aTime = a.firstSeen?.getTime() ?? null
    const bTime = b.firstSeen?.getTime() ?? null
    if (aTime === null && bTime === null) {
      return a.hostname.localeCompare(b.hostname)
    }
    if (aTime === null) return 1
    if (bTime === null) return -1
    if (aTime === bTime) return a.hostname.localeCompare(b.hostname)
    return (aTime - bTime) * sign
  })
}

export function recordsToTxt(records: readonly HostRecord[]): string {
  return records.map((record) => record.hostname).join('\n') +
    (records.length ? '\n' : '')
}

export function recordsToCsv(records: readonly HostRecord[]): string {
  const lines = ['hostname,first_seen']
  for (const record of records) {
    lines.push(
      `${csvEscape(record.hostname)},${formatFirstSeen(record.firstSeen)}`,
    )
  }
  return `${lines.join('\n')}\n`
}

function csvEscape(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replaceAll('"', '""')}"`
  }
  return value
}

export function downloadText(
  filename: string,
  content: string,
  mime: string,
): void {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
