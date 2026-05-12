import { useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { addDays, startOfDay } from 'date-fns'
import { CalendarCheck2, Sparkles } from 'lucide-react'

import { CLOSED_WEEKDAYS, MAX_ADVANCE_DAYS } from '@/lib/constants'
import { getAvailableTableIds, tableFits } from '@/lib/availability'
import { formatDate, isoDate, todayISO } from '@/lib/format'
import { periodOf } from '@/data/timeSlots'
import { tables, tablesById } from '@/data/seatingMap'
import { useBookingStore, useBookings } from '@/stores/bookingStore'
import { useDraftBooking } from '@/hooks/useDraftSync'

import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { StepIndicator } from '@/components/booking/StepIndicator'
import { FlowFooter } from '@/components/booking/FlowFooter'
import { PaxStepper, LargePartyNote } from '@/components/booking/PaxStepper'
import { MealPeriodTabs } from '@/components/booking/MealPeriodTabs'
import { TimeSlotGrid } from '@/components/booking/TimeSlotGrid'
import { GuestInfoForm, type GuestInfoFormHandle } from '@/components/booking/GuestInfoForm'
import { ReviewSummary, type ReviewEditSection } from '@/components/booking/ReviewSummary'
import { DraftBanner } from '@/components/booking/DraftBanner'
import { SeatingMap } from '@/components/seating/SeatingMap'
import { SelectedTableCard } from '@/components/seating/SelectedTableCard'
import { SeatingLegend } from '@/components/seating/SeatingLegend'
import type { GuestInfoValues } from '@/lib/schemas'
import type { MealPeriod } from '@/types'

const STEPS = ['Date', 'Time', 'Party', 'Table', 'Details', 'Review']
const TOTAL = STEPS.length

function StepShell({
  children,
  title,
  subtitle,
}: {
  children: React.ReactNode
  title: string
  subtitle?: string
}) {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  )
}

