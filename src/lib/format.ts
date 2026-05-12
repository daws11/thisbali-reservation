import { format, parseISO } from 'date-fns'
import type { Table } from '@/types'

/** "2026-05-15" → "Fri, 15 May 2026" */
export function formatDate(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'EEE, d MMM yyyy')
  } catch {
    return isoDate
  }
}

/** "2026-05-15" → "Fri 15 May" */
export function formatDateShort(isoDate: string): string {
  try {
    return format(parseISO(isoDate), 'EEE d MMM')
  } catch {
    return isoDate
  }
}

/** Pass-through; kept as a seam in case 12h formatting is wanted later. */
export function formatTime(time: string): string {
  return time
}

/** ISO datetime → "14:32 · 15 May" */
export function formatDateTime(iso: string): string {
  try {
    return format(parseISO(iso), "HH:mm '·' d MMM")
  } catch {
    return iso
  }
}

export function formatPaxRange(table: Pick<Table, 'capacity'>): string {
  const { min, max } = table.capacity
  return min === max ? `${max}` : `${min}–${max}`
}

export function formatPaxLabel(pax: number): string {
  return `${pax} ${pax === 1 ? 'guest' : 'guests'}`
}

/** "2026-05-15" → today's ISO date string in local time. */
export function todayISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function isoDate(date: Date): string {
  return format(date, 'yyyy-MM-dd')
}

/** Compact mode label for badges. */
export function formatMode(mode: 'reservation' | 'walk-in' | 'waitlist'): string {
  return mode === 'walk-in' ? 'Walk-in' : mode === 'waitlist' ? 'Waitlist' : 'Reservation'
}

export function formatStatus(status: string): string {
  return status === 'no-show'
    ? 'No-show'
    : status.charAt(0).toUpperCase() + status.slice(1)
}

export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}
