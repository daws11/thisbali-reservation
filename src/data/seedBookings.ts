import { addDays, getDay, subDays } from 'date-fns'
import { CLOSED_WEEKDAYS, ZONE_DURATION_MIN } from '@/lib/constants'
import { isoDate } from '@/lib/format'
import { makeBookingId } from '@/lib/id'
import { toMinutes } from './timeSlots'
import { tablesById } from './seatingMap'
import type { AuditEntry, Booking, BookingMode, BookingStatus, Occasion } from '@/types'

const SEED_ID_BASE = 11 // first generated seed id → TIB-<year>-0012

function openDatesFrom(start: Date, count: number): string[] {
  const closed = CLOSED_WEEKDAYS as readonly number[]
  const out: string[] = []
  let d = start
  let guard = 0
  while (out.length < count && guard++ < 30) {
    if (!closed.includes(getDay(d))) out.push(isoDate(d))
    d = addDays(d, 1)
  }
  return out
}

function nowMinutes(): number {
  const n = new Date()
  return n.getHours() * 60 + n.getMinutes()
}

interface SeedSpec {
  d: number // index into service dates
  time: string
  pax: number
  table: string | null
  mode?: BookingMode
  status?: BookingStatus // explicit override; otherwise derived
  name: string
  occasion?: Occasion
  email?: string
  special?: string
  marketing?: boolean
}

const SPECS: SeedSpec[] = [
  // ── Today ──────────────────────────────────────────────────────────────────
  { d: 0, time: '12:00', pax: 2, table: 'I-T1', name: 'Made Wijaya' },
  { d: 0, time: '12:30', pax: 4, table: 'T-T1', name: 'The Hartono Family', occasion: 'birthday', special: 'Small cake for our daughter, candle if possible' },
  { d: 0, time: '13:00', pax: 1, table: 'B-1', mode: 'walk-in', name: 'Alex Müller' },
  { d: 0, time: '13:30', pax: 2, table: 'F-S1', name: 'Putri & Dewa', occasion: 'anniversary' },
  { d: 0, time: '14:00', pax: 5, table: 'I-T7', status: 'no-show', name: 'Sophie Laurent', occasion: 'business', special: 'One vegetarian in the group' },
  { d: 0, time: '18:00', pax: 8, table: 'T-T6', name: 'Kadek Surya', occasion: 'birthday', special: 'Surprise cake at 20:30 — please dim the lights', marketing: true },
  { d: 0, time: '18:00', pax: 4, table: 'I-T5', name: 'James & Olivia', occasion: 'date' },
  { d: 0, time: '18:30', pax: 3, table: 'T-T2', name: 'Wayan Astuti' },
  { d: 0, time: '18:30', pax: 2, table: 'F-S2', mode: 'walk-in', name: 'Hiroshi Tanaka' },
  { d: 0, time: '19:00', pax: 4, table: 'I-T6', name: 'The Robinsons', occasion: 'anniversary', email: 'robinsons@example.com', marketing: true },
  { d: 0, time: '19:00', pax: 6, table: 'T-T5', name: 'Komang Adi', occasion: 'business' },
  { d: 0, time: '19:00', pax: 2, table: 'F-S3', name: 'Lukas Schmidt', occasion: 'date', email: 'lukas@example.com' },
  { d: 0, time: '19:30', pax: 2, table: 'I-T3', name: 'Ni Luh Sari' },
  { d: 0, time: '20:00', pax: 1, table: 'B-2', mode: 'walk-in', name: 'Emma Brown' },
  { d: 0, time: '20:00', pax: 2, table: 'I-T2', status: 'pending', name: 'Daniel Lee' },
  // Today's waitlist queue (no table assigned)
  { d: 0, time: '19:00', pax: 2, table: null, mode: 'waitlist', name: 'Citra Lestari' },
  { d: 0, time: '19:00', pax: 4, table: null, mode: 'waitlist', name: 'Tom Anderson', email: 'tom@example.com' },
  { d: 0, time: '19:30', pax: 3, table: null, mode: 'waitlist', name: 'Yusuke Mori' },

  // ── Tomorrow (next open day) ───────────────────────────────────────────────
  { d: 1, time: '12:00', pax: 2, table: 'I-T2', name: 'Gede Pratama' },
  { d: 1, time: '13:00', pax: 5, table: 'I-T7', name: 'Putu Yoga', special: 'Celebrating a graduation' },
  { d: 1, time: '18:30', pax: 3, table: 'I-T6', name: 'Eka Suputra' },
  { d: 1, time: '19:00', pax: 4, table: 'T-T1', name: 'The Williams Party', occasion: 'birthday' },
  { d: 1, time: '19:00', pax: 4, table: 'I-T5', name: 'Yuki Sato', occasion: 'date' },
  { d: 1, time: '19:00', pax: 2, table: 'F-S1', name: 'Anya Petrova', occasion: 'anniversary', status: 'pending' },
  { d: 1, time: '19:30', pax: 7, table: 'T-T6', name: 'Bagus Mahendra', occasion: 'business', special: 'Need 2 high chairs' },
  { d: 1, time: '20:00', pax: 4, table: 'T-T3', name: 'The Garcias' },

  // ── Day after ──────────────────────────────────────────────────────────────
  { d: 2, time: '12:30', pax: 4, table: 'T-T2', name: 'Ketut Wirawan' },
  { d: 2, time: '19:00', pax: 6, table: 'T-T5', name: 'Linda Park', occasion: 'birthday', status: 'pending' },
  { d: 2, time: '19:30', pax: 2, table: 'I-T1', name: 'Marco Rossi', occasion: 'date' },

  // ── +3 days ────────────────────────────────────────────────────────────────
  { d: 3, time: '18:00', pax: 4, table: 'I-T5', name: 'Sari Indah', status: 'pending' },
  { d: 3, time: '19:30', pax: 8, table: 'T-T6', name: 'The Nguyen Reunion', occasion: 'other', special: 'Family reunion — 8 adults' },
]

