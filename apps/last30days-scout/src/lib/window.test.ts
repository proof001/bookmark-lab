import { expect, test } from 'bun:test'
import {
  WINDOW_DAYS,
  formatRelative,
  isoDate,
  isWithinWindow,
  unixSeconds,
  windowSince,
} from './window'

const now = new Date('2026-09-11T12:00:00Z')

test('window is 30 days', () => {
  expect(WINDOW_DAYS).toBe(30)
  expect(isoDate(windowSince(now))).toBe('2026-08-12')
  expect(unixSeconds(now)).toBe(Math.floor(now.getTime() / 1000))
})

test('hard-filters dates outside the window', () => {
  expect(isWithinWindow(new Date('2026-08-20T00:00:00Z'), windowSince(now), now)).toBe(
    true,
  )
  expect(isWithinWindow(new Date('2026-07-01T00:00:00Z'), windowSince(now), now)).toBe(
    false,
  )
})

test('formats relative ages', () => {
  expect(formatRelative(new Date('2026-09-11T11:10:00Z'), now)).toBe('50m ago')
  expect(formatRelative(new Date('2026-09-10T12:00:00Z'), now)).toBe('24h ago')
  expect(formatRelative(new Date('2026-09-01T12:00:00Z'), now)).toBe('10d ago')
})
