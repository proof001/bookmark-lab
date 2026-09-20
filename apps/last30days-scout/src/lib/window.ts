export const WINDOW_DAYS = 30

export function windowSince(now = new Date()): Date {
  return new Date(now.getTime() - WINDOW_DAYS * 24 * 60 * 60 * 1000)
}

export function unixSeconds(date: Date): number {
  return Math.floor(date.getTime() / 1000)
}

export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10)
}

export function isWithinWindow(created: Date, since: Date, now = new Date()): boolean {
  return created.getTime() >= since.getTime() && created.getTime() <= now.getTime() + 60_000
}

export function formatRelative(created: Date, now = new Date()): string {
  const deltaMs = Math.max(0, now.getTime() - created.getTime())
  const minutes = Math.floor(deltaMs / 60_000)
  if (minutes < 60) return `${Math.max(1, minutes)}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 48) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}
