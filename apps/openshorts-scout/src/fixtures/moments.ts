export type ViralMoment = {
  id: string
  title: string
  durationSec: number
  score: number
  reason: string
  hook: string
  caption: string
}

export const MOCK_MOMENTS: ViralMoment[] = [
  {
    id: 'm1',
    title: '“We almost shipped the wrong model”',
    durationSec: 42,
    score: 94,
    reason: 'High emotional spike + clear payoff in first 3s',
    hook: 'This mistake cost us 2 weeks',
    caption: '…and nobody caught it until prod',
  },
  {
    id: 'm2',
    title: 'Founder hot take on AI wrappers',
    durationSec: 38,
    score: 91,
    reason: 'Contrarian hook; both speakers react on the seam',
    hook: 'Unpopular opinion:',
    caption: 'wrappers are the product now',
  },
  {
    id: 'm3',
    title: 'Live demo fail → instant recovery',
    durationSec: 55,
    score: 88,
    reason: 'Tension/release arc; face track would follow speaker B',
    hook: 'Watch what happens next',
    caption: 'okay that actually worked',
  },
  {
    id: 'm4',
    title: 'Pricing reveal gasp moment',
    durationSec: 31,
    score: 86,
    reason: 'Short punchy clip; strong subtitle beat',
    hook: 'How much we charge',
    caption: 'half what you think',
  },
  {
    id: 'm5',
    title: 'Stacked interview: advice in 15s',
    durationSec: 28,
    score: 82,
    reason: 'Dense value; ideal for stacked-speaker layout',
    hook: 'Best advice I got',
    caption: 'ship before you feel ready',
  },
]

export const JOB_STEPS = [
  'Ingesting source metadata',
  'Detecting speaker turns',
  'Scoring viral moments',
  'Ranking clips for 9:16',
] as const