function durationFor(tableId: string | null): number {
  if (!tableId) return ZONE_DURATION_MIN.indoor
  const zone = tablesById[tableId]?.zoneId
  return zone ? ZONE_DURATION_MIN[zone] : ZONE_DURATION_MIN.indoor
}

function deriveStatus(spec: SeedSpec, dateIdx: number, durationMin: number): BookingStatus {
  if (spec.status) return spec.status
  const mode = spec.mode ?? 'reservation'
  if (mode === 'waitlist') return 'waitlisted'
  if (dateIdx > 0) return mode === 'walk-in' ? 'confirmed' : 'confirmed'
  // Today — make it feel live.
  const now = nowMinutes()
  const start = toMinutes(spec.time)
  const end = start + durationMin
  if (end <= now) return 'completed'
  if (start <= now && now < end) return 'seated'
  return mode === 'walk-in' ? 'confirmed' : 'confirmed'
}

function isoAt(dateISO: string, time: string): string {
  const [y, m, d] = dateISO.split('-').map(Number)
  const [hh, mm] = time.split(':').map(Number)
  return new Date(y, m - 1, d, hh, mm).toISOString()
}

function bump(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60_000).toISOString()
}

function buildAuditLog(
  status: BookingStatus,
  mode: BookingMode,
  createdAtISO: string,
): AuditEntry[] {
  const log: AuditEntry[] = [
    { timestamp: createdAtISO, action: 'created', by: mode === 'walk-in' ? 'admin' : 'customer' },
  ]
  let last = createdAtISO
  const step = (mins: number) => (last = bump(last, mins))

  if (mode === 'reservation' && ['confirmed', 'seated', 'completed', 'no-show'].includes(status)) {
    log.push({ timestamp: step(25), action: 'confirmed', by: 'admin' })
  }
  if (['seated', 'completed'].includes(status)) {
    log.push({ timestamp: step(60 * 6), action: 'seated', by: 'admin' })
  }
  if (status === 'completed') {
    log.push({ timestamp: step(95), action: 'completed', by: 'admin' })
  }
  if (status === 'no-show') {
    log.push({ timestamp: step(60 * 8), action: 'no-show', by: 'admin', note: 'Party did not arrive' })
  }
  return log
}

let _cache: Booking[] | null = null

/** Build the demo bookings, anchored to the current date. */
export function buildSeedBookings(): Booking[] {
  if (_cache) return _cache
  const dates = openDatesFrom(new Date(), 4)
  const out: Booking[] = []
  let seq = SEED_ID_BASE

  for (const spec of SPECS) {
    seq += 1
    const mode = spec.mode ?? 'reservation'
    const date = dates[Math.min(spec.d, dates.length - 1)]
    const durationMinutes = durationFor(spec.table)
    const status = deriveStatus(spec, spec.d, durationMinutes)

    // reservations are booked a couple of days ahead; walk-ins/waitlist same day
    const createdAt =
      mode === 'reservation'
        ? isoAt(isoDate(subDays(new Date(date), 2)), '10:30')
        : isoAt(date, spec.time)
    const auditLog = buildAuditLog(status, mode, createdAt)
    const updatedAt = auditLog[auditLog.length - 1].timestamp

    out.push({
      id: makeBookingId(seq),
      mode,
      status,
      date,
      timeSlot: spec.time,
      durationMinutes,
      pax: spec.pax,
      tableId: spec.table,
      guest: {
        name: spec.name,
        whatsapp: `+62812${String(34000000 + seq * 137).padStart(8, '0')}`,
        ...(spec.email ? { email: spec.email } : {}),
      },
      occasion: spec.occasion ?? 'none',
      ...(spec.special ? { specialRequest: spec.special } : {}),
      marketingOptIn: spec.marketing ?? false,
      createdAt,
      updatedAt,
      auditLog,
    })
  }

  _cache = out
  return out
}

/** Highest sequence number used by the seed (so the store continues from there). */
export const SEED_SEQ_END = SEED_ID_BASE + SPECS.length
