/**
 * Cross-source engagement score.
 *
 * score = 10 * log10(1 + primary) + 6 * log10(1 + secondary)
 *
 * HN primary/secondary: points / comments
 * Reddit: upvotes / comments
 * GitHub: stars / forks
 */
export function engagementScore(primary: number, secondary: number): number {
  const p = Math.max(0, Number.isFinite(primary) ? primary : 0)
  const s = Math.max(0, Number.isFinite(secondary) ? secondary : 0)
  return 10 * Math.log10(1 + p) + 6 * Math.log10(1 + s)
}

export function roundScore(score: number): number {
  return Math.round(score * 10) / 10
}
