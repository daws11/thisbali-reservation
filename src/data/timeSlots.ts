import { OPEN_HOURS, SLOT_MINUTES } from '@/lib/constants'
import type { MealPeriod, TimeSlot } from '@/types'
import { tables } from './seatingMap'

export function toMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export function fromMinutes(total: number): string {
  const h = Math.floor(total / 60)
  const m = total % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

// A simple per-service "kitchen throttle": the floor has ~24 tables, but only
// so many covers can be turned per slot. Peak dinner slots are tighter — this
// is what produces "limited" / "full" availability badges in the UI.
const PEAK_DINNER = new Set(['18:00', '18:30', '19:00', '19:30', '20:00', '20:30'])
function capacityFor(time: string, period: MealPeriod): number {
  if (period === 'dinner' && PEAK_DINNER.has(time)) return 9
  return Math.min(14, tables.length)
}

function generatePeriod(period: MealPeriod): TimeSlot[] {
  const { start, end } = OPEN_HOURS[period]
  const startM = toMinutes(start)
  const endM = toMinutes(end)
  const out: TimeSlot[] = []
  for (let m = startM; m < endM; m += SLOT_MINUTES) {
    const time = fromMinutes(m)
    out.push({ time, period, tableCapacity: capacityFor(time, period) })
  }
  return out
}

export const lunchSlots: TimeSlot[] = generatePeriod('lunch')
export const dinnerSlots: TimeSlot[] = generatePeriod('dinner')
export const allSlots: TimeSlot[] = [...lunchSlots, ...dinnerSlots]

export const slotsByPeriod: Record<MealPeriod, TimeSlot[]> = {
  lunch: lunchSlots,
  dinner: dinnerSlots,
}

export const slotTimes: string[] = allSlots.map((s) => s.time)

export function periodOf(time: string): MealPeriod | null {
  const m = toMinutes(time)
  if (m >= toMinutes(OPEN_HOURS.lunch.start) && m < toMinutes(OPEN_HOURS.lunch.end)) return 'lunch'
  if (m >= toMinutes(OPEN_HOURS.dinner.start) && m < toMinutes(OPEN_HOURS.dinner.end)) return 'dinner'
  return null
}

/** Timeline bounds for the admin calendar day view + seating map scrubber. */
export const TIMELINE_START = '10:00'
export const TIMELINE_END = '23:00'
