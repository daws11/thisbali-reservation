import {
  LIMITED_THRESHOLD,
  OPEN_HOURS,
  SLOT_MINUTES,
  ZONE_DURATION_MIN,
} from '@/lib/constants'
import { tables, tablesById } from '@/data/seatingMap'
import { allSlots, fromMinutes, toMinutes } from '@/data/timeSlots'
import type { Booking, BookingStatus, SlotAvailabilityLevel, Table } from '@/types'

const slotCapacityByTime: Record<string, number> = Object.fromEntries(
  allSlots.map((s) => [s.time, s.tableCapacity]),
)
export function slotCapacityAt(time: string): number {
  return slotCapacityByTime[time] ?? tables.length
}

/** Statuses that physically occupy a table. */
export const OCCUPYING_STATUSES: BookingStatus[] = ['pending', 'confirmed', 'seated']

export function tableFits(table: Pick<Table, 'capacity'>, pax: number): boolean {
  return pax >= table.capacity.min && pax <= table.capacity.max
}

export function durationForTable(tableId: string | null): number {
  if (!tableId) return ZONE_DURATION_MIN.indoor
  const zone = tablesById[tableId]?.zoneId
  return zone ? ZONE_DURATION_MIN[zone] : ZONE_DURATION_MIN.indoor
}

function bookingInterval(b: Booking): [number, number] {
  const start = toMinutes(b.timeSlot)
  return [start, start + b.durationMinutes]
}

export function intervalsOverlap(aStart: number, aEnd: number, bStart: number, bEnd: number): boolean {
  return aStart < bEnd && bStart < aEnd
}

export function bookingsOnDate(bookings: Booking[], date: string): Booking[] {
  return bookings.filter((b) => b.date === date)
}

/** Statuses worth showing on the admin floor plan (anything but cancelled/waitlisted). */
export const FLOOR_VISIBLE_STATUSES: BookingStatus[] = [
  'pending',
  'confirmed',
  'seated',
  'completed',
  'no-show',
]

/** Bookings on `tableId` whose service window covers `time` on `date`. */
export function bookingsForTableAt(
  bookings: Booking[],
  date: string,
  tableId: string,
  time: string,
  statuses: BookingStatus[] = FLOOR_VISIBLE_STATUSES,
): Booking[] {
  const t = toMinutes(time)
  return bookings.filter((b) => {
    if (b.date !== date || b.tableId !== tableId) return false
    if (!statuses.includes(b.status)) return false
    const [s, e] = bookingInterval(b)
    return t >= s && t < e
  })
}

export function bookingForTableAt(
  bookings: Booking[],
  date: string,
  tableId: string,
  time: string,
  statuses: BookingStatus[] = FLOOR_VISIBLE_STATUSES,
): Booking | undefined {
  return bookingsForTableAt(bookings, date, tableId, time, statuses)[0]
}

/** Map of tableId → booking shown on it at `time` (for the admin seating map). */
export function bookingsByTableAt(bookings: Booking[], date: string, time: string): Map<string, Booking> {
  const map = new Map<string, Booking>()
  for (const t of tables) {
    const b = bookingForTableAt(bookings, date, t.id, time)
    if (b) map.set(t.id, b)
  }
  return map
}

/** Does any occupying booking conflict with seating `table` at `time`? */
function tableConflictsAt(bookings: Booking[], date: string, table: Table, time: string): boolean {
  const start = toMinutes(time)
  const end = start + ZONE_DURATION_MIN[table.zoneId]
  return bookings.some((b) => {
    if (b.date !== date || b.tableId !== table.id) return false
    if (!OCCUPYING_STATUSES.includes(b.status)) return false
    const [s, e] = bookingInterval(b)
    return intervalsOverlap(start, end, s, e)
  })
}

/** Tables free for a booking of `pax` people starting at `time` on `date`. */
export function getAvailableTables(
  bookings: Booking[],
  date: string,
  time: string,
  pax: number,
): Table[] {
  return tables.filter((t) => tableFits(t, pax) && !tableConflictsAt(bookings, date, t, time))
}

export function getAvailableTableIds(
  bookings: Booking[],
  date: string,
  time: string,
  pax: number,
): Set<string> {
  return new Set(getAvailableTables(bookings, date, time, pax).map((t) => t.id))
}

/** Bookings that overlap `time` on `date` and consume a cover (any table or not). */
export function occupyingCountAt(bookings: Booking[], date: string, time: string): number {
  const t = toMinutes(time)
  return bookings.filter((b) => {
    if (b.date !== date) return false
    if (!OCCUPYING_STATUSES.includes(b.status)) return false
    const [s, e] = bookingInterval(b)
    return t >= s && t < e
  }).length
}

/** Physically free tables at `time` (ignores party size). */
export function getPhysicalFreeTableCount(bookings: Booking[], date: string, time: string): number {
  return tables.filter((t) => !tableConflictsAt(bookings, date, t, time)).length
}

/**
 * Effective free-table count for a slot's availability badge: the kitchen
 * throttle headroom, capped by what's physically free.
 */
export function getFreeTableCount(bookings: Booking[], date: string, time: string): number {
  const physical = getPhysicalFreeTableCount(bookings, date, time)
  const headroom = slotCapacityAt(time) - occupyingCountAt(bookings, date, time)
  return Math.max(0, Math.min(physical, headroom))
}

export function slotAvailabilityLevel(freeTableCount: number): SlotAvailabilityLevel {
  if (freeTableCount <= 0) return 'full'
  if (freeTableCount < LIMITED_THRESHOLD) return 'limited'
  return 'available'
}

export function slotLevelOn(bookings: Booking[], date: string, time: string): SlotAvailabilityLevel {
  return slotAvailabilityLevel(getFreeTableCount(bookings, date, time))
}

// ── "now" helpers (walk-in / waitlist) ──────────────────────────────────────

export function isOpenAt(time: string): boolean {
  const m = toMinutes(time)
  return (
    (m >= toMinutes(OPEN_HOURS.lunch.start) && m < toMinutes(OPEN_HOURS.lunch.end)) ||
    (m >= toMinutes(OPEN_HOURS.dinner.start) && m < toMinutes(OPEN_HOURS.dinner.end))
  )
}

/** Current clock time floored to a slot boundary, "HH:mm". */
export function nowSlot(now = new Date()): string {
  const total = now.getHours() * 60 + now.getMinutes()
  return fromMinutes(Math.floor(total / SLOT_MINUTES) * SLOT_MINUTES)
}

/** The slot to use for a walk-in/waitlist right now, or null if we're closed. */
export function currentServiceSlot(now = new Date()): string | null {
  const s = nowSlot(now)
  return isOpenAt(s) ? s : null
}
