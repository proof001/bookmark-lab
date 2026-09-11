import { dedupeHits, rankHits, SourceError, type Hit, type SourceWarning } from './hits'
import { fetchGithubHits } from './sources/github'
import { fetchHnHits } from './sources/hn'
import { fetchRedditHits } from './sources/reddit'
import { requireTopic } from './topic'
import { windowSince } from './window'

export type SearchOutcome = {
  topic: string
  since: Date
  hits: Hit[]
  warnings: SourceWarning[]
}

async function collect(
  source: SourceWarning['source'],
  task: Promise<Hit[]>,
): Promise<{ hits: Hit[]; warning?: SourceWarning }> {
  try {
    return { hits: await task }
  } catch (cause) {
    if (cause instanceof DOMException && cause.name === 'AbortError') throw cause
    const message =
      cause instanceof SourceError
        ? cause.message
        : cause instanceof Error
          ? cause.message
          : `Could not load ${source}.`
    return { hits: [], warning: { source, message } }
  }
}

export async function searchTopic(
  rawTopic: string,
  signal?: AbortSignal,
  now = new Date(),
): Promise<SearchOutcome> {
  const topic = requireTopic(rawTopic)
  const since = windowSince(now)

  const [hn, reddit, github] = await Promise.all([
    collect('hn', fetchHnHits(topic, since, signal)),
    collect('reddit', fetchRedditHits(topic, since, signal)),
    collect('github', fetchGithubHits(topic, since, signal)),
  ])

  const warnings = [hn.warning, reddit.warning, github.warning].filter(
    (warning): warning is SourceWarning => warning !== undefined,
  )
  const hits = rankHits(dedupeHits([...hn.hits, ...reddit.hits, ...github.hits]))

  if (hits.length === 0 && warnings.length === 3) {
    throw new Error(
      warnings.map((warning) => `${warning.source}: ${warning.message}`).join(' '),
    )
  }

  return { topic, since, hits, warnings }
}
