import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'
import { formatMode, formatStatus } from '@/lib/format'
import type { BookingMode, BookingStatus } from '@/types'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-none whitespace-nowrap',
  {
    variants: {
      tone: {
        neutral: 'border-border bg-surface-elevated text-muted-foreground',
        accent: 'border-accent/40 bg-accent/15 text-accent',
        outline: 'border-border text-foreground',
        success: 'border-success/40 bg-success/15 text-success',
        destructive: 'border-destructive/40 bg-destructive/15 text-destructive',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, tone, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />
}

// ── status / mode dot helpers ────────────────────────────────────────────────
const STATUS_DOT: Record<BookingStatus, string> = {
  pending: 'bg-status-pending',
  confirmed: 'bg-status-confirmed',
  seated: 'bg-status-seated',
  completed: 'bg-status-completed',
  cancelled: 'bg-status-cancelled',
  'no-show': 'bg-status-noshow',
  waitlisted: 'bg-status-waitlisted',
}

const STATUS_TEXT: Record<BookingStatus, string> = {
  pending: 'text-status-pending border-status-pending/40 bg-status-pending/10',
  confirmed: 'text-status-confirmed border-status-confirmed/40 bg-status-confirmed/10',
  seated: 'text-status-seated border-status-seated/40 bg-status-seated/10',
  completed: 'text-status-completed border-status-completed/40 bg-status-completed/10',
  cancelled: 'text-status-cancelled border-status-cancelled/40 bg-status-cancelled/10',
  'no-show': 'text-status-noshow border-status-noshow/40 bg-status-noshow/10',
  waitlisted: 'text-status-waitlisted border-status-waitlisted/40 bg-status-waitlisted/10',
}

export function StatusDot({ status, className }: { status: BookingStatus; className?: string }) {
  return <span className={cn('inline-block size-2 rounded-full', STATUS_DOT[status], className)} aria-hidden />
}

export function StatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium leading-none whitespace-nowrap',
        STATUS_TEXT[status],
        className,
      )}
    >
      <span className={cn('inline-block size-1.5 rounded-full', STATUS_DOT[status])} aria-hidden />
      {formatStatus(status)}
    </span>
  )
}

const MODE_TONE: Record<BookingMode, string> = {
  reservation: 'border-accent/40 bg-accent/12 text-accent',
  'walk-in': 'border-status-seated/40 bg-status-seated/12 text-status-seated',
  waitlist: 'border-status-waitlisted/40 bg-status-waitlisted/12 text-status-waitlisted',
}

export function ModeBadge({ mode, className }: { mode: BookingMode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium leading-none whitespace-nowrap',
        MODE_TONE[mode],
        className,
      )}
    >
      {formatMode(mode)}
    </span>
  )
}

export { badgeVariants }
