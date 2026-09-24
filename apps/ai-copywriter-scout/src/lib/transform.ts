export type CopyMode = 'humanize' | 'caption' | 'hook' | 'script-beat'

export class TransformError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'TransformError'
  }
}

const AI_PHRASES: Array<[RegExp, string]> = [
  [/\bin order to\b/gi, 'to'],
  [/\bleverage\b/gi, 'use'],
  [/\butilize\b/gi, 'use'],
  [/\bcomprehensive\b/gi, 'full'],
  [/\bseamless(ly)?\b/gi, 'smooth'],
  [/\bfurthermore\b/gi, 'also'],
  [/\bit is important to note that\b/gi, 'note:'],
  [/\bdelve into\b/gi, 'dig into'],
  [/\brobust\b/gi, 'solid'],
  [/\blandscape\b/gi, 'space'],
  [/\bat the end of the day\b/gi, 'really'],
  [/\bin today's (fast-paced )?world\b/gi, 'right now'],
  [/\bunlock\b/gi, 'get'],
  [/\bempower\b/gi, 'help'],
  [/\benable(s)?\b/gi, 'lets'],
  [/\bsignificantly enhance\b/gi, 'boost'],
  [/\bdeliver value\b/gi, 'help people'],
]

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/g, ' ').trim()
}

function splitSentences(text: string): string[] {
  const cleaned = collapseWhitespace(text)
  if (!cleaned) return []
  return cleaned
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
}

function applyPhraseMap(text: string): string {
  let out = text
  for (const [pattern, replacement] of AI_PHRASES) {
    out = out.replace(pattern, replacement)
  }
  return out
}

function softenFormality(text: string): string {
  return text
    .replace(/\bdo not\b/gi, "don't")
    .replace(/\bcannot\b/gi, "can't")
    .replace(/\bwill not\b/gi, "won't")
    .replace(/\bI am\b/g, "I'm")
    .replace(/\bit is\b/gi, "it's")
    .replace(/\bthat is\b/gi, "that's")
    .replace(/\bwe are\b/gi, "we're")
}

function humanize(text: string): string {
  const sentences = splitSentences(text)
  if (sentences.length === 0) {
    throw new TransformError('Paste some draft copy first.')
  }
  const body = sentences
    .map((s) => softenFormality(applyPhraseMap(s)))
    .map((s) => s.replace(/^[A-Z]/, (c) => c))
    .join(' ')
  return body
}

function caption(text: string): string {
  const base = humanize(text)
  const sentences = splitSentences(base)
  const lines = sentences.map((s, i) => {
    const line = s.replace(/\.$/, '')
    if (i === 0 && line.length > 48) {
      const mid = line.lastIndexOf(' ', 42)
      if (mid > 20) {
        return `${line.slice(0, mid)}\n${line.slice(mid + 1)}`
      }
    }
    return line
  })
  const tags = '#shorts #creators #copytips'
  return `${lines.join('\n\n')}\n\n${tags}`
}

function hook(text: string): string {
  const sentences = splitSentences(text)
  if (sentences.length === 0) {
    throw new TransformError('Paste some draft copy first.')
  }
  const first = softenFormality(applyPhraseMap(sentences[0])).replace(/\.$/, '')
  const punch =
    first.length > 72
      ? `${first.slice(0, 69).trim()}…`
      : first.endsWith('?')
        ? first
        : `${first}?`
  const rest = sentences
    .slice(1)
    .map((s) => softenFormality(applyPhraseMap(s)))
    .join(' ')
  return rest ? `${punch}\n\n${rest}` : punch
}

function scriptBeat(text: string): string {
  const sentences = splitSentences(text)
  if (sentences.length === 0) {
    throw new TransformError('Paste some draft copy first.')
  }
  const human = sentences.map((s) => softenFormality(applyPhraseMap(s)))
  const hookLine = human[0]?.replace(/\.$/, '') ?? ''
  const body = human.slice(1, -1).join(' ') || human.slice(1).join(' ')
  const cta =
    human.length > 1
      ? 'Save this for your next draft — follow for more copy beats.'
      : 'Try this on your next post and tweak one line at a time.'
  return [
    'HOOK',
    hookLine.endsWith('?') ? hookLine : `${hookLine}.`,
    '',
    'BEAT',
    body || '(expand with one concrete example)',
    '',
    'CTA',
    cta,
  ].join('\n')
}

export function transformCopy(draft: string, mode: CopyMode): string {
  const trimmed = draft.trim()
  if (!trimmed) {
    throw new TransformError('Paste some draft copy first.')
  }
  switch (mode) {
    case 'humanize':
      return humanize(trimmed)
    case 'caption':
      return caption(trimmed)
    case 'hook':
      return hook(trimmed)
    case 'script-beat':
      return scriptBeat(trimmed)
    default:
      throw new TransformError(`Unknown mode: ${mode}`)
  }
}

export const MODE_LABELS: Record<CopyMode, string> = {
  humanize: 'Humanize',
  caption: 'Caption',
  hook: 'Hook',
  'script-beat': 'Script beat',
}

export const MODE_HINTS: Record<CopyMode, string> = {
  humanize: 'Strip filler phrases and tighten tone (local heuristics).',
  caption: 'Line breaks + short-form tags for vertical video.',
  hook: 'Punch up the opening line; keep the rest.',
  'script-beat': 'HOOK / BEAT / CTA structure for a talking-head clip.',
}
