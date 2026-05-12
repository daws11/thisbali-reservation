import { slotsByPeriod, toMinutes } from '@/data/timeSlots'
import { getFreeTableCount, slotAvailabilityLevel } from '@/lib/availability'
import { todayISO } from '@/lib/format'
import { useBookings } from '@/stores/bookingStore'
import { cn } from '@/lib/cn'
import type { MealPeriod, SlotAvailabilityLevel } from '@/types'

interface TimeSlotGridProps {
  date: string
  period: MealPeriod
  selectedTime?: string | null
  onSelect: (time: string) => void
}

const LEVEL_HINT: Record<SlotAvailabilityLevel, string> = {
  available: 'Available',
  limited: 'Few left',
  full: 'Full',
}

export function TimeSlotGrid({ date, period, selectedTime, onSelect }: TimeSlotGridProps) {
  const bookings = useBookings()
  const slots = slotsByPeriod[period]
  const isToday = date === todayISO()
  const nowMin = new Date().getHours() * 60 + new Date().getMinutes()

  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
      {slots.map((s) => {
        const past = isToday && toMinutes(s.time) <= nowMin
        const free = getFreeTableCount(bookings, date, s.time)
        const level = slotAvailabilityLevel(free)
        const disabled = past || level === 'full'
        const selected = selectedTime === s.time

        const hint = past ? 'Past' : level === 'limited' ? `${free} left` : LEVEL_HINT[level]

        return (
          <button
            key={s.time}
            type="button"
            disabled={disabled}
            aria-pressed={selected}
            onClick={() => onSelect(s.time)}
            className={cn(
              'flex flex-col items-center gap-0.5 rounded-lg border px-2 py-2.5 text-center transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              selected
                ? 'border-accent bg-accent text-background'
                : disabled
                  ? 'cursor-not-allowed border-border bg-surface/40 text-muted-foreground/50'
                  : level === 'limited'
                    ? 'border-accent/40 text-accent hover:bg-accent/10'
                    : 'border-border text-foreground hover:bg-surface-elevated',
            )}
          >
            <span className="text-sm font-medium tabular-nums">{s.time}</span>
            <span className={cn('text-[10px] leading-none', selected && 'text-background/80')}>{hint}</span>
          </button>
        )
      })}
    </div>
  )
}
