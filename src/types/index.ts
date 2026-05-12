// ─────────────────────────────────────────────────────────────────────────────
// Domain types for the This Is Bali reservation prototype.
// NOTE: no TS `enum` (tsconfig has `erasableSyntaxOnly`) — use `as const` arrays
// + string-literal unions instead.
// ─────────────────────────────────────────────────────────────────────────────

export const ZONE_IDS = ['indoor', 'terrace', 'floating', 'bar'] as const
export type ZoneId = (typeof ZONE_IDS)[number]

export const TABLE_SHAPES = ['round', 'square', 'rectangle', 'stool', 'swing'] as const
export type TableShape = (typeof TABLE_SHAPES)[number]

export const BOOKING_MODES = ['reservation', 'walk-in', 'waitlist'] as const
export type BookingMode = (typeof BOOKING_MODES)[number]

export const BOOKING_STATUSES = [
  'pending',
  'confirmed',
  'seated',
  'completed',
  'cancelled',
  'no-show',
  'waitlisted',
] as const
export type BookingStatus = (typeof BOOKING_STATUSES)[number]

export const OCCASIONS = ['none', 'birthday', 'anniversary', 'date', 'business', 'other'] as const
export type Occasion = (typeof OCCASIONS)[number]

export const MEAL_PERIODS = ['lunch', 'dinner'] as const
export type MealPeriod = (typeof MEAL_PERIODS)[number]

export type Actor = 'customer' | 'admin'

export type SlotAvailabilityLevel = 'available' | 'limited' | 'full'

export interface Bounds {
  /** all values are a percentage of the canvas (0–100) */
  x: number
  y: number
  width: number
  height: number
}

export interface Zone {
  id: ZoneId
  name: string
  description: string
  bounds: Bounds
}

export interface Table {
  id: string // e.g. "I-T1", "T-T4", "F-S2", "B-3"
  zoneId: ZoneId
  label: string // e.g. "T1", "S2", "Stool 3"
  shape: TableShape
  capacity: { min: number; max: number }
  /** centre of the table, percentage of the canvas */
  position: { x: number; y: number }
  /** size of the table glyph, percentage of the canvas */
  size: { width: number; height: number }
  features?: string[]
  combinableWith?: string[]
}

export interface TimeSlot {
  time: string // "HH:mm"
  period: MealPeriod
  /** how many tables are servable in this slot (swap target for real ops data) */
  tableCapacity: number
}

export interface GuestInfo {
  name: string
  whatsapp: string // stored normalised, e.g. "+628..."
  email?: string
}

export interface AuditEntry {
  timestamp: string // ISO datetime
  action: string // "created" | "confirmed" | "seated" | "updated" | ...
  by: Actor
  note?: string
}

export interface Booking {
  id: string // e.g. "TIB-2026-0042"
  mode: BookingMode
  status: BookingStatus
  // scheduling
  date: string // ISO date "2026-05-15"
  timeSlot: string // "19:00"
  durationMinutes: number
  // party
  pax: number
  tableId: string | null // null for waitlist / unassigned walk-in
  // guest
  guest: GuestInfo
  occasion: Occasion
  specialRequest?: string
  marketingOptIn: boolean
  // metadata
  createdAt: string
  updatedAt: string
  auditLog: AuditEntry[]
}

export interface AdminUser {
  email: string
  password: string
  name: string
}

/** Input accepted by bookingStore.createBooking — the store fills the rest. */
export type NewBookingInput = Pick<
  Booking,
  'mode' | 'date' | 'timeSlot' | 'pax' | 'tableId' | 'guest' | 'occasion' | 'marketingOptIn'
> & {
  durationMinutes?: number
  specialRequest?: string
  status?: BookingStatus
}
