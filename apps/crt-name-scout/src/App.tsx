import { useMemo, useRef, useState, type FormEvent } from 'react'
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
  Copy,
  Download,
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
import { isValidApex, normalizeApex } from '@/lib/apex'
import { searchCrtName } from '@/lib/crt'
import {
  downloadText,
  filterRecords,
  formatFirstSeen,
  recordsToCsv,
  recordsToTxt,
  sortRecords,
  type HostRecord,
  type SortDir,
  type SortKey,
} from '@/lib/records'

type Status = 'idle' | 'loading' | 'ready' | 'error'

export default function App() {
  const [apexInput, setApexInput] = useState('')
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState<string | null>(null)
  const [records, setRecords] = useState<HostRecord[]>([])
  const [searchedApex, setSearchedApex] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('hostname')
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [copied, setCopied] = useState<string | null>(null)
  const abortRef = useRef<AbortController | null>(null)
  const copiedTimer = useRef<number | null>(null)

  const visible = useMemo(
    () => sortRecords(filterRecords(records, filter), sortKey, sortDir),
    [records, filter, sortKey, sortDir],
  )

  function flashCopied(key: string) {
    setCopied(key)
    if (copiedTimer.current !== null) {
      window.clearTimeout(copiedTimer.current)
    }
    copiedTimer.current = window.setTimeout(() => setCopied(null), 1600)
  }

  async function copyText(key: string, text: string) {
    await navigator.clipboard.writeText(text)
    flashCopied(key)
  }

  function toggleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'))
      return
    }
    setSortKey(key)
    setSortDir(key === 'date' ? 'desc' : 'asc')
  }

  async function onSearch(event: FormEvent) {
    event.preventDefault()
    const apex = normalizeApex(apexInput)
    if (!isValidApex(apex)) {
      setStatus('error')
      setError('Enter a valid apex domain (for example example.com).')
      setRecords([])
      setSearchedApex(null)
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setApexInput(apex)
    setStatus('loading')
    setError(null)
    setFilter('')
    setSearchedApex(apex)

    try {
      const next = await searchCrtName(apex, controller.signal)
      setRecords(next)
      setStatus('ready')
    } catch (cause) {
      if (controller.signal.aborted) return
      setRecords([])
      setStatus('error')
      setError(
        cause instanceof Error
          ? cause.message
          : 'Search failed. Check the domain and try again.',
      )
    }
  }

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-5xl flex-col gap-6 px-4 py-8 md:px-6">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="font-heading text-2xl font-medium tracking-tight">
            CRT Name Scout
          </h1>
          <Badge variant="outline">crt.name</Badge>
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Paste an apex domain to query crt.name&apos;s passive Certificate
          Transparency subdomain index. Filter, sort, copy, or export the hosts
          it has seen.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Search</CardTitle>
          <CardDescription>
            Scheme and path are stripped. No API key — crt.name allows about
            1,000 free requests per IP per day.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={onSearch}
            className="flex flex-col gap-3 sm:flex-row sm:items-end"
          >
            <div className="grid flex-1 gap-2">
              <Label htmlFor="apex">Apex domain</Label>
              <Input
                id="apex"
                name="apex"
                value={apexInput}
                onChange={(event) => setApexInput(event.target.value)}
                placeholder="example.com"
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
        </CardContent>
      </Card>

      {status === 'error' && error ? (
        <Alert variant="destructive">
          <AlertCircle />
          <AlertTitle>Search failed</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {status === 'loading' ? <LoadingState apex={searchedApex} /> : null}

      {status === 'ready' && searchedApex ? (
        <ResultsPanel
          apex={searchedApex}
          records={records}
          visible={visible}
          filter={filter}
          onFilter={setFilter}
          sortKey={sortKey}
          sortDir={sortDir}
          onSort={toggleSort}
          copied={copied}
          onCopyHost={(hostname) => copyText(hostname, hostname)}
          onCopyAll={() =>
            copyText(
              'all',
              visible.map((record) => record.hostname).join('\n'),
            )
          }
          onExportCsv={() =>
            downloadText(
              `${searchedApex}-crt-name.csv`,
              recordsToCsv(visible),
              'text/csv;charset=utf-8',
            )
          }
          onExportTxt={() =>
            downloadText(
              `${searchedApex}-crt-name.txt`,
              recordsToTxt(visible),
              'text/plain;charset=utf-8',
            )
          }
        />
      ) : null}

      {status === 'idle' ? (
        <Alert>
          <Info />
          <AlertTitle>Waiting for a search</AlertTitle>
          <AlertDescription>
            Try <span className="font-mono">neverssl.com</span> for a short
            list, or <span className="font-mono">example.com</span> for a large
            one.
          </AlertDescription>
        </Alert>
      ) : null}

      <p className="mt-auto text-xs text-muted-foreground">
        Results are passive Certificate Transparency index records. Hosts may no
        longer resolve, and absence from this list does not mean a name was
        never issued a certificate.
      </p>
    </div>
  )
}

function LoadingState({ apex }: { apex: string | null }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Querying crt.name</CardTitle>
        <CardDescription>
          Fetching passive CT hosts
          {apex ? (
            <>
              {' '}
              for <span className="font-mono">{apex}</span>
            </>
          ) : null}
          …
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-5/6" />
      </CardContent>
    </Card>
  )
}

