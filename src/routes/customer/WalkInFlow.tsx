import { useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Clock, DoorOpen, UtensilsCrossed } from 'lucide-react'

import { BRAND, MAX_PAX, MIN_PAX } from '@/lib/constants'
import { currentServiceSlot, getAvailableTableIds, tableFits } from '@/lib/availability'
import { todayISO } from '@/lib/format'
import { tables, tablesById } from '@/data/seatingMap'
import { periodOf } from '@/data/timeSlots'
import { useBookingStore, useBookings } from '@/stores/bookingStore'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { FlowFooter } from '@/components/booking/FlowFooter'
import { PaxStepper, LargePartyNote } from '@/components/booking/PaxStepper'
import { GuestInfoForm, type GuestInfoFormHandle } from '@/components/booking/GuestInfoForm'
import { SeatingMap } from '@/components/seating/SeatingMap'
import { SelectedTableCard } from '@/components/seating/SelectedTableCard'
import { SeatingLegend } from '@/components/seating/SeatingLegend'

const STEPS = ['Party', 'Table', 'Details']

function ClosedNotice() {
  return (
    <div className="mx-auto max-w-screen-md px-4 py-14 text-center">
      <div className="mx-auto flex size-14 items-center justify-center rounded-full border border-border bg-surface text-muted-foreground">
        <DoorOpen className="size-7" />
      </div>
      <h1 className="mt-4 font-display text-2xl font-semibold">We’re closed right now</h1>
      <p className="mt-2 text-sm text-muted-foreground">{BRAND.hours}</p>
      <Button asChild className="mt-6">
        <Link to="/reserve">Reserve for later</Link>
      </Button>
    </div>
  )
}

export default function WalkInFlow() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const bookings = useBookings()
  const createBooking = useBookingStore((s) => s.createBooking)

  const serviceSlot = useMemo(() => currentServiceSlot(), [])
  const initialPax = Math.min(MAX_PAX, Math.max(MIN_PAX, Number(searchParams.get('pax') ?? '2') || 2))

  const [step, setStep] = useState(1)
  const [pax, setPax] = useState(initialPax)
  const [tableId, setTableId] = useState<string | null>(null)
  const guestRef = useRef<GuestInfoFormHandle>(null)

  if (!serviceSlot) return <ClosedNotice />

  const today = todayISO()
  const availableIds = getAvailableTableIds(bookings, today, serviceSlot, pax)
  const fittingAvailable = tables.filter((t) => tableFits(t, pax) && availableIds.has(t.id)).length
  const hiddenByPax = tables.filter((t) => !tableFits(t, pax)).length
  const noTables = fittingAvailable === 0
  const estWait = 15 + pax * 5
  const period = periodOf(serviceSlot)
  const selectedTable = tableId ? tablesById[tableId] : null

  const goNext = async () => {
    if (step === 1) {
      setTableId(null)
      setStep(2)
      return
    }
    if (step === 2) {
      if (noTables) return // handled by the inline CTA
      setStep(3)
      return
    }
    if (step === 3) {
      const v = await guestRef.current?.submit()
      if (!v) return
      const booking = createBooking(
        {
          mode: 'walk-in',
          date: today,
          timeSlot: serviceSlot,
          pax,
          tableId,
          guest: { name: v.name, whatsapp: v.whatsapp, ...(v.email ? { email: v.email } : {}) },
          occasion: 'none',
          marketingOptIn: false,
        },
        'customer',
      )
      navigate(`/confirmation/${booking.id}`)
    }
  }

  return (
    <div className="mx-auto max-w-screen-md px-4 py-6">
      <StepIndicator steps={STEPS} current={step} className="mb-6" />

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18 }}>
          {step === 1 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold">Walk-in — how many of you?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {period === 'lunch' ? 'Lunch service' : 'Dinner service'} · we’ll check what’s open right now.
                </p>
              </div>
              <div className="flex justify-center rounded-2xl border border-border bg-surface py-8">
                <PaxStepper value={pax} onChange={(v) => setPax(v)} />
              </div>
              <LargePartyNote pax={pax} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold">
                  {noTables ? 'Nothing free right now' : 'Available tables right now'}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  For {pax} {pax === 1 ? 'guest' : 'guests'} · checked at {serviceSlot}
                </p>
              </div>

              {noTables ? (
                <Card>
                  <CardContent className="space-y-4 p-6 text-center">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-accent/15 text-accent">
                      <Clock className="size-6" />
                    </div>
                    <div>
                      <p className="font-display text-lg font-semibold">Estimated wait ~{estWait} minutes</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Join the waitlist and we’ll WhatsApp you the moment a table for {pax} opens up.
                      </p>
                    </div>
                    <Button onClick={() => navigate(`/waitlist?pax=${pax}`)}>Join the waitlist</Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <SeatingMap
                    mode="select"
                    panZoom
                    selectedTableId={tableId}
                    onSelectTable={(t) => setTableId(t ? t.id : null)}
                    filterPax={pax}
                    availableTableIds={availableIds}
                  />
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                    <SeatingLegend variant="customer" />
                    {hiddenByPax > 0 && <span>{hiddenByPax} tables hidden — they don’t fit {pax} guests</span>}
                  </div>
                  {selectedTable ? (
                    <SelectedTableCard table={selectedTable} onChange={() => setTableId(null)} />
                  ) : (
                    <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                      <UtensilsCrossed className="size-4 text-accent" />
                      Pick a table, or continue and the host will seat you.
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold">Your details</h1>
                <p className="mt-1 text-sm text-muted-foreground">So the host can call you when it’s ready.</p>
              </div>
              <GuestInfoForm ref={guestRef} variant="quick" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <FlowFooter
        onBack={step > 1 ? () => setStep(step - 1) : undefined}
        hideBack={step === 1}
        onNext={step === 2 && noTables ? undefined : goNext}
        nextLabel={step === 3 ? 'Confirm walk-in' : 'Next'}
        secondary={
          step === 2 && !noTables && !tableId ? (
            <Button variant="ghost" onClick={() => setStep(3)}>
              Skip — host will seat us
            </Button>
          ) : undefined
        }
      />
    </div>
  )
}
