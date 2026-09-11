import { useRef, useState, type FormEvent } from 'react'
import {
  AlertCircle,
  ExternalLink,
  Info,
  Search,
} from 'lucide-react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  SOURCE_LABEL,
  countBySource,
  formatEngagement,
  type Hit,
  type SourceId,
  type SourceWarning,
} from '@/lib/hits'
import { searchTopic, type SearchOutcome } from '@/lib/search'
import { TopicError } from '@/lib/topic'
import { synthesize, type Synthesis } from '@/lib/synthesize'
import { formatRelative, isoDate } from '@/lib/window'

type Status = 'idle' | 'loading' | 'ready' | 'error'

const EXAMPLES = ['bun', 'react', 'rust'] as const

const SOURCE_BADGE: Record<SourceId, 'default' | 'secondary' | 'outline'> = {
  hn: 'default',
  reddit: 'secondary',
  github: 'outline',
}

export default function App() {
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [outcome, setOutcome] = useState<SearchOutcome | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  const synthesis = outcome ? synthesize(outcome.topic, outcome.hits) : null

  async function runSearch(raw: string) {
    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setDraft(raw)
    setStatus('loading')
    setError(null)
    setOutcome(null)

    try {
      const next = await searchTopic(raw, controller.signal)
      if (controller.signal.aborted) return
      setOutcome(next)
      setStatus('ready')
    } catch (cause) {
      if (controller.signal.aborted) return
      setOutcome(null)
      setStatus('error')
      setError(
        cause instanceof TopicError || cause instanceof Error
          ? cause.message
          : 'Search failed. Check the topic and try again.',
      )
    }
  }

  function onSearch(event: FormEvent) {
    event.preventDefault()
    void runSearch(draft)
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            Last 30 Days Scout
          </h1>
          <Badge variant="outline">HN</Badge>
          <Badge variant="outline">Reddit</Badge>
          <Badge variant="outline">GitHub</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Topic in, last ~30 days out — Hacker News, Reddit, and GitHub only.
          Ranked by a transparent log-compressed engagement score. This demo
          does not wrap the real last30days CLI and does not call Polymarket,
          X/Twitter, or paid APIs.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Free public paths only. GitHub Search without a token is 10
            requests per minute per IP.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <form
            onSubmit={onSearch}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="grid flex-1 gap-2">
              <Label htmlFor="topic">Topic</Label>
              <Input
                id="topic"
                name="topic"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="bun"
                autoFocus
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck={false}
                disabled={status === 'loading'}
              />
            </div>
            <Button type="submit" disabled={status === 'loading'}>
              <Search data-icon="inline-start" />
              {status === 'loading' ? 'Searching…' : 'Search'}
            </Button>
          </form>
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <Button
                key={example}
                type="button"
                variant="outline"
                size="sm"
                disabled={status === 'loading'}
                onClick={() => void runSearch(example)}
              >
                {example}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {status === 'error' && error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Search failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState topic={draft} /> : null}

      {status === 'ready' && outcome ? (
        <Results
          outcome={outcome}
          synthesis={synthesis}
        />
      ) : null}

      {status === 'idle' ? (
        <Alert>
          <Info />
          <AlertTitle>Waiting for a topic</AlertTitle>
          <AlertDescription>
            Try <span className="font-mono">bun</span> or{' '}
            <span className="font-mono">react</span> to fill an
            engagement-ranked board from HN, Reddit, and GitHub.
          </AlertDescription>
        </Alert>
      ) : null}

      <p className="mt-auto text-xs text-muted-foreground">
        Score = <span className="font-mono">10·log10(1+primary) + 6·log10(1+secondary)</span>
        . HN uses points/comments, Reddit upvotes/comments, GitHub stars/forks.
        GitHub is unauthenticated Search (10 req/min). Inspired by{' '}
        <a
          className="underline underline-offset-3 hover:text-foreground"
          href="https://github.com/mvanhorn/last30days-skill"
          target="_blank"
          rel="noreferrer"
        >
          last30days-skill
        </a>
        — this is a demo board, not the CLI.
      </p>
    </div>
  )
}

