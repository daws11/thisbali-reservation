import { useState } from 'react'
import { Phone, Save, Send, Sparkles } from 'lucide-react'

import { useBookingById, useBookingStore } from '@/stores/bookingStore'
import { isTerminal } from '@/lib/bookingStatus'
import { durationForTable } from '@/lib/availability'
import { formatDate, formatPaxLabel } from '@/lib/format'
import { slotTimes } from '@/data/timeSlots'
import { adminGuestMessage, buildWhatsAppLink, restaurantWhatsAppNumber } from '@/lib/whatsapp'
import { Sheet, SheetBody, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { ModeBadge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaxStepper } from '@/components/booking/PaxStepper'
import { TableSelect } from './TableSelect'
import { StatusActionButtons } from './StatusActionButtons'
import { AuditLogList } from './AuditLogList'
import { toast } from '@/components/ui/toast'
import type { Booking, BookingStatus } from '@/types'

function Body({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const updateBooking = useBookingStore((s) => s.updateBooking)
  const transitionStatus = useBookingStore((s) => s.transitionStatus)

  const [time, setTime] = useState(booking.timeSlot)
  const [pax, setPax] = useState(booking.pax)
  const [tableId, setTableId] = useState<string | null>(booking.tableId)
  const [special, setSpecial] = useState(booking.specialRequest ?? '')

  const dirty =
    time !== booking.timeSlot ||
    pax !== booking.pax ||
    tableId !== booking.tableId ||
    (special.trim() || undefined) !== (booking.specialRequest ?? undefined)

  const closed = isTerminal(booking.status)

  const save = () => {
    updateBooking(
      booking.id,
      {
        timeSlot: time,
        pax,
        tableId,
        durationMinutes: durationForTable(tableId),
        specialRequest: special.trim() || undefined,
      },
      'admin',
    )
    toast.success('Booking updated')
  }

  const doTransition = (to: BookingStatus) => {
    const ok = transitionStatus(booking.id, to, 'admin')
    if (ok) {
      toast.success(`Marked ${to === 'no-show' ? 'no-show' : to}`)
      if (to === 'cancelled') onClose()
    } else {
      toast.error('That status change isn’t allowed')
    }
  }

  const allSlots = slotTimes.includes(booking.timeSlot) ? slotTimes : [booking.timeSlot, ...slotTimes]

  return (
    <>
      <SheetHeader>
        <div className="flex flex-wrap items-center gap-2">
          <ModeBadge mode={booking.mode} />
          <StatusBadge status={booking.status} />
          <span className="text-xs text-muted-foreground tabular-nums">{booking.id}</span>
        </div>
        <SheetTitle className="mt-1">{booking.guest.name}</SheetTitle>
        <p className="text-sm text-muted-foreground">
          {formatDate(booking.date)} · {booking.timeSlot} · {formatPaxLabel(booking.pax)}
        </p>
      </SheetHeader>

      <SheetBody className="space-y-6">
        {/* contact */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <a href={`tel:${booking.guest.whatsapp}`} className="flex items-center gap-1.5 text-foreground hover:text-accent">
            <Phone className="size-3.5" />
            <span className="tabular-nums">{booking.guest.whatsapp}</span>
          </a>
          {booking.guest.email && <span className="text-muted-foreground">{booking.guest.email}</span>}
          {booking.occasion !== 'none' && (
            <span className="flex items-center gap-1 text-muted-foreground">
              <Sparkles className="size-3.5 text-accent" />
              <span className="capitalize">{booking.occasion}</span>
            </span>
          )}
        </div>

        {/* editable details */}
        {!closed && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="bd-time">Time</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger id="bd-time">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {allSlots.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Party size</Label>
                <div className="flex h-11 items-center">
                  <PaxStepper value={pax} onChange={setPax} size="md" />
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bd-table">Table</Label>
              <TableSelect id="bd-table" value={tableId} onChange={setTableId} pax={pax} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bd-special" optional>
                Special request
              </Label>
              <Textarea
                id="bd-special"
                rows={2}
                maxLength={300}
                value={special}
                onChange={(e) => setSpecial(e.target.value)}
                placeholder="Notes for the floor team…"
              />
            </div>
            <Button onClick={save} disabled={!dirty} variant="secondary" className="w-full">
              <Save className="size-4" />
              Save changes
            </Button>
          </div>
        )}

        {closed && booking.specialRequest && (
          <div className="rounded-lg border border-border bg-surface-elevated px-3 py-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Special request</p>
            <p className="mt-0.5">{booking.specialRequest}</p>
          </div>
        )}

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Status</p>
          <StatusActionButtons status={booking.status} onTransition={doTransition} />
          <Button variant="ghost" className="w-full" asChild>
            <a
              href={buildWhatsAppLink(adminGuestMessage(booking), restaurantWhatsAppNumber)}
              target="_blank"
              rel="noreferrer"
            >
              <Send className="size-4" />
              Send WhatsApp
            </a>
          </Button>
        </div>

        <Separator />

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Activity</p>
          <AuditLogList entries={booking.auditLog} />
        </div>
      </SheetBody>

      <SheetFooter>
        <Button variant="outline" className="w-full" onClick={onClose}>
          Close
        </Button>
      </SheetFooter>
    </>
  )
}

export function BookingDetailSheet({ bookingId, onClose }: { bookingId: string | null; onClose: () => void }) {
  const booking = useBookingById(bookingId ?? undefined)
  return (
    <Sheet open={!!bookingId} onOpenChange={(open) => !open && onClose()}>
      <SheetContent>
        {booking ? (
          <Body key={booking.id} booking={booking} onClose={onClose} />
        ) : (
          <div className="flex h-full items-center justify-center p-6 text-sm text-muted-foreground">
            Booking not found.
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
