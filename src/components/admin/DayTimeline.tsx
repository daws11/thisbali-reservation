import { useRef } from 'react'
import { CalendarRange } from 'lucide-react'
import { SLOT_MINUTES } from '@/lib/constants'
import { fromMinutes, TIMELINE_END, TIMELINE_START, toMinutes } from '@/data/timeSlots'
import { tablesById } from '@/data/seatingMap'
import { isOpenAt } from '@/lib/availability'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/cn'
import type { Booking, BookingStatus } from '@/types'
import { EmptyState } from '@/components/ui/empty-state'

const HOUR_PX = 58
const T_START = toMinutes(TIMELINE_START)
const T_END = toMinutes(TIMELINE_END)
const HOURS = Math.round((T_END - T_START) / 60)
const TOTAL_PX = HOURS * HOUR_PX

const BLOCK_STYLE: Record<BookingStatus, { bg: string; text: string; border: string }> = {
  pending: { bg: 'color-mix(in oklab, var(--color-status-pending) 18%, var(--color-surface))', text: 'var(--color-foreground)', border: 'var(--color-status-pending)' },
  confirmed: { bg: 'color-mix(in oklab, var(--color-status-pending) 28%, var(--color-surface))', text: 'var(--color-foreground)', border: 'var(--color-status-pending)' },
  seated: { bg: 'color-mix(in oklab, var(--color-status-seated) 30%, var(--color-surface))', text: 'var(--color-foreground)', border: 'var(--color-status-seated)' },
  completed: { bg: 'color-mix(in oklab, var(--color-status-completed) 22%, var(--color-surface))', text: 'var(--color-muted-foreground)', border: 'var(--color-status-completed)' },
  cancelled: { bg: 'var(--color-surface)', text: 'var(--color-muted-foreground)', border: 'var(--color-border)' },
  'no-show': { bg: 'color-mix(in oklab, var(--color-status-noshow) 16%, var(--color-surface))', text: 'var(--color-status-cancelled)', border: 'var(--color-status-cancelled)' },
  waitlisted: { bg: 'color-mix(in oklab, var(--color-status-waitlisted) 20%, var(--color-surface))', text: 'var(--color-foreground)', border: 'var(--color-status-waitlisted)' },
}

interface Placed {
  booking: Booking
  startMin: number
  endMin: number
  lane: number
  lanes: number
}

function packLanes(bookings: Booking[]): Placed[] {
  const items = bookings
    .filter((b) => b.status !== 'cancelled' && b.mode !== 'waitlist')
    .map((b) => ({ booking: b, startMin: toMinutes(b.timeSlot), endMin: toMinutes(b.timeSlot) + b.durationMinutes }))
    .sort((a, b) => a.startMin - b.startMin || a.endMin - b.endMin)

  const result: Placed[] = []
  let group: { item: (typeof items)[number]; lane: number }[] = []
  let columns: number[] = [] // columns[i] = endMin of last item in lane i
  let groupMaxEnd = -Infinity

  const flush = () => {
    const lanes = columns.length || 1
    for (const g of group) result.push({ ...g.item, lane: g.lane, lanes })
    group = []
    columns = []
    groupMaxEnd = -Infinity
  }

  for (const it of items) {
    if (columns.length > 0 && it.startMin >= groupMaxEnd) flush()
    let lane = columns.findIndex((end) => end <= it.startMin)
    if (lane === -1) {
      lane = columns.length
      columns.push(it.endMin)
    } else {
      columns[lane] = it.endMin
    }
    group.push({ item: it, lane })
    groupMaxEnd = Math.max(groupMaxEnd, it.endMin)
  }
  if (group.length) flush()
  return result
}

export function DayTimeline({
  date,
  bookings,
  onSelect,
  onCreate,
}: {
  date: string
  bookings: Booking[]
  onSelect: (id: string) => void
  onCreate: (date: string, time: string) => void
}) {
  const ref = useRef<HTMLDivElement>(null)
  const placed = packLanes(bookings)
  const hourMarks = Array.from({ length: HOURS + 1 }, (_, i) => fromMinutes(T_START + i * 60))

  const onBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const y = e.clientY - rect.top + el.scrollTop
    const minutes = T_START + (y / HOUR_PX) * 60
    const snapped = Math.round(minutes / SLOT_MINUTES) * SLOT_MINUTES
    onCreate(date, fromMinutes(Math.min(T_END - SLOT_MINUTES, Math.max(T_START, snapped))))
  }

  if (placed.length === 0 && bookings.filter((b) => b.mode === 'waitlist').length === 0) {
    return (
      <EmptyState
        icon={<CalendarRange />}
        title={`Nothing on ${formatDate(date)}`}
        description="Click anywhere on the timeline to add a booking."
        className="cursor-pointer"
      />
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className="max-h-[70vh] overflow-y-auto" ref={ref}>
        <div className="relative grid grid-cols-[3.5rem_1fr]" style={{ height: TOTAL_PX }}>
          {/* hour gutter */}
          <div className="relative border-r border-border">
            {hourMarks.map((t, i) => (
              <div
                key={t}
                className="absolute right-2 -translate-y-1/2 text-[10px] tabular-nums text-muted-foreground"
                style={{ top: i * HOUR_PX }}
              >
                {i === 0 ? '' : t}
              </div>
            ))}
          </div>
          {/* track */}
          <div className="relative" onClick={onBackgroundClick}>
            {hourMarks.map((t, i) => {
              const open = isOpenAt(t) || isOpenAt(fromMinutes(T_START + i * 60 - 1))
              return (
                <div
                  key={t}
                  className={cn('absolute inset-x-0 border-t', i === 0 ? 'border-transparent' : 'border-border/60')}
                  style={{ top: i * HOUR_PX, height: HOUR_PX, background: open ? undefined : 'color-mix(in oklab, var(--color-background) 35%, transparent)' }}
                />
              )
            })}
            {placed.map((p) => {
              const top = ((p.startMin - T_START) / 60) * HOUR_PX
              const height = Math.max(22, ((p.endMin - p.startMin) / 60) * HOUR_PX - 2)
              const widthPct = 100 / p.lanes
              const leftPct = p.lane * widthPct
              const st = BLOCK_STYLE[p.booking.status]
              const table = p.booking.tableId ? tablesById[p.booking.tableId] : null
              const compact = p.lanes > 2 || height < 40
              return (
                <button
                  key={p.booking.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelect(p.booking.id)
                  }}
                  className="absolute overflow-hidden rounded-md border px-2 py-1 text-left text-xs transition-shadow hover:z-10 hover:shadow-lg hover:shadow-black/8"
                  style={{
                    top,
                    height,
                    left: `calc(${leftPct}% + 2px)`,
                    width: `calc(${widthPct}% - 4px)`,
                    background: st.bg,
                    borderColor: st.border,
                    color: st.text,
                  }}
                  title={`${p.booking.timeSlot} · ${p.booking.guest.name} · ${p.booking.pax}p${table ? ` · ${table.label}` : ''}`}
                >
                  <span className="block truncate font-medium tabular-nums">
                    {p.booking.timeSlot} {!compact && `· ${p.booking.pax}p`}
                  </span>
                  <span className="block truncate">{p.booking.guest.name}</span>
                  {!compact && table && <span className="block truncate text-[10px] opacity-80">Table {table.label}</span>}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
