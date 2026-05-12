import { Pencil } from 'lucide-react'
import { prettyFeature, tablesById, zonesById } from '@/data/seatingMap'
import { formatDate, formatPaxLabel, formatPaxRange } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { Occasion } from '@/types'
import { OCCASION_LABELS } from '@/lib/occasions'

export type ReviewEditSection = 'date' | 'time' | 'pax' | 'table' | 'guest'

interface ReviewSummaryProps {
  date?: string
  timeSlot?: string
  pax?: number
  tableId?: string | null
  guest?: { name?: string; whatsapp?: string; email?: string }
  occasion?: Occasion
  specialRequest?: string
  marketingOptIn?: boolean
  onEdit?: (section: ReviewEditSection) => void
  className?: string
}

function Row({
  label,
  value,
  onEdit,
}: {
  label: string
  value: React.ReactNode
  onEdit?: () => void
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
        <dd className="mt-0.5 text-sm text-foreground">{value}</dd>
      </div>
      {onEdit && (
        <button
          type="button"
          onClick={onEdit}
          className="flex shrink-0 items-center gap-1 rounded-md px-1.5 py-1 text-xs text-accent transition-colors hover:bg-accent/10"
        >
          <Pencil className="size-3" />
          Edit
        </button>
      )}
    </div>
  )
}

export function ReviewSummary({
  date,
  timeSlot,
  pax,
  tableId,
  guest,
  occasion,
  specialRequest,
  onEdit,
  className,
}: ReviewSummaryProps) {
  const table = tableId ? tablesById[tableId] : null
  const tableText = table
    ? `${zonesById[table.zoneId]?.name} · ${table.label} · Seats ${formatPaxRange(table)}${
        table.features?.length ? ` · ${table.features.map(prettyFeature).join(', ')}` : ''
      }`
    : 'Best available — we’ll assign a table'

  return (
    <dl className={cn('divide-y divide-border rounded-2xl border border-border bg-surface px-4', className)}>
      {date && <Row label="Date" value={formatDate(date)} onEdit={onEdit ? () => onEdit('date') : undefined} />}
      {timeSlot && (
        <Row label="Time" value={<span className="tabular-nums">{timeSlot}</span>} onEdit={onEdit ? () => onEdit('time') : undefined} />
      )}
      {pax != null && (
        <Row label="Party size" value={formatPaxLabel(pax)} onEdit={onEdit ? () => onEdit('pax') : undefined} />
      )}
      <Row label="Table" value={tableText} onEdit={onEdit ? () => onEdit('table') : undefined} />
      {guest?.name && (
        <Row
          label="Guest"
          value={
            <span>
              {guest.name}
              <span className="block text-muted-foreground tabular-nums">{guest.whatsapp}</span>
              {guest.email && <span className="block text-muted-foreground">{guest.email}</span>}
            </span>
          }
          onEdit={onEdit ? () => onEdit('guest') : undefined}
        />
      )}
      {occasion && occasion !== 'none' && (
        <Row label="Occasion" value={OCCASION_LABELS[occasion]} onEdit={onEdit ? () => onEdit('guest') : undefined} />
      )}
      {specialRequest && (
        <Row label="Special request" value={specialRequest} onEdit={onEdit ? () => onEdit('guest') : undefined} />
      )}
    </dl>
  )
}
