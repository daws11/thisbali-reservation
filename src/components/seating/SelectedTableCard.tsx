import { prettyFeature, zonesById } from '@/data/seatingMap'
import { formatPaxRange } from '@/lib/format'
import { Button } from '@/components/ui/button'
import type { Table } from '@/types'

export function SelectedTableCard({ table, onChange }: { table: Table; onChange?: () => void }) {
  const zone = zonesById[table.zoneId]
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/10 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-sm font-semibold text-background tabular-nums">
          {table.label}
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium">
            {zone?.name} · {table.label}
          </p>
          <p className="truncate text-xs text-muted-foreground">
            Seats {formatPaxRange(table)}
            {table.features?.length ? ` · ${table.features.map(prettyFeature).join(', ')}` : ''}
          </p>
        </div>
      </div>
      {onChange && (
        <Button variant="link" size="sm" onClick={onChange} className="shrink-0">
          Change
        </Button>
      )}
    </div>
  )
}
