import type { BookingMode, BookingStatus } from '@/types'

/** Allowed status transitions (the state machine from the PRD §7.5). */
export const ALLOWED_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  waitlisted: ['confirmed', 'cancelled'],
  confirmed: ['seated', 'cancelled'],
  seated: ['completed', 'no-show'],
  completed: [],
  cancelled: [],
  'no-show': [],
}

export function initialStatus(mode: BookingMode): BookingStatus {
  if (mode === 'walk-in') return 'confirmed'
  if (mode === 'waitlist') return 'waitlisted'
  return 'pending'
}

export function canTransition(from: BookingStatus, to: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[from]?.includes(to) ?? false
}

export function isTerminal(status: BookingStatus): boolean {
  return ALLOWED_TRANSITIONS[status].length === 0
}

export type StatusActionVariant = 'primary' | 'secondary' | 'destructive'

export interface StatusAction {
  label: string
  to: BookingStatus
  variant: StatusActionVariant
}

const ACTION_LABEL: Record<BookingStatus, string> = {
  pending: 'Set Pending',
  confirmed: 'Confirm',
  seated: 'Mark as Seated',
  completed: 'Mark as Completed',
  cancelled: 'Cancel',
  'no-show': 'Mark as No-show',
  waitlisted: 'Move to Waitlist',
}

const ACTION_VARIANT: Record<BookingStatus, StatusActionVariant> = {
  pending: 'secondary',
  confirmed: 'primary',
  seated: 'primary',
  completed: 'primary',
  cancelled: 'destructive',
  'no-show': 'destructive',
  waitlisted: 'secondary',
}

/** Buttons to render in the booking detail drawer for the current status. */
export function nextActions(status: BookingStatus): StatusAction[] {
  return ALLOWED_TRANSITIONS[status].map((to) => ({
    label: ACTION_LABEL[to],
    to,
    variant: ACTION_VARIANT[to],
  }))
}
