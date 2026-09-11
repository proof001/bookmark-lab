import { expect, test } from 'bun:test'
import { engagementScore, roundScore } from './score'

test('log-compresses primary and secondary with published weights', () => {
  const score = engagementScore(99, 9)
  expect(score).toBeCloseTo(10 * Math.log10(100) + 6 * Math.log10(10), 8)
})

test('clamps negatives and treats non-finite as zero', () => {
  expect(engagementScore(-12, Number.NaN)).toBe(0)
  expect(roundScore(12.34)).toBe(12.3)
  expect(roundScore(12.36)).toBe(12.4)
})

test('keeps HN-scale and GitHub-scale scores in the same order of magnitude', () => {
  const hn = engagementScore(400, 80)
  const github = engagementScore(1200, 40)
  expect(hn).toBeGreaterThan(20)
  expect(github).toBeGreaterThan(hn * 0.8)
  expect(github).toBeLessThan(hn * 1.6)
})
