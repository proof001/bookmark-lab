import { useEffect, useState } from 'react'
import {
  Clapperboard,
  ExternalLink,
  GitBranch,
  Info,
  Sparkles,
  Tv,
  Video,
} from 'lucide-react'

import { PhonePreview } from '@/components/PhonePreview'
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
  JOB_STEPS,
  MOCK_MOMENTS,
  type ViralMoment,
} from '@/fixtures/moments'

const GITHUB = 'https://github.com/mutonby/openshorts'
const HOMEPAGE = 'https://www.openshorts.app/'

type Tab = 'clip' | 'ugc' | 'studio'
type JobStatus = 'idle' | 'running' | 'done'

function formatDuration(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return m > 0 ? `${m}:${s.toString().padStart(2, '0')}` : `0:${s.toString().padStart(2, '0')}`
}

export default function App() {
  const [tab, setTab] = useState<Tab>('clip')
  const [sourceUrl, setSourceUrl] = useState(
    'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  )
  const [jobStatus, setJobStatus] = useState<JobStatus>('idle')
  const [stepIndex, setStepIndex] = useState(0)
  const [moments, setMoments] = useState<ViralMoment[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)

  const selected =
    moments.find((m) => m.id === selectedId) ?? moments[0] ?? null

  useEffect(() => {
    if (jobStatus !== 'running') return

    const timers: number[] = []
    JOB_STEPS.forEach((_, i) => {
      timers.push(
        window.setTimeout(() => setStepIndex(i), i * 650),
      )
    })
    timers.push(
      window.setTimeout(() => {
        setMoments(MOCK_MOMENTS)
        setSelectedId(MOCK_MOMENTS[0].id)
        setJobStatus('done')
      }, JOB_STEPS.length * 650 + 400),
    )

    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [jobStatus])

  function onGenerate() {
    if (!sourceUrl.trim()) return
    setMoments([])
    setSelectedId(null)
    setStepIndex(0)
    setJobStatus('running')
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            OpenShorts Scout
          </h1>
          <Badge variant="outline">UX demo</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Mock playground for{' '}
          <a
            href={HOMEPAGE}
            className="text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            OpenShorts
          </a>
          — long-form video to viral 9:16 clips with moment detection, stacked
          speakers, captions, and studio workflows. No FFmpeg, GPU, or uploads
          here.
        </p>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <a href={GITHUB} target="_blank" rel="noreferrer">
              <GitBranch className="size-4" />
              GitHub
            </a>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <a href={HOMEPAGE} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              openshorts.app
            </a>
          </Button>
        </div>
      </header>

      <Alert>
        <Info className="size-4" />
        <AlertTitle>Demo only — no real rendering</AlertTitle>
        <AlertDescription>
          Self-host the upstream project with Docker for the full pipeline
          (Whisper, YOLO face track, subtitles, dubbing, publish).
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap gap-2 border-b border-border pb-2">
        {(
          [
            ['clip', 'Clip Generator', Clapperboard],
            ['ugc', 'AI Shorts', Sparkles],
            ['studio', 'YouTube Studio', Tv],
          ] as const
        ).map(([id, label, Icon]) => (
          <Button
            key={id}
            variant={tab === id ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setTab(id)}
          >
            <Icon className="size-4" />
            {label}
          </Button>
        ))}
      </div>

      {tab === 'clip' && (
        <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Source</CardTitle>
                <CardDescription>
                  Paste a long-form URL. Generation is simulated locally.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="source-url">Video URL</Label>
                  <Input
                    id="source-url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=…"
                  />
                </div>
                <Button
                  onClick={onGenerate}
                  disabled={jobStatus === 'running' || !sourceUrl.trim()}
                >
                  <Video className="size-4" />
                  Generate clips
                </Button>
              </CardContent>
            </Card>

            {jobStatus === 'running' && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Job progress</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {JOB_STEPS.map((step, i) => (
                    <div key={step} className="flex items-center gap-3 text-sm">
                      {i < stepIndex ? (
                        <span className="size-2 rounded-full bg-emerald-500" />
                      ) : i === stepIndex ? (
                        <span className="size-2 animate-pulse rounded-full bg-orange-500" />
                      ) : (
                        <span className="size-2 rounded-full bg-muted" />
                      )}
                      <span
                        className={
                          i <= stepIndex
                            ? 'text-foreground'
                            : 'text-muted-foreground'
                        }
                      >
                        {step}
                      </span>
                    </div>
                  ))}
                  <Skeleton className="h-2 w-full" />
                </CardContent>
              </Card>
            )}

            {jobStatus === 'done' && moments.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Viral moments</CardTitle>
                  <CardDescription>
                    {moments.length} ranked clips (mock scores)
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {moments.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setSelectedId(m.id)}
                      className={`rounded-lg border p-3 text-left transition-colors ${
                        selected?.id === m.id
                          ? 'border-orange-500/60 bg-orange-500/10'
                          : 'border-border hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <p className="font-medium text-sm">{m.title}</p>
                        <Badge variant="secondary">{m.score} score</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatDuration(m.durationSec)} · {m.reason}
                      </p>
                    </button>
                  ))}
                </CardContent>
              </Card>
            )}

            {jobStatus === 'idle' && (
              <p className="text-sm text-muted-foreground">
                Run generate to see mock job progress and sample moments.
              </p>
            )}
          </div>

          <aside className="lg:sticky lg:top-8 lg:self-start">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">9:16 preview</CardTitle>
                <CardDescription>
                  Stacked speakers + seam caption + hook overlay
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selected ? (
                  <PhonePreview
                    hook={selected.hook}
                    caption={selected.caption}
                  />
                ) : (
                  <PhonePreview
                    hook="Your hook line lands here"
                    caption="Subtitle on the speaker seam"
                    active={false}
                  />
                )}
              </CardContent>
            </Card>
          </aside>
        </div>
      )}

      {tab === 'ugc' && (
        <Card>
          <CardHeader>
            <CardTitle>AI Shorts (UGC)</CardTitle>
            <CardDescription>Light shell — not implemented in scout</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Upstream OpenShorts can generate short-form UGC-style clips from
            prompts and templates. This scout only surfaces the navigation
            pattern; wire real generation via self-hosted{' '}
            <a href={GITHUB} className="underline" target="_blank" rel="noreferrer">
              mutonby/openshorts
            </a>
            .
          </CardContent>
        </Card>
      )}

      {tab === 'studio' && (
        <Card>
          <CardHeader>
            <CardTitle>YouTube Studio</CardTitle>
            <CardDescription>Light shell — not implemented in scout</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Batch review, title/thumbnail suggestions, and publish helpers live
            in the full product. Use Docker + GPU stack locally for studio
            workflows.
          </CardContent>
        </Card>
      )}
    </div>
  )
}
