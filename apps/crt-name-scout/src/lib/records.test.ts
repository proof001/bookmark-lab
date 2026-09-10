import { expect, test } from 'bun:test'
import {
  filterRecords,
  parseCrtNameText,
  recordsToCsv,
  recordsToTxt,
  sortRecords,
} from './records'

const SAMPLE = [
  'neverssl.com\t2017-03-27T20:24:08Z',
  'coolgrandclearbirds.neverssl.com\tunknown',
  'funshininginnersunrise.neverssl.com 2022-12-06T21:51:23Z',
  '',
].join('\n')

test('parses tab or space separated crt.name lines', () => {
  const records = parseCrtNameText(SAMPLE)
  expect(records).toHaveLength(3)
  expect(records[0]).toEqual({
    hostname: 'neverssl.com',
    firstSeen: new Date('2017-03-27T20:24:08Z'),
  })
  expect(records[1]?.firstSeen).toBeNull()
  expect(records[2]?.hostname).toBe('funshininginnersunrise.neverssl.com')
})

test('filters, sorts, and exports the visible set', () => {
  const records = parseCrtNameText(SAMPLE)
  const filtered = filterRecords(records, 'cool')
  expect(filtered.map((r) => r.hostname)).toEqual([
    'coolgrandclearbirds.neverssl.com',
  ])

  const byDate = sortRecords(records, 'date', 'asc')
  expect(byDate.map((r) => r.hostname)).toEqual([
    'neverssl.com',
    'funshininginnersunrise.neverssl.com',
    'coolgrandclearbirds.neverssl.com',
  ])

  expect(recordsToTxt(filtered)).toBe('coolgrandclearbirds.neverssl.com\n')
  expect(recordsToCsv(filtered)).toBe(
    'hostname,first_seen\ncoolgrandclearbirds.neverssl.com,unknown\n',
  )
})
