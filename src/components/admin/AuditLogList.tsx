import { formatDateTime } from '@/lib/format'
import type { AuditEntry } from '@/types'

export function AuditLogList({ entries }: { entries: AuditEntry[] }) {
  return (
    <ol className="space-y-3">
      {[...entries].reverse().map((e, i) => (
        <li key={`${e.timestamp}-${i}`} className="flex gap-3">
          <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-accent/70" aria-hidden />
          <div className="text-xs">
            <p className="text-foreground">
              <span className="font-medium capitalize">{e.action}</span> by {e.by}
            </p>
            <p className="text-muted-foreground tabular-nums">
              {formatDateTime(e.timestamp)}
              {e.note ? <span className="not-italic"> · {e.note}</span> : null}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}