function LoadingState({ topic }: { topic: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Querying HN, Reddit, and GitHub</CardTitle>
        <CardDescription>
          Fetching the last 30 days
          {topic ? (
            <>
              {' '}
              for <span className="font-mono">{topic}</span>
            </>
          ) : null}
          …
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </CardContent>
    </Card>
  )
}

function Results({
  outcome,
  synthesis,
}: {
  outcome: SearchOutcome
  synthesis: Synthesis | null
}) {
  const counts = countBySource(outcome.hits)
  const empty = outcome.hits.length === 0

  return (
    <>
      {outcome.warnings.map((warning) => (
        <WarningAlert key={warning.source} warning={warning} />
      ))}

      {synthesis ? (
        <Card>
          <CardHeader>
            <CardTitle>Judged synthesis</CardTitle>
            <CardDescription>
              Deterministic judge over the top hits — no model, no paid API.
              Cites the board leaders.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            <p className="text-sm leading-relaxed">{synthesis.paragraph}</p>
            <ul className="grid gap-1.5 text-sm">
              {synthesis.citations.map((citation) => (
                <li key={citation.url} className="flex flex-wrap items-baseline gap-2">
                  <Badge variant={SOURCE_BADGE[citation.source]}>
                    {SOURCE_LABEL[citation.source]}
                  </Badge>
                  <a
                    className="underline underline-offset-3 hover:text-foreground"
                    href={citation.url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {citation.title}
                  </a>
                  <span className="text-xs text-muted-foreground">
                    {citation.metric}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="flex flex-wrap items-center gap-2">
            Ranked board
            <span className="font-mono text-base font-normal">{outcome.topic}</span>
            <Badge variant="secondary">
              {outcome.hits.length.toLocaleString()} hit
              {outcome.hits.length === 1 ? '' : 's'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Since {isoDate(outcome.since)} · HN {counts.hn} · Reddit{' '}
            {counts.reddit} · GitHub {counts.github}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 pt-4">
          {empty ? (
            <Alert>
              <Info />
              <AlertTitle>No hits in the last 30 days</AlertTitle>
              <AlertDescription>
                None of the allowed sources returned a matching story, post, or
                new repository. Try a broader topic.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="max-h-[36rem] overflow-auto rounded-lg ring-1 ring-foreground/10">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-card">
                  <TableRow>
                    <TableHead className="w-16">Score</TableHead>
                    <TableHead className="w-20">Source</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Engagement</TableHead>
                    <TableHead className="w-24">When</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {outcome.hits.map((hit) => (
                    <HitRow key={hit.id} hit={hit} />
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

function WarningAlert({ warning }: { warning: SourceWarning }) {
  return (
    <Alert variant="destructive">
      <AlertCircle />
      <AlertTitle>{SOURCE_LABEL[warning.source]} unavailable</AlertTitle>
      <AlertDescription>{warning.message}</AlertDescription>
    </Alert>
  )
}

function HitRow({ hit }: { hit: Hit }) {
  return (
    <TableRow>
      <TableCell className="font-mono tabular-nums">{hit.score}</TableCell>
      <TableCell>
        <Badge variant={SOURCE_BADGE[hit.source]}>
          {SOURCE_LABEL[hit.source]}
        </Badge>
      </TableCell>
      <TableCell className="max-w-md whitespace-normal">
        <a
          className="inline-flex items-start gap-1 underline-offset-3 hover:underline"
          href={hit.url}
          target="_blank"
          rel="noreferrer"
        >
          <span>{hit.title}</span>
          <ExternalLink className="mt-0.5 size-3 shrink-0 opacity-60" />
        </a>
        <div className="text-xs text-muted-foreground">{hit.subtitle}</div>
      </TableCell>
      <TableCell className="whitespace-normal text-xs text-muted-foreground">
        {formatEngagement(hit)}
      </TableCell>
      <TableCell className="text-xs text-muted-foreground">
        {formatRelative(hit.createdAt)}
      </TableCell>
    </TableRow>
  )
}
