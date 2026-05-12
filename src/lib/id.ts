/** Build a human-friendly booking id like "TIB-2026-0042" from a monotonic seq. */
export function makeBookingId(seq: number, year = new Date().getFullYear()): string {
  return `TIB-${year}-${String(seq).padStart(4, '0')}`
}

/** Lightweight time-keyed id for audit entries / misc keys. */
export function shortId(): string {
  return Math.random().toString(36).slice(2, 10)
}
