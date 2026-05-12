import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Hourglass } from 'lucide-react'

import { MAX_PAX, MIN_PAX } from '@/lib/constants'
import { currentServiceSlot, nowSlot } from '@/lib/availability'
import { todayISO } from '@/lib/format'
import { useBookingStore, useBookingsOnDate } from '@/stores/bookingStore'

import { Card, CardContent } from '@/components/ui/card'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { FlowFooter } from '@/components/booking/FlowFooter'
import { PaxStepper, LargePartyNote } from '@/components/booking/PaxStepper'
import { GuestInfoForm, type GuestInfoFormHandle } from '@/components/booking/GuestInfoForm'

const STEPS = ['Party', 'Wait time', 'Details']

export default function WaitlistFlow() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const today = todayISO()
  const sameDay = useBookingsOnDate(today)
  const createBooking = useBookingStore((s) => s.createBooking)

  const initialPax = Math.min(MAX_PAX, Math.max(MIN_PAX, Number(searchParams.get('pax') ?? '2') || 2))
  const [step, setStep] = useState(1)
  const [pax, setPax] = useState(initialPax)
  const guestRef = useRef<GuestInfoFormHandle>(null)

  const queueLen = useMemo(
    () => sameDay.filter((b) => b.mode === 'waitlist' && b.status === 'waitlisted').length,
    [sameDay],
  )
  const estWait = 15 + pax * 5 + queueLen * 5
  const serviceSlot = currentServiceSlot() ?? nowSlot()

  const goNext = async () => {
    if (step === 1) return setStep(2)
    if (step === 2) return setStep(3)
    if (step === 3) {
      const v = await guestRef.current?.submit()
      if (!v) return
      const booking = createBooking(
        {
          mode: 'waitlist',
          date: today,
          timeSlot: serviceSlot,
          pax,
          tableId: null,
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
                <h1 className="font-display text-2xl font-semibold">Join the waitlist — party size?</h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {queueLen > 0 ? `${queueLen} ${queueLen === 1 ? 'group is' : 'groups are'} already waiting.` : 'No one’s waiting right now — nice timing.'}
                </p>
              </div>
              <div className="flex justify-center rounded-2xl border border-border bg-surface py-8">
                <PaxStepper value={pax} onChange={setPax} />
              </div>
              <LargePartyNote pax={pax} />
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h1 className="font-display text-2xl font-semibold">Estimated wait</h1>
              <Card>
                <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
                  <div className="flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
                    <Hourglass className="size-7" />
                  </div>
                  <p className="font-display text-4xl font-bold tabular-nums">~{estWait} min</p>
                  <p className="max-w-xs text-sm text-muted-foreground">
                    Based on the current queue and your party of {pax}. We’ll WhatsApp you when your table is ready — please stay nearby.
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <div>
                <h1 className="font-display text-2xl font-semibold">Your details</h1>
                <p className="mt-1 text-sm text-muted-foreground">We’ll message you the moment a table opens up.</p>
              </div>
              <GuestInfoForm ref={guestRef} variant="quick" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <FlowFooter
        onBack={step > 1 ? () => setStep(step - 1) : undefined}
        hideBack={step === 1}
        onNext={goNext}
        nextLabel={step === 3 ? 'Join waitlist' : 'Next'}
      />
    </div>
  )
}