function ResultsPanel({
  apex,
  records,
  visible,
  filter,
  onFilter,
  sortKey,
  sortDir,
  onSort,
  copied,
  onCopyHost,
  onCopyAll,
  onExportCsv,
  onExportTxt,
}: {
  apex: string
  records: HostRecord[]
  visible: HostRecord[]
  filter: string
  onFilter: (value: string) => void
  sortKey: SortKey
  sortDir: SortDir
  onSort: (key: SortKey) => void
  copied: string | null
  onCopyHost: (hostname: string) => void
  onCopyAll: () => void
  onExportCsv: () => void
  onExportTxt: () => void
}) {
  const emptyIndex = records.length === 0
  const emptyFilter = !emptyIndex && visible.length === 0

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle className="flex flex-wrap items-center gap-2">
          Results for <span className="font-mono">{apex}</span>
          <Badge variant="secondary">
            {visible.length === records.length
              ? `${records.length.toLocaleString()} host${records.length === 1 ? '' : 's'}`
              : `${visible.length.toLocaleString()} of ${records.length.toLocaleString()}`}
          </Badge>
        </CardTitle>
        <CardDescription>
          Client-side filter and sort. Copy or export only the filtered rows.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4 pt-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="filter">Filter hosts</Label>
            <Input
              id="filter"
              value={filter}
              onChange={(event) => onFilter(event.target.value)}
              placeholder="www, api, mail…"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              disabled={emptyIndex}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCopyAll}
              disabled={visible.length === 0}
            >
              <Copy data-icon="inline-start" />
              {copied === 'all' ? 'Copied' : 'Copy filtered'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onExportCsv}
              disabled={visible.length === 0}
            >
              <Download data-icon="inline-start" />
              CSV
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onExportTxt}
              disabled={visible.length === 0}
            >
              <Download data-icon="inline-start" />
              TXT
            </Button>
          </div>
        </div>

        {emptyIndex ? (
          <Alert>
            <Info />
            <AlertTitle>No index records</AlertTitle>
            <AlertDescription>
              crt.name returned no hosts for this apex. The name may be unused,
              or it may simply be absent from this passive index.
            </AlertDescription>
          </Alert>
        ) : null}

        {emptyFilter ? (
          <Alert>
            <Info />
            <AlertTitle>No matches</AlertTitle>
            <AlertDescription>
              Nothing in the current result set matches{' '}
              <span className="font-mono">{filter}</span>.
            </AlertDescription>
          </Alert>
        ) : null}

        {!emptyIndex && !emptyFilter ? (
          <div className="max-h-[28rem] overflow-auto rounded-lg ring-1 ring-foreground/10">
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-card">
                <TableRow>
                  <TableHead>
                    <SortButton
                      label="Hostname"
                      active={sortKey === 'hostname'}
                      dir={sortDir}
                      onClick={() => onSort('hostname')}
                    />
                  </TableHead>
                  <TableHead>
                    <SortButton
                      label="First seen"
                      active={sortKey === 'date'}
                      dir={sortDir}
                      onClick={() => onSort('date')}
                    />
                  </TableHead>
                  <TableHead className="w-16 text-right">Copy</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {visible.map((record) => (
                  <TableRow key={record.hostname}>
                    <TableCell className="font-mono text-xs md:text-sm">
                      {record.hostname}
                    </TableCell>
                    <TableCell>
                      {record.firstSeen ? (
                        <span className="font-mono text-xs md:text-sm">
                          {formatFirstSeen(record.firstSeen)}
                        </span>
                      ) : (
                        <Badge variant="outline">unknown</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Copy ${record.hostname}`}
                        onClick={() => onCopyHost(record.hostname)}
                      >
                        <Copy />
                        <span className="sr-only">
                          {copied === record.hostname ? 'Copied' : 'Copy'}
                        </span>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}

function SortButton({
  label,
  active,
  dir,
  onClick,
}: {
  label: string
  active: boolean
  dir: SortDir
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1 font-medium hover:text-foreground"
    >
      {label}
      {active ? (
        dir === 'asc' ? (
          <ArrowUp className="size-3.5" />
        ) : (
          <ArrowDown className="size-3.5" />
        )
      ) : (
        <span className="text-muted-foreground/70">↕</span>
      )}
    </button>
  )
}
