import { useMemo, useState } from 'react'
import {
  AlertCircle,
  CheckCircle2,
  Info,
  ScanSearch,
  ShieldAlert,
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
import { Textarea } from '@/components/ui/textarea'
import { SAMPLES, type SampleSkill } from '@/fixtures/samples'
import { RULES, type Severity } from '@/lib/rules'
import {
  ScanError,
  scanSkill,
  type RiskLabel,
  type ScanResult,
} from '@/lib/scan'

type Status = 'idle' | 'loading' | 'ready' | 'error'

const SEVERITY_BADGE: Record<
  Severity,
  'destructive' | 'secondary' | 'outline' | 'default'
> = {
  critical: 'destructive',
  high: 'destructive',
  medium: 'secondary',
  low: 'outline',
}

const LABEL_COPY: Record<RiskLabel, string> = {
  clean: 'No pattern hits',
  low: 'Low residual risk',
  medium: 'Review before install',
  high: 'Do not install as-is',
  critical: 'Treat as hostile',
}

export default function App() {
  const [draft, setDraft] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ScanResult | null>(null)
  const [loadedSample, setLoadedSample] = useState<string | null>(null)

  const ruleCount = RULES.length

  function loadSample(sample: SampleSkill) {
    setDraft(sample.content)
    setLoadedSample(sample.id)
    setStatus('idle')
    setError(null)
    setResult(null)
  }

  function onScan() {
    setStatus('loading')
    setError(null)
    setResult(null)

    window.setTimeout(() => {
      try {
        const next = scanSkill(draft)
        setResult(next)
        setStatus('ready')
      } catch (cause) {
        setStatus('error')
        setError(
          cause instanceof ScanError
            ? cause.message
            : 'Scan failed. Check the pasted skill and try again.',
        )
      }
    }, 180)
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            SkillSpector Scout
          </h1>
          <Badge variant="outline">local static scan</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Paste a <span className="font-mono">SKILL.md</span> and run a curated
          subset of SkillSpector-style pattern checks in the browser. This demo
          does not wrap the real <span className="font-mono">skillspector</span>{' '}
          CLI and does not call NVIDIA APIs.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Skill source</CardTitle>
          <CardDescription>
            Load a built-in fixture or paste your own markdown. Scan is
            synchronous regex — no network.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="flex flex-wrap gap-2">
            {SAMPLES.map((sample) => (
              <Button
                key={sample.id}
                type="button"
                variant={loadedSample === sample.id ? 'default' : 'outline'}
                onClick={() => loadSample(sample)}
                disabled={status === 'loading'}
              >
                {sample.label}
              </Button>
            ))}
          </div>
          {loadedSample ? (
            <p className="text-xs text-muted-foreground">
              {SAMPLES.find((sample) => sample.id === loadedSample)?.blurb}
            </p>
          ) : null}
          <div className="grid gap-2">
            <Label htmlFor="skill">SKILL.md</Label>
            <Textarea
              id="skill"
              value={draft}
              onChange={(event) => {
                setDraft(event.target.value)
                setLoadedSample(null)
              }}
              placeholder="---&#10;name: my-skill&#10;---&#10;&#10;# Instructions"
              spellCheck={false}
              disabled={status === 'loading'}
              className="min-h-56 font-mono text-xs md:text-sm"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              onClick={onScan}
              disabled={status === 'loading'}
            >
              <ScanSearch data-icon="inline-start" />
              {status === 'loading' ? 'Scanning…' : 'Scan skill'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={status === 'loading' || draft.length === 0}
              onClick={() => {
                setDraft('')
                setLoadedSample(null)
                setResult(null)
                setError(null)
                setStatus('idle')
              }}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {status === 'error' && error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Scan failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState /> : null}

      {status === 'ready' && result ? <ResultsPanel result={result} /> : null}

      {status === 'idle' ? (
        <Alert>
          <Info />
          <AlertTitle>Waiting for a scan</AlertTitle>
          <AlertDescription>
            Try <span className="font-medium">Risky: exfil + injection</span> to
            see findings, or{' '}
            <span className="font-medium">Mostly clean: meeting notes</span> for
            a quiet report.
          </AlertDescription>
        </Alert>
      ) : null}

      <RulesCatalog count={ruleCount} />

      <p className="mt-auto text-xs text-muted-foreground">
        Inspired by{' '}
        <a
          className="underline underline-offset-3 hover:text-foreground"
          href="https://github.com/NVIDIA/SkillSpector"
          target="_blank"
          rel="noreferrer"
        >
          NVIDIA SkillSpector
        </a>
        . Pattern IDs are a local subset (P1, E2, SC2, …), not a claim of
        parity. Absence of findings is not a safety guarantee.
      </p>
    </div>
  )
}

function LoadingState() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Running local rules</CardTitle>
        <CardDescription>
          Matching {RULES.length} regex patterns against the pasted skill…
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Skeleton className="h-16 w-40" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
      </CardContent>
    </Card>
  )
}

