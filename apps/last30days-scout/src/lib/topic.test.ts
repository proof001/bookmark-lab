import { expect, test } from 'bun:test'
import { isValidTopic, normalizeTopic, requireTopic, TopicError } from './topic'

test('trims and collapses whitespace', () => {
  expect(normalizeTopic('  bun   runtime  ')).toBe('bun runtime')
})

test('accepts short letter or number topics', () => {
  expect(isValidTopic('bun')).toBe(true)
  expect(isValidTopic('react 19')).toBe(true)
  expect(isValidTopic('c++')).toBe(true)
})

test('rejects empty or punctuation-only input', () => {
  expect(isValidTopic(normalizeTopic(''))).toBe(false)
  expect(isValidTopic('???')).toBe(false)
  expect(() => requireTopic('   ')).toThrow(TopicError)
})
