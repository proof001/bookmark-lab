import { describe, expect, test } from 'bun:test'

import { TransformError, transformCopy } from './transform'

describe('transformCopy', () => {
  test('rejects empty draft', () => {
    expect(() => transformCopy('   ', 'humanize')).toThrow(TransformError)
  })

  test('humanize replaces common AI filler', () => {
    const out = transformCopy(
      'In order to leverage the comprehensive dashboard.',
      'humanize',
    )
    expect(out.toLowerCase()).toContain('to use')
    expect(out.toLowerCase()).not.toContain('leverage')
  })

  test('caption adds hashtags', () => {
    const out = transformCopy('Hello world.', 'caption')
    expect(out).toContain('#shorts')
  })

  test('script beat sections', () => {
    const out = transformCopy('First line. Second line.', 'script-beat')
    expect(out).toContain('HOOK')
    expect(out).toContain('CTA')
  })
})
