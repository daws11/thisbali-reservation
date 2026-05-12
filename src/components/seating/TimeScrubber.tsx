import { SLOT_MINUTES } from '@/lib/constants'
import { fromMinutes, TIMELINE_END, TIMELINE_START, toMinutes } from '@/data/timeSlots'
import { cn } from '@/lib/cn'

const startM = toMinutes(TIMELINE_START)
const endM = toMinutes(TIMELINE_END)
const STEPS = Math.floor((endM - startM) / SLOT_MINUTES) // indices 0..STEPS

export function TimeScrubber({
  value,
  onChange,
  className,
}: {
  value: string
  onChange: (time: string) => void
  className?: string
}) {
  const index = Math.min(STEPS, Math.max(0, Math.round((toMinutes(value) - startM) / SLOT_MINUTES)))
  const display = fromMinutes(startM + index * SLOT_MINUTES)

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-baseline justify-between">
        <span className="text-sm text-muted-foreground">Floor at</span>
        <span className="font-display text-2xl font-semibold tabular-nums leading-none">{display}</span>
      </div>
      <input
        type="range"
        min={0}
        max={STEPS}
        step={1}
        value={index}
        onChange={(e) => onChange(fromMinutes(startM + Number(e.target.value) * SLOT_MINUTES))}
        className="h-2 w-full cursor-pointer appearance-none rounded-full bg-surface-elevated accent-accent"
        aria-label="Time of day"
      />
      <div className="flex justify-between text-[10px] tabular-nums text-muted-foreground">
        <span>{TIMELINE_START}</span>
        <span>13:00</span>
        <span>16:00</span>
        <span>19:00</span>
        <span>{TIMELINE_END}</span>
      </div>
    </div>
  )
}
