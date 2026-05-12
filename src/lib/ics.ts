import { tablesById, tableSummary } from '@/data/seatingMap'
import { BRAND } from './constants'
import { formatMode } from './format'
import type { Booking } from '@/types'

const pad = (n: number) => String(n).padStart(2, '0')

/** Floating local date-time, e.g. "20260515T190000" (no TZID — fine for a prototype). */
function icsLocal(dateISO: string, time: string): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return `${y}${pad(m)}${pad(d)}T${pad(hh)}${pad(mm)}00`
}

function addMinutes(dateISO: string, time: string, minutes: number) {
  const [y, m, d] = dateISO.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  const dt = new Date(y, m - 1, d, hh, mm + minutes)
  return {
    date: `${dt.getFullYear()}-${pad(dt.getMonth() + 1)}-${pad(dt.getDate())}`,
    time: `${pad(dt.getHours())}:${pad(dt.getMinutes())}`,
  }
}

function utcStamp(d = new Date()): string {
  return d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')
}

export function buildIcs(booking: Booking): string {
  const end = addMinutes(booking.date, booking.timeSlot, booking.durationMinutes)
  const table = booking.tableId ? tablesById[booking.tableId] : null
  const summary = `${BRAND.name} — ${formatMode(booking.mode)} (${booking.pax} ${booking.pax === 1 ? 'guest' : 'guests'})`
  const description = [
    `Booking ${booking.id}`,
    `${booking.pax} guests`,
    table ? tableSummary(table) : 'Table to be assigned on arrival',
    booking.occasion !== 'none' ? `Occasion: ${booking.occasion}` : null,
    booking.specialRequest ? `Note: ${booking.specialRequest}` : null,
  ]
    .filter(Boolean)
    .join('\\n')

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//This Is Bali//Reservation Prototype//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${booking.id}@thisbali.local`,
    `DTSTAMP:${utcStamp()}`,
    `DTSTART:${icsLocal(booking.date, booking.timeSlot)}`,
    `DTEND:${icsLocal(end.date, end.time)}`,
    `SUMMARY:${esc(summary)}`,
    `DESCRIPTION:${esc(description)}`,
    `LOCATION:${esc(BRAND.location)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')
}

export function downloadIcs(booking: Booking): void {
  const blob = new Blob([buildIcs(booking)], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `this-is-bali-${booking.id}.ics`
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1500)
}
