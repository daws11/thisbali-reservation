import { useEffect } from 'react'
import { useBookingStore, useDraft } from '@/stores/bookingStore'
import type { Booking } from '@/types'

interface DraftApi {
  draft: Partial<Booking>
  patch: (p: Partial<Booking>) => void
  reset: () => void
  clear: () => void
  hadExisting: boolean
}

/**
 * Owns the persisted `draftBooking` for a flow. On mount it initialises a draft
 * with `init` defaults unless one already exists *for the same mode* — so a
 * returning customer keeps their progress, but switching flows starts fresh.
 */
export function useDraftBooking(init: Partial<Booking>): DraftApi {
  const draft = useDraft()
  const setDraft = useBookingStore((s) => s.setDraft)
  const resetDraft = useBookingStore((s) => s.resetDraft)
  const clearDraft = useBookingStore((s) => s.clearDraft)

  const existing = useBookingStore.getState().draft
  const hadExisting = !!existing && existing.mode === init.mode

  useEffect(() => {
    const current = useBookingStore.getState().draft
    if (!current || current.mode !== init.mode) resetDraft(init)
    // run once per mount; `init` is a stable literal at call sites
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return {
    draft: draft && draft.mode === init.mode ? draft : init,
    patch: setDraft,
    reset: () => resetDraft(init),
    clear: clearDraft,
    hadExisting,
  }
}
