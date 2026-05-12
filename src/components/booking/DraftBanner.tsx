import { History } from 'lucide-react'

export function DraftBanner({ onDiscard }: { onDiscard: () => void }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2.5 text-sm">
      <span className="flex items-center gap-2 text-foreground">
        <History className="size-4 shrink-0 text-accent" />
        We picked up where you left off.
      </span>
      <button
        type="button"
        onClick={onDiscard}
        className="shrink-0 text-muted-foreground underline underline-offset-2 transition-colors hover:text-foreground"
      >
        Start over
      </button>
    </div>
  )
}
