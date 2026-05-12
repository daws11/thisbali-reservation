import type { MealPeriod, ZoneId } from '@/types'

/** Operating windows. Slots are generated from start (inclusive) to end (exclusive). */
export const OPEN_HOURS: Record<MealPeriod, { start: string; end: string }> = {
  lunch: { start: '11:00', end: '15:00' },
  dinner: { start: '17:00', end: '22:00' },
}

export const SLOT_MINUTES = 30

/** Default seating duration; overridden per zone below. */
export const BOOKING_DURATION_MIN = 90

export const ZONE_DURATION_MIN: Record<ZoneId, number> = {
  indoor: 90,
  terrace: 90,
  floating: 90,
  bar: 60,
}

/** date-fns getDay(): 0 = Sunday … 6 = Saturday. Empty ⇒ open every day. */
export const CLOSED_WEEKDAYS: readonly number[] = []

export const MIN_PAX = 1
export const MAX_PAX = 12
export const LARGE_PARTY_THRESHOLD = 8

export const MAX_ADVANCE_DAYS = 60

/** Fewer than this many free tables in a slot ⇒ "limited". */
export const LIMITED_THRESHOLD = 3

/** Mock restaurant WhatsApp number (E.164, no leading "+"). */
export const WA_NUMBER = '6281234567890'

export const BRAND = {
  name: 'This Is Bali',
  shortName: 'TIB',
  tagline: 'Balinese Food & Desserts • Ubud',
  location: 'Jl. Raya Ubud No.88, Ubud, Gianyar, Bali 80571',
  hours: 'Open daily · Lunch 11:00–15:00 · Dinner 17:00–22:00',
  phoneDisplay: '+62 812-3456-7890',
  instagram: '@thisbali.ubud',
} as const

export const ADMIN_CREDENTIALS_HINT = 'admin@thisbali.com / bali2026'
