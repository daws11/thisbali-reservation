import { addDays, getDay, parseISO, startOfWeek } from 'date-fns'
import { Plus } from 'lucide-react'
import { CLOSED_WEEKDAYS } from '@/lib/constants'
import { isoDate, todayISO } from '@/lib/format'
import { tablesById } from '@/data/seatingMap'
import { toMinutes } from '@/data/timeSlots'
import { StatusDot } from '@/components/ui/badge'
import { cn } from '@/lib/cn'
import type { Booking } from '@/types'

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function WeekGrid({
  anchorDate,
  bookings,
  onSelect,
  onCreate,
}: {
  anchorDate: string
  bookings: Booking[]
  onSelect: (id: string) => void
  onCreate: (date: string, time: string) => void
}) {
  const start = startOfWeek(parseISO(anchorDate), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const today = todayISO()
  const closed = CLOSED_WEEKDAYS as readonly number[]

  const byDate = new Map<string, Booking[]>()
  for (const b of bookings) {
    if (b.status === 'cancelled') continue
    const arr = byDate.get(b.date) ?? []
    arr.push(b)
    byDate.set(b.date, arr)
  }

  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <div className="grid min-w-[44rem] grid-cols-7 divide-x divide-border">
        {days.map((d) => {
          const iso = isoDate(d)
          const dayBookings = (byDate.get(iso) ?? [])
            .filter((b) => b.mode !== 'waitlist')
            .sort((a, b) => toMinutes(a.timeSlot) - toMinutes(b.timeSlot))
          const isClosed = closed.includes(getDay(d))
          const isToday = iso === today
          return (
            <div key={iso} className="flex min-h-[16rem] flex-col">
              <div
                className={cn(
                  'sticky top-0 border-b border-border bg-surface px-2.5 py-2 text-center',
                  isToday && 'bg-accent/10',
                )}
              >
                <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{DAY_LABELS[getDay(d) === 0 ? 6 : getDay(d) - 1]}</p>
                <p className={cn('font-display text-lg font-semibold tabular-nums', isToday && 'text-accent')}>{d.getDate()}</p>
              </div>
              <div className="flex flex-1 flex-col gap-1 p-1.5">
                {isClosed ? (
                  <p className="px-1 py-3 text-center text-[11px] text-muted-foreground/60">Closed</p>
                ) : dayBookings.length === 0 ? (
                  <p className="px-1 py-3 text-center text-[11px] text-muted-foreground/50">—</p>
                ) : (
                  dayBookings.map((b) => {
                    const table = b.tableId ? tablesById[b.tableId] : null
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => onSelect(b.id)}
                        className="flex items-center gap-1.5 rounded-md border border-border bg-background px-1.5 py-1 text-left text-[11px] transition-colors hover:border-accent/50 hover:bg-surface-elevated"
                        title={`${b.timeSlot} · ${b.guest.name} · ${b.pax}p${table ? ` · ${table.label}` : ''}`}
                      >
                        <StatusDot status={b.status} />
                        <span className="tabular-nums font-medium">{b.timeSlot}</span>
                        <span className="min-w-0 flex-1 truncate text-muted-foreground">{b.guest.name}</span>
                      </button>
                    )
                  })
                )}
                {!isClosed && (
                  <button
                    type="button"
                    onClick={() => onCreate(iso, '19:00')}
                    className="mt-auto flex items-center justify-center gap-1 rounded-md border border-dashed border-border py-1 text-[10px] text-muted-foreground transition-colors hover:border-accent/50 hover:text-foreground"
                  >
                    <Plus className="size-3" />
                    Add
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
