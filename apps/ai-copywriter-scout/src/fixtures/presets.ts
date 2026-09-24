export type Preset = {
  id: string
  label: string
  draft: string
}

/** Short-form video caption starters — generic, no brand claims */
export const PRESETS: Preset[] = [
  {
    id: 'product-tip',
    label: 'Product tip',
    draft:
      'In order to leverage our comprehensive solution, users should utilize the dashboard to optimize their workflow. Furthermore, it is important to note that automation can significantly enhance productivity.',
  },
  {
    id: 'story-hook',
    label: 'Story hook',
    draft:
      'I was struggling to stay consistent with content until I tried batching three hooks on Sunday night. Here is what changed for me over the last month.',
  },
  {
    id: 'tutorial',
    label: 'Tutorial beat',
    draft:
      'Step one: open the app. Step two: paste your draft. Step three: pick a tone. This approach will enable you to deliver value to your audience in a seamless manner.',
  },
  {
    id: 'hot-take',
    label: 'Hot take',
    draft:
      'Most AI captions sound the same because everyone copies the same filler phrases. Delve into specifics and cut the corporate glue.',
  },
]