function ResultsPanel({ result }: { result: ScanResult }) {
  const empty = result.findings.length === 0
  const counts = useMemo(() => {
    const next: Record<Severity, number> = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
    }
    for (const finding of result.findings) {
      next[finding.severity] += 1
    }
    return next
  }, [result.findings])

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex flex-wrap items-center gap-2">
          Scan results
          <Badge variant={result.label === 'clean' ? 'secondary' : 'destructive'}>
            {result.label}
          </Badge>
        </CardTitle>
        <CardDescription>
          {result.scannedChars.toLocaleString()} characters · {result.ruleHits}{' '}
          rule{result.ruleHits === 1 ? '' : 's'} hit ·{' '}
          {result.findings.length.toLocaleString()} finding
          {result.findings.length === 1 ? '' : 's'}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4">
        <div className="flex flex-wrap items-end gap-6">
          <div>
            <p className="text-xs text-muted-foreground">Risk score</p>
            <p className="font-heading font-medium tabular-nums text-5xl tracking-tight">
              {result.score}
            </p>
            <p className="text-sm text-muted-foreground">
              {LABEL_COPY[result.label]}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['critical', 'high', 'medium', 'low'] as const).map((severity) => (
              <Badge key={severity} variant={SEVERITY_BADGE[severity]}>
                {severity} {counts[severity]}
              </Badge>
            ))}
          </div>
        </div>

        {empty ? (
          <Alert>
            <CheckCircle2 />
            <AlertTitle>No pattern hits</AlertTitle>
            <AlertDescription>
              None of the {RULES.length} local rules matched. This is not a
              full SkillSpector report — AST, YARA, OSV, and LLM stages are out
              of scope.
            </AlertDescription>
          </Alert>
        ) : (
          <div className="max-h-[32rem] overflow-auto rounded-lg ring-1 ring-foreground/10">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead className="w-24">Severity</TableHead>
                  <TableHead className="w-20">Rule</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Matched snippet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {result.findings.map((finding) => (
                  <TableRow key={finding.id}>
                    <TableCell>
                      <Badge variant={SEVERITY_BADGE[finding.severity]}>
                        {finding.severity}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs">
                      {finding.ruleId}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-0.5">
                        <span>{finding.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {finding.category}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-md whitespace-normal font-mono text-xs">
                      {finding.snippet}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function RulesCatalog({ count }: { count: number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex flex-wrap items-center gap-2">
          <ShieldAlert className="size-4" />
          Rule catalog
          <Badge variant="secondary">{count} local rules</Badge>
        </CardTitle>
        <CardDescription>
          Transparent regex/string checks implemented in this app. IDs echo
          SkillSpector categories; matching is ours, not NVIDIA&apos;s.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-h-72 overflow-auto rounded-lg ring-1 ring-foreground/10">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-card">
              <TableRow>
                <TableHead className="w-16">ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead className="w-24">Severity</TableHead>
                <TableHead>What it looks for</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RULES.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-mono text-xs">{rule.id}</TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5">
                      <span>{rule.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {rule.category}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={SEVERITY_BADGE[rule.severity]}>
                      {rule.severity}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-lg whitespace-normal text-xs text-muted-foreground">
                    {rule.description}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