export default function ReservationFlow() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const bookings = useBookings()
  const createBooking = useBookingStore((s) => s.createBooking)

  const { draft, patch, clear, hadExisting } = useDraftBooking({
    mode: 'reservation',
    durationMinutes: 90,
    occasion: 'none',
    marketingOptIn: false,
    pax: 2,
  })

  const rawStep = Number(searchParams.get('step') ?? '1')
  const step = Number.isFinite(rawStep) ? Math.min(TOTAL, Math.max(1, Math.trunc(rawStep))) : 1
  const goTo = (n: number) => {
    const next = new URLSearchParams(searchParams)
    next.set('step', String(Math.min(TOTAL, Math.max(1, n))))
    setSearchParams(next)
  }

  const guestFormRef = useRef<GuestInfoFormHandle>(null)
  const [mealPeriod, setMealPeriod] = useState<MealPeriod>(() => {
    const p = draft.timeSlot ? periodOf(draft.timeSlot) : null
    return p ?? 'dinner'
  })
  const [bannerDismissed, setBannerDismissed] = useState(false)

  const pax = draft.pax ?? 2

  // ── derived for step 4 ──────────────────────────────────────────────────────
  const availableIds =
    draft.date && draft.timeSlot ? getAvailableTableIds(bookings, draft.date, draft.timeSlot, pax) : new Set<string>()
  const hiddenByPax = tables.filter((t) => !tableFits(t, pax)).length
  const fittingAvailable = tables.filter((t) => tableFits(t, pax) && availableIds.has(t.id)).length
  const selectedTable = draft.tableId ? tablesById[draft.tableId] : null

  // ── handlers ────────────────────────────────────────────────────────────────
  const onPickDate = (d?: Date) => {
    if (!d) return
    patch({ date: isoDate(d), timeSlot: undefined, tableId: undefined })
  }
  const onPickPeriod = (p: MealPeriod) => setMealPeriod(p)
  const onPickTime = (t: string) => {
    patch({ timeSlot: t, tableId: undefined })
  }
  const onChangePax = (v: number) => {
    const keepTable = draft.tableId && tableFits(tablesById[draft.tableId], v) ? draft.tableId : undefined
    patch({ pax: v, tableId: keepTable })
  }

  const syncGuest = (v: Partial<GuestInfoValues>) => {
    patch({
      guest: { name: v.name ?? '', whatsapp: v.whatsapp ?? '', ...(v.email ? { email: v.email } : {}) },
      occasion: v.occasion ?? 'none',
      ...(v.specialRequest ? { specialRequest: v.specialRequest } : { specialRequest: undefined }),
      marketingOptIn: v.marketingOptIn ?? false,
    })
  }

  const onEditSection = (section: ReviewEditSection) => {
    const map: Record<ReviewEditSection, number> = { date: 1, time: 2, pax: 3, table: 4, guest: 5 }
    goTo(map[section])
  }

  const handleNext = async () => {
    if (step === 5) {
      const values = await guestFormRef.current?.submit()
      if (!values) return
      syncGuest(values)
      goTo(6)
      return
    }
    if (step === 4 && !draft.tableId) {
      patch({ tableId: null })
    }
    goTo(step + 1)
  }

  const handleConfirm = () => {
    if (!draft.date || !draft.timeSlot || !draft.guest?.name || !draft.guest?.whatsapp) {
      goTo(1)
      return
    }
    const booking = createBooking(
      {
        mode: 'reservation',
        date: draft.date,
        timeSlot: draft.timeSlot,
        pax,
        tableId: draft.tableId ?? null,
        durationMinutes: draft.durationMinutes,
        guest: draft.guest as { name: string; whatsapp: string; email?: string },
        occasion: draft.occasion ?? 'none',
        specialRequest: draft.specialRequest,
        marketingOptIn: draft.marketingOptIn ?? false,
      },
      'customer',
    )
    clear()
    navigate(`/confirmation/${booking.id}`)
  }

  // step-level "Next" enablement
  const canAdvance =
    (step === 1 && !!draft.date) ||
    (step === 2 && !!draft.timeSlot) ||
    step === 3 ||
    step === 4 ||
    step === 5 // submit handled in handler

  const today = startOfDay(new Date())
  const maxDate = addDays(today, MAX_ADVANCE_DAYS)
  const selectedDate = draft.date ? parseLocal(draft.date) : undefined

  return (
    <div className="mx-auto max-w-screen-md px-4 py-6">
      <StepIndicator steps={STEPS} current={step} onStepClick={goTo} className="mb-6" />

      {hadExisting && !bannerDismissed && (
        <div className="mb-5">
          <DraftBanner
            onDiscard={() => {
              clear()
              patch({ mode: 'reservation', durationMinutes: 90, occasion: 'none', marketingOptIn: false, pax: 2 })
              setBannerDismissed(true)
              goTo(1)
            }}
          />
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.18 }}
        >
          {step === 1 && (
            <StepShell title="When would you like to dine?" subtitle="We’re open every day — lunch and dinner service.">
              <div className="flex justify-center rounded-2xl border border-border bg-surface p-3">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={onPickDate}
                  startMonth={today}
                  endMonth={maxDate}
                  disabled={[
                    { before: today },
                    { after: maxDate },
                    { dayOfWeek: [...CLOSED_WEEKDAYS] },
                  ]}
                />
              </div>
            </StepShell>
          )}

          {step === 2 && (
            <StepShell title="Pick a time" subtitle={draft.date ? formatDate(draft.date) : undefined}>
              <MealPeriodTabs value={mealPeriod} onChange={onPickPeriod} className="w-full sm:w-auto" />
              <TimeSlotGrid
                date={draft.date ?? todayISO()}
                period={mealPeriod}
                selectedTime={draft.timeSlot ?? null}
                onSelect={onPickTime}
              />
              <SeatingLegend variant="customer" className="pt-1" />
            </StepShell>
          )}

          {step === 3 && (
            <StepShell title="How many guests?" subtitle="We’ll show you tables that fit your party.">
              <div className="flex justify-center rounded-2xl border border-border bg-surface py-8">
                <PaxStepper value={pax} onChange={onChangePax} />
              </div>
              <LargePartyNote pax={pax} />
            </StepShell>
          )}

          {step === 4 && (
            <StepShell
              title="Pilih meja — pick your seat"
              subtitle={
                draft.date && draft.timeSlot ? `${formatDate(draft.date)} · ${draft.timeSlot} · ${pax} ${pax === 1 ? 'guest' : 'guests'}` : undefined
              }
            >
              <SeatingMap
                mode="select"
                panZoom
                selectedTableId={draft.tableId ?? null}
                onSelectTable={(t) => patch({ tableId: t ? t.id : null })}
                filterPax={pax}
                availableTableIds={availableIds}
              />
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                <SeatingLegend variant="customer" />
                {hiddenByPax > 0 && <span>{hiddenByPax} tables hidden — they don’t fit {pax} guests</span>}
              </div>
              {fittingAvailable === 0 && (
                <p className="rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
                  Nothing free for {pax} guests at {draft.timeSlot}. Try another time, or continue and we’ll assign the best available table.
                </p>
              )}
              {selectedTable ? (
                <SelectedTableCard table={selectedTable} onChange={() => patch({ tableId: undefined })} />
              ) : (
                <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-4 py-3 text-sm text-muted-foreground">
                  <Sparkles className="size-4 text-accent" />
                  No table picked — we’ll assign the best available one for you.
                </div>
              )}
            </StepShell>
          )}

          {step === 5 && (
            <StepShell title="Your details" subtitle="So we can confirm and welcome you properly.">
              <GuestInfoForm
                ref={guestFormRef}
                onChange={syncGuest}
                defaultValues={{
                  name: draft.guest?.name ?? '',
                  whatsapp: draft.guest?.whatsapp ?? '',
                  email: draft.guest?.email ?? '',
                  occasion: draft.occasion ?? 'none',
                  specialRequest: draft.specialRequest ?? '',
                  marketingOptIn: draft.marketingOptIn ?? false,
                }}
              />
            </StepShell>
          )}

          {step === 6 && (
            <StepShell title="Review &amp; confirm" subtitle="Check everything looks right, then confirm your table.">
              <ReviewSummary
                date={draft.date}
                timeSlot={draft.timeSlot}
                pax={pax}
                tableId={draft.tableId ?? null}
                guest={draft.guest}
                occasion={draft.occasion}
                specialRequest={draft.specialRequest}
                onEdit={onEditSection}
              />
              <Button size="lg" className="w-full" onClick={handleConfirm}>
                <CalendarCheck2 className="size-5" />
                Confirm Reservation
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                You’ll get a confirmation on WhatsApp (mock). No payment required.
              </p>
            </StepShell>
          )}
        </motion.div>
      </AnimatePresence>

      {step < 6 && (
        <FlowFooter
          onBack={step > 1 ? () => goTo(step - 1) : undefined}
          hideBack={step === 1}
          onNext={handleNext}
          nextDisabled={!canAdvance}
          nextLabel={step === 5 ? 'Review' : 'Next'}
          secondary={
            step === 4 && !draft.tableId ? (
              <Button
                variant="ghost"
                onClick={() => {
                  patch({ tableId: null })
                  goTo(5)
                }}
              >
                Skip — best available
              </Button>
            ) : undefined
          }
        />
      )}
      {step === 6 && (
        <div className="mt-4">
          <Button variant="ghost" onClick={() => goTo(5)}>
            ← Back
          </Button>
        </div>
      )}
    </div>
  )
}

/** Parse a "yyyy-MM-dd" string to a local Date (no TZ drift). */
function parseLocal(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}
