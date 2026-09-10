import { expect, test } from 'bun:test'
import { isValidApex, normalizeApex } from './apex'

test('strips scheme, path, port, and lowercases', () => {
  expect(normalizeApex('HTTPS://WWW.Example.COM:443/path?q=1#hash')).toBe(
    'www.example.com',
  )
})

test('accepts a bare apex', () => {
  expect(normalizeApex(' neverssl.com. ')).toBe('neverssl.com')
  expect(isValidApex(normalizeApex('neverssl.com'))).toBe(true)
})

test('rejects empty or invalid input', () => {
  expect(isValidApex(normalizeApex(''))).toBe(false)
  expect(isValidApex(normalizeApex('not a domain'))).toBe(false)
})
