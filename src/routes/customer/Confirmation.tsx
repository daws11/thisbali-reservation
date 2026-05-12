import { Link, useParams } from 'react-router-dom'
import { QRCodeSVG } from 'qrcode.react'
import { CalendarPlus, CircleCheck, MessageCircle, Pencil, SearchX } from 'lucide-react'

import { useBookingById, useBookingsOnDate } from '@/stores/bookingStore'
import { downloadIcs } from '@/lib/ics'
import { buildWhatsAppLink, customerShareMessage } from '@/lib/whatsapp'
import { formatDate } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { ModeBadge } from '@/components/ui/badge'
import { ReviewSummary } from '@/components/booking/ReviewSummary'
import { toast } from '@/components/ui/toast'

function NotFound() {
  return (
    <div className="mx-auto max-w-screen-md px-4 py-16 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground">
        <SearchX className="size-7" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold">We couldn’t find that booking</h1>
      <p className="mt-2 text-sm text-muted-foreground">The link may be old or the booking was removed.</p>
      <Button asChild className="mt-6">
        <Link to="/">Back to start</Link>
      </Button>
    </div>
  )
}

export default function Confirmation() {
  const { bookingId } = useParams()
  const booking = useBookingById(bookingId)
  const sameDayWaitlist = useBookingsOnDate(booking?.date ?? '')

  if (!booking) return <NotFound />

  const isWaitlist = booking.mode === 'waitlist'
  const isWalkIn = booking.mode === 'walk-in'

  const queuePosition = isWaitlist
    ? sameDayWaitlist
        .filter((b) => b.mode === 'waitlist' && b.status === 'waitlisted')
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .findIndex((b) => b.id === booking.id) + 1
    : 0

  const headline = isWaitlist
    ? queuePosition > 0
      ? `You’re #${queuePosition} in line`
      : 'You’re on the waitlist'
    : isWalkIn
      ? 'Walk-in received'
      : 'You’re confirmed!'

  const subline = isWaitlist
    ? 'Please wait near the restaurant — we’ll WhatsApp you the moment a table opens up.'
    : isWalkIn
      ? 'Head to the host stand and show this screen — your table’s being prepared.'
      : `See you on ${formatDate(booking.date)} at ${booking.timeSlot}.`

  return (
    <div className="mx-auto max-w-screen-md px-4 py-8">
      <div className="flex flex-col items-center text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-accent/15 text-accent">
          <CircleCheck className="size-9" />
        </div>
        <div className="mt-4 flex items-center gap-2">
          <ModeBadge mode={booking.mode} />
          <span className="text-xs text-muted-foreground tabular-nums">{booking.id}</span>
        </div>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight">{headline}</h1>
        <p className="mt-2 max-w-md text-muted-foreground">{subline}</p>
      </div>

      <div className="mt-8 grid gap-5 md:grid-cols-[1fr_auto] md:items-start">
        <div className="space-y-4">
          <ReviewSummary
            date={booking.date}
            timeSlot={booking.timeSlot}
            pax={booking.pax}
            tableId={booking.tableId}
            guest={booking.guest}
            occasion={booking.occasion}
            specialRequest={booking.specialRequest}
          />
          {!isWaitlist && (
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="secondary" onClick={() => downloadIcs(booking)}>
                <CalendarPlus className="size-4" />
                Add to Calendar
              </Button>
              <Button variant="secondary" asChild>
                <a
                  href={buildWhatsAppLink(customerShareMessage(booking))}
                  target="_blank"
                  rel="noreferrer"
                >
                  <MessageCircle className="size-4" />
                  Share via WhatsApp
                </a>
              </Button>
            </div>
          )}
          <Button
            variant="ghost"
            className="w-full sm:w-auto"
            onClick={() => toast.info('Self-service editing is coming soon', { description: 'For now, message us on WhatsApp to change or cancel.' })}
          >
            <Pencil className="size-4" />
            Modify or cancel
          </Button>
        </div>

        <Card className="mx-auto w-fit">
          <CardContent className="flex flex-col items-center gap-3 p-5">
            <div className="rounded-xl border border-border bg-white p-3">
              <QRCodeSVG
                value={JSON.stringify({ id: booking.id, n: booking.guest.name })}
                size={140}
                bgColor="#FFFFFF"
                fgColor="#23201B"
                level="M"
              />
            </div>
            <p className="text-center text-xs text-muted-foreground">Show this at check-in</p>
          </CardContent>
        </Card>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        We’ve sent the {isWaitlist ? 'waitlist details' : 'confirmation'} to your WhatsApp (mock).
      </p>
      <div className="mt-6 text-center">
        <Button variant="link" asChild>
          <Link to="/">Make another booking</Link>
        </Button>
      </div>
    </div>
  )
}
