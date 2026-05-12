import { z } from 'zod'
import { MAX_PAX, MIN_PAX } from '@/lib/constants'
import { OCCASIONS } from '@/types'

/** Accepts `08…`, `62…`, or `+62…` followed by 8–11 digits. */
export const indonesianPhoneRegex = /^(?:\+62|62|0)8\d{8,11}$/

const nameField = z.string().trim().min(2, 'Name must be at least 2 characters').max(80)
const phoneField = z
  .string()
  .trim()
  .regex(indonesianPhoneRegex, 'Enter a valid Indonesian number (e.g. 0812… or +62 812…)')
const emailField = z
  .union([z.string().trim().email('Enter a valid email address'), z.literal('')])
  .optional()

export const guestInfoSchema = z.object({
  name: nameField,
  whatsapp: phoneField,
  email: emailField,
  occasion: z.enum(OCCASIONS),
  specialRequest: z.string().trim().max(300, 'Keep it under 300 characters').optional(),
  marketingOptIn: z.boolean(),
})
export type GuestInfoValues = z.infer<typeof guestInfoSchema>

/** Trimmed-down guest details captured in walk-in / waitlist flows. */
export const quickGuestSchema = z.object({
  name: nameField,
  whatsapp: phoneField,
  email: emailField,
})
export type QuickGuestValues = z.infer<typeof quickGuestSchema>

// ── per-step slices for the reservation wizard ──────────────────────────────
export const dateStepSchema = z.object({ date: z.string().min(1, 'Choose a date') })
export const slotStepSchema = z.object({
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/, 'Choose a time'),
})
export const paxStepSchema = z.object({
  pax: z.number().int().min(MIN_PAX, `Minimum ${MIN_PAX} guest`).max(MAX_PAX, `Maximum ${MAX_PAX} guests`),
})
export const tableStepSchema = z.object({ tableId: z.string().nullable() })

export const reservationSchema = z.object({
  date: z.string().min(1),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  pax: z.number().int().min(MIN_PAX).max(MAX_PAX),
  tableId: z.string().nullable(),
  ...guestInfoSchema.shape,
})
export type ReservationValues = z.infer<typeof reservationSchema>

export const loginSchema = z.object({
  email: z.string().trim().min(1, 'Enter your email'),
  password: z.string().min(1, 'Enter your password'),
  rememberMe: z.boolean(),
})
export type LoginValues = z.infer<typeof loginSchema>

/** Admin quick-create booking (from a calendar empty slot). */
export const quickCreateSchema = z.object({
  date: z.string().min(1),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  pax: z.number().int().min(MIN_PAX).max(MAX_PAX),
  tableId: z.string().nullable(),
  name: nameField,
  whatsapp: phoneField,
  specialRequest: z.string().trim().max(300).optional(),
})
export type QuickCreateValues = z.infer<typeof quickCreateSchema>

/** Normalise an Indonesian phone number to a `+62…` form for storage / wa.me. */
export function normalisePhone(raw: string): string {
  const digits = raw.replace(/[^\d+]/g, '')
  if (digits.startsWith('+62')) return digits
  if (digits.startsWith('62')) return `+${digits}`
  if (digits.startsWith('0')) return `+62${digits.slice(1)}`
  return digits
}
