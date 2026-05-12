import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { useShallow } from 'zustand/react/shallow'

import { buildSeedBookings, SEED_SEQ_END } from '@/data/seedBookings'
import { canTransition, initialStatus } from '@/lib/bookingStatus'
import { durationForTable } from '@/lib/availability'
import { makeBookingId } from '@/lib/id'
import { formatStatus } from '@/lib/format'
import type { Actor, AuditEntry, Booking, BookingStatus, NewBookingInput } from '@/types'

interface BookingState {
  bookings: Booking[]
  draft: Partial<Booking> | null
  seq: number

  createBooking: (input: NewBookingInput, by?: Actor) => Booking
  updateBooking: (id: string, patch: Partial<Booking>, by: Actor, note?: string) => boolean
  transitionStatus: (id: string, to: BookingStatus, by: Actor, note?: string) => boolean
  cancelBooking: (id: string, by: Actor, note?: string) => boolean

  setDraft: (patch: Partial<Booking>) => void
  resetDraft: (init?: Partial<Booking>) => void
  clearDraft: () => void

  resetDemoData: () => void
}

const nowISO = () => new Date().toISOString()

function freshSeed(): Booking[] {
  return buildSeedBookings().map((b) => ({ ...b, auditLog: [...b.auditLog] }))
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set, get) => ({
      bookings: freshSeed(),
      draft: null,
      seq: SEED_SEQ_END,

      createBooking: (input, by = 'customer') => {
        const seq = get().seq + 1
        const ts = nowISO()
        const status = input.status ?? initialStatus(input.mode)
        const durationMinutes = input.durationMinutes ?? durationForTable(input.tableId)
        const booking: Booking = {
          id: makeBookingId(seq),
          mode: input.mode,
          status,
          date: input.date,
          timeSlot: input.timeSlot,
          durationMinutes,
          pax: input.pax,
          tableId: input.tableId,
          guest: { ...input.guest },
          occasion: input.occasion,
          ...(input.specialRequest ? { specialRequest: input.specialRequest } : {}),
          marketingOptIn: input.marketingOptIn,
          createdAt: ts,
          updatedAt: ts,
          auditLog: [{ timestamp: ts, action: 'created', by }],
        }
        set({ bookings: [...get().bookings, booking], seq })
        return booking
      },

      updateBooking: (id, patch, by, note) => {
        const current = get().bookings.find((b) => b.id === id)
        if (!current) return false

        const statusChanged = patch.status !== undefined && patch.status !== current.status
        if (statusChanged && !canTransition(current.status, patch.status!)) return false

        const ts = nowISO()
        const action = statusChanged ? formatStatus(patch.status!).toLowerCase() : 'updated'
        const entry: AuditEntry = { timestamp: ts, action, by, ...(note ? { note } : {}) }
        const updated: Booking = {
          ...current,
          ...patch,
          guest: patch.guest ? { ...current.guest, ...patch.guest } : current.guest,
          updatedAt: ts,
          auditLog: [...current.auditLog, entry],
        }
        set({ bookings: get().bookings.map((b) => (b.id === id ? updated : b)) })
        return true
      },

      transitionStatus: (id, to, by, note) => get().updateBooking(id, { status: to }, by, note),

      cancelBooking: (id, by, note) => get().updateBooking(id, { status: 'cancelled' }, by, note),

      setDraft: (patch) => set({ draft: { ...(get().draft ?? {}), ...patch } }),
      resetDraft: (init) => set({ draft: { ...(init ?? {}) } }),
      clearDraft: () => set({ draft: null }),

      resetDemoData: () => set({ bookings: freshSeed(), seq: SEED_SEQ_END, draft: null }),
    }),
    {
      name: 'tib-bookings',
      version: 1,
      partialize: (s) => ({ bookings: s.bookings, draft: s.draft, seq: s.seq }),
    },
  ),
)

// ── selector hooks ───────────────────────────────────────────────────────────
export function useBookings(): Booking[] {
  return useBookingStore((s) => s.bookings)
}

export function useBookingById(id: string | undefined): Booking | undefined {
  return useBookingStore((s) => (id ? s.bookings.find((b) => b.id === id) : undefined))
}

export function useBookingsOnDate(date: string): Booking[] {
  return useBookingStore(useShallow((s) => s.bookings.filter((b) => b.date === date)))
}

export function useDraft(): Partial<Booking> | null {
  return useBookingStore((s) => s.draft)
}
