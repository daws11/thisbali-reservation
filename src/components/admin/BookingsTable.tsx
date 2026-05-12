import { ArrowDown, ArrowUp, CalendarX2, EllipsisVertical, StickyNote } from 'lucide-react'
import { tablesById } from '@/data/seatingMap'
import { nextActions } from '@/lib/bookingStatus'
import { formatPaxLabel } from '@/lib/format'
import { ModeBadge, StatusBadge } from '@/components/ui/badge'
import { EmptyState } from '@/components/ui/empty-state'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Booking, BookingStatus } from '@/types'

const GRID =
  'grid-cols-[5.5rem_minmax(0,1fr)_3rem_4.5rem_6.25rem_6.75rem_2.5rem]'

function RowMenu({
  booking,
  onAction,
  onOpen,
}: {
  booking: Booking
  onAction: (id: string, to: BookingStatus) => void
  onOpen: () => void
}) {
  const actions = nextActions(booking.status)
  return (
    <span onClick={(e) => e.stopPropagation()}>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label="Booking actions"
            className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-surface hover:text-foreground"
          >
            <EllipsisVertical className="size-4" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onSelect={onOpen}>Open details</DropdownMenuItem>
          {actions.length > 0 && <DropdownMenuSeparator />}
          {actions.map((a) => (
            <DropdownMenuItem
              key={a.to}
              destructive={a.variant === 'destructive'}
              onSelect={() => onAction(booking.id, a.to)}
            >
              {a.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </span>
  )
}

function BookingRow({
  booking,
  onClick,
  onAction,
}: {
  booking: Booking
  onClick: () => void
  onAction: (id: string, to: BookingStatus) => void
}) {
  const table = booking.tableId ? tablesById[booking.tableId] : null
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter') onClick()
        }}
        className="cursor-pointer transition-colors hover:bg-surface-elevated focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent"
      >
        {/* desktop */}
        <div className={`hidden items-center gap-3 px-4 py-2.5 text-sm md:grid ${GRID}`}>
          <span className="font-medium tabular-nums">{booking.timeSlot}</span>
          <span className="flex min-w-0 items-center gap-1.5">
            <span className="truncate">{booking.guest.name}</span>
            {booking.specialRequest && (
              <StickyNote className="size-3.5 shrink-0 text-accent" aria-label="Has a special request" />
            )}
          </span>
          <span className="tabular-nums text-muted-foreground">{booking.pax}</span>
          <span className="text-muted-foreground">{table ? table.label : '—'}</span>
          <ModeBadge mode={booking.mode} />
          <StatusBadge status={booking.status} />
          <RowMenu booking={booking} onAction={onAction} onOpen={onClick} />
        </div>
        {/* mobile */}
        <div className="flex flex-col gap-1.5 px-4 py-3 md:hidden">
          <div className="flex items-center gap-2">
            <span className="font-display text-base font-semibold tabular-nums">{booking.timeSlot}</span>
            <span className="min-w-0 flex-1 truncate font-medium">{booking.guest.name}</span>
            <StatusBadge status={booking.status} />
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
            <span>{formatPaxLabel(booking.pax)}</span>
            <span>{table ? `Table ${table.label}` : 'No table'}</span>
            <ModeBadge mode={booking.mode} />
            {booking.specialRequest && (
              <span className="flex items-center gap-1">
                <StickyNote className="size-3" />
                Note
              </span>
            )}
          </div>
        </div>
      </div>
    </li>
  )
}

export function BookingsTable({
  bookings,
  sortDesc,
  onToggleSort,
  onRowClick,
  onAction,
}: {
  bookings: Booking[]
  sortDesc: boolean
  onToggleSort: () => void
  onRowClick: (id: string) => void
  onAction: (id: string, to: BookingStatus) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface">
      <div className={`hidden items-center gap-3 border-b border-border px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-muted-foreground md:grid ${GRID}`}>
        <button type="button" onClick={onToggleSort} className="flex items-center gap-1 hover:text-foreground">
          Time {sortDesc ? <ArrowDown className="size-3" /> : <ArrowUp className="size-3" />}
        </button>
        <span>Guest</span>
        <span>Pax</span>
        <span>Table</span>
        <span>Mode</span>
        <span>Status</span>
        <span className="sr-only">Actions</span>
      </div>
      {bookings.length === 0 ? (
        <EmptyState
          className="m-3 border-0"
          icon={<CalendarX2 />}
          title="No bookings match"
          description="Try clearing the filters or picking a different date."
        />
      ) : (
        <ul className="divide-y divide-border">
          {bookings.map((b) => (
            <BookingRow key={b.id} booking={b} onClick={() => onRowClick(b.id)} onAction={onAction} />
          ))}
        </ul>
      )}
    </div>
  )
}
