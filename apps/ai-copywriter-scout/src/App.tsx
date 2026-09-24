import { useMemo, useState } from 'react'
import {
  Copy,
  ExternalLink,
  PenLine,
  Sparkles,
  Wand2,
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
import { Textarea } from '@/components/ui/textarea'
import { PRESETS, type Preset } from '@/fixtures/presets'
import {
  MODE_HINTS,
  MODE_LABELS,
  TransformError,
  transformCopy,
  type CopyMode,
} from '@/lib/transform'

const MODES: CopyMode[] = ['humanize', 'caption', 'hook', 'script-beat']

const UPSTREAM = 'https://github.com/mikiarlo3/ai-copywriter'
const SOURCE_POST =
  'https://x.com/tom_doerr/status/2102341094071583027'

export default function App() {
  const [draft, setDraft] = useState('')
  const [mode, setMode] = useState<CopyMode>('humanize')
  const [output, setOutput] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loadedPreset, setLoadedPreset] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const modeLabel = MODE_LABELS[mode]

  const canTransform = draft.trim().length > 0

  function loadPreset(preset: Preset) {
    setDraft(preset.draft)
    setLoadedPreset(preset.id)
    setOutput(null)
    setError(null)
  }

  function onTransform() {
    setError(null)
    setOutput(null)
    setCopied(false)
    try {
      const next = transformCopy(draft, mode)
      setOutput(next)
    } catch (cause) {
      setError(
        cause instanceof TransformError
          ? cause.message
          : 'Transform failed. Try shortening the draft.',
      )
    }
  }

  async function onCopy() {
    if (!output) return
    try {
      await navigator.clipboard.writeText(output)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      setError('Clipboard blocked — select the output and copy manually.')
    }
  }

  const outputPreview = useMemo(() => output ?? '', [output])

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            AI Copywriter Scout
          </h1>
          <Badge variant="outline">local mock transforms</Badge>
          <Badge variant="secondary">Proof Approve 2026-09-24</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Paste draft copy, pick a rewrite mode, and preview short-form friendly
          output in the browser. Lean demo — not the upstream skill pack and{' '}
          <strong>not</strong> a production copy API. Pairs with the
          openshorts-scout lane (clips → captions); this UI stays copy-focused.
        </p>
        <div className="flex flex-wrap gap-2 text-sm">
          <a
            href={UPSTREAM}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-primary underline-offset-4 hover:underline"
          >
            Upstream ai-copywriter
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
          <span className="text-muted-foreground">·</span>
          <a
            href={SOURCE_POST}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            Source bookmark
            <ExternalLink className="size-3.5" aria-hidden />
          </a>
        </div>
      </header>

      <Alert>
        <Sparkles className="size-4" />
        <AlertTitle>Humanizer-lineage playground</AlertTitle>
        <AlertDescription>
          Modes use deterministic heuristics (phrase swaps, line breaks, HOOK /
          BEAT / CTA scaffolding). For full{' '}
          <span className="font-mono text-xs">33-pattern</span> behavior, use the{' '}
          <a
            href={UPSTREAM}
            className="font-medium text-foreground underline-offset-4 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            upstream repo
          </a>
          .
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PenLine className="size-4" aria-hidden />
              Draft
            </CardTitle>
            <CardDescription>
              Paste marketing copy, a caption draft, or load a short-form preset.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="draft">Your text</Label>
              <Textarea
                id="draft"
                placeholder="Paste AI-ish draft copy here…"
                className="min-h-40 font-mono text-sm"
                value={draft}
                onChange={(e) => {
                  setDraft(e.target.value)
                  setLoadedPreset(null)
                  setOutput(null)
                  setError(null)
                }}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label>Sample presets</Label>
              <div className="flex flex-wrap gap-2">
                {PRESETS.map((preset) => (
                  <Button
                    key={preset.id}
                    type="button"
                    size="sm"
                    variant={
                      loadedPreset === preset.id ? 'default' : 'outline'
                    }
                    onClick={() => loadPreset(preset)}
                  >
                    {preset.label}
                  </Button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Mode</Label>
              <div className="flex flex-wrap gap-2">
                {MODES.map((m) => (
                  <Button
                    key={m}
                    type="button"
                    size="sm"
                    variant={mode === m ? 'default' : 'outline'}
                    onClick={() => setMode(m)}
                  >
                    {MODE_LABELS[m]}
                  </Button>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">{MODE_HINTS[mode]}</p>
            </div>
            <Button
              type="button"
              className="w-full sm:w-auto"
              disabled={!canTransform}
              onClick={onTransform}
            >
              <Wand2 className="size-4" aria-hidden />
              Run {modeLabel}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Output</CardTitle>
            <CardDescription>
              Copy into your editor or openshorts-scout script field.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {error ? (
              <Alert variant="destructive">
                <AlertTitle>Cannot transform</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <Textarea
              readOnly
              aria-label="Transformed output"
              className="min-h-52 font-mono text-sm"
              placeholder="Run a mode to see output here."
              value={outputPreview}
            />
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={!output}
                onClick={onCopy}
              >
                <Copy className="size-4" aria-hidden />
                {copied ? 'Copied' : 'Copy output'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <footer className="border-t pt-4 text-xs text-muted-foreground">
        bookmark-lab scout · built 2026-09-24 · mock transforms only · no API
        keys required
      </footer>
    </div>
  )
}
