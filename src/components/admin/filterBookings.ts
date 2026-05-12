import { addDays, isAfter, isBefore, parseISO, startOfWeek } from 'date-fns'
import { isoDate } from '@/lib/format'
import type { Booking, BookingMode, BookingStatus } from '@/types'

export interface ListFilters {
  search: string
  statuses: BookingStatus[]
  modes: BookingMode[]
}

export type DateScope = 'day' | 'week' | 'upcoming' | 'all'

export function matchesFilters(b: Booking, f: ListFilters): boolean {
  if (f.statuses.length && !f.statuses.includes(b.status)) return false
  if (f.modes.length && !f.modes.includes(b.mode)) return false
  const q = f.search.trim().toLowerCase()
  if (q) {
    const phone = b.guest.whatsapp.replace(/[^\d+]/g, '')
    const qPhone = q.replace(/[^\d+]/g, '')
    const hit =
      b.guest.name.toLowerCase().includes(q) ||
      b.id.toLowerCase().includes(q) ||
      (qPhone.length >= 3 && phone.includes(qPhone))
    if (!hit) return false
  }
  return true
}

export function inDateScope(b: Booking, scope: DateScope, anchorISO: string): boolean {
  if (scope === 'all') return true
  if (scope === 'day') return b.date === anchorISO
  const anchor = parseISO(anchorISO)
  const date = parseISO(b.date)
  if (scope === 'upcoming') return !isBefore(date, parseISO(isoDate(new Date())))
  // week containing the anchor (Mon–Sun)
  const start = startOfWeek(anchor, { weekStartsOn: 1 })
  const end = addDays(start, 7)
  return !isBefore(date, start) && isBefore(date, end)
}

/** Sort key: chronological by date+time. */
export function compareByDateTime(a: Booking, b: Booking): number {
  return (a.date + a.timeSlot).localeCompare(b.date + b.timeSlot)
}

export function isAfterToday(iso: string): boolean {
  return isAfter(parseISO(iso), parseISO(isoDate(new Date())))
}
