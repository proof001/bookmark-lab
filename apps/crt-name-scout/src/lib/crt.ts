import { parseCrtNameText, type HostRecord } from './records'

export async function searchCrtName(
  apex: string,
  signal?: AbortSignal,
): Promise<HostRecord[]> {
  const params = new URLSearchParams({ apex, dates: '1' })
  const response = await fetch(`/api/crt/v1/search?${params.toString()}`, {
    signal,
    headers: { Accept: 'text/plain' },
  })

  if (!response.ok) {
    const body = await response.text().catch(() => '')
    const detail = body.trim().slice(0, 200)
    throw new Error(
      detail
        ? `crt.name returned ${response.status}: ${detail}`
        : `crt.name returned ${response.status}`,
    )
  }

  return parseCrtNameText(await response.text())
}
