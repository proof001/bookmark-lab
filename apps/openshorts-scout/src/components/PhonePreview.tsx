import { Badge } from '@/components/ui/badge'

type PhonePreviewProps = {
  hook: string
  caption: string
  active?: boolean
}

export function PhonePreview({ hook, caption, active = true }: PhonePreviewProps) {
  return (
    <div
      className={`mx-auto w-full max-w-[220px] ${active ? '' : 'opacity-60'}`}
      aria-hidden={!active}
    >
      <div className="rounded-[2rem] border-4 border-neutral-700 bg-neutral-950 p-2 shadow-xl">
        <div className="relative aspect-[9/16] overflow-hidden rounded-[1.4rem] bg-gradient-to-b from-neutral-800 via-neutral-900 to-neutral-950">
          <div className="absolute inset-x-0 top-0 z-20 px-2 pt-2">
            <p
              className="rounded-md bg-black/75 px-2 py-1 text-center text-[10px] font-semibold leading-tight text-white shadow-lg"
            >
              {hook}
            </p>
          </div>

          <div className="flex h-[48%] flex-col items-center justify-end bg-gradient-to-b from-violet-900/40 to-neutral-900 pb-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/30 bg-neutral-700 text-[10px] font-medium text-white/90"
            >
              Host
            </div>
            <span className="mt-1 text-[9px] text-white/50">Speaker A</span>
          </div>

          <div
            className="absolute inset-x-0 top-1/2 z-10 -translate-y-1/2 border-y border-white/20 bg-black/85 px-2 py-1"
          >
            <p className="text-center text-[11px] font-medium leading-snug text-white">
              {caption}
            </p>
          </div>

          <div className="absolute inset-x-0 bottom-0 flex h-[48%] flex-col items-center justify-start bg-gradient-to-t from-orange-900/35 to-neutral-900 pt-6">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-orange-400/40 bg-neutral-700 text-[10px] font-medium text-white/90"
            >
              Guest
            </div>
            <span className="mt-1 text-[9px] text-white/50">Speaker B</span>
          </div>

          <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/10" />
        </div>
      </div>
      <div className="mt-2 flex justify-center gap-1">
        <Badge variant="outline" className="text-[10px]">
          9:16
        </Badge>
        <Badge variant="secondary" className="text-[10px]">
          stacked speakers
        </Badge>
      </div>
    </div>
  )
}
