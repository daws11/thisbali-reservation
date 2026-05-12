import { tablesById, tableSummary } from '@/data/seatingMap'
import { BRAND, WA_NUMBER } from './constants'
import { formatDate, formatMode } from './format'
import type { Booking } from '@/types'

/** Build a wa.me link. Omit `phone` to let the user pick the recipient. */
export function buildWhatsAppLink(text: string, phone?: string): string {
  const base = phone ? `https://wa.me/${phone}` : 'https://wa.me/'
  return `${base}?text=${encodeURIComponent(text)}`
}

/** Customer-facing "share my booking" message. */
export function customerShareMessage(booking: Booking): string {
  const table = booking.tableId ? tablesById[booking.tableId] : null
  return [
    `${BRAND.name} — ${formatMode(booking.mode)} confirmed ✨`,
    `Booking ${booking.id}`,
    `${formatDate(booking.date)} · ${booking.timeSlot}`,
    `${booking.pax} ${booking.pax === 1 ? 'guest' : 'guests'}`,
    table ? tableSummary(table) : 'Table assigned on arrival',
    booking.guest.name,
  ].join('\n')
}

/** Admin → guest template message (opens with the guest's number prefilled). */
export function adminGuestMessage(booking: Booking): string {
  const greeting = `Halo ${booking.guest.name}, ini ${BRAND.name} di Ubud.`
  const lines = [greeting]
  switch (booking.status) {
    case 'pending':
      lines.push(`Kami sudah menerima permintaan reservasi Anda untuk ${formatDate(booking.date)} pukul ${booking.timeSlot} (${booking.pax} orang). Kami akan konfirmasi sebentar lagi 🙏`)
      break
    case 'confirmed':
      lines.push(`Reservasi Anda untuk ${formatDate(booking.date)} pukul ${booking.timeSlot} (${booking.pax} orang) sudah dikonfirmasi. Sampai jumpa! 🌺`)
      break
    case 'waitlisted':
      lines.push(`Anda sudah masuk waitlist hari ini untuk ${booking.pax} orang. Kami akan kabari begitu meja tersedia 🙏`)
      break
    case 'seated':
      lines.push(`Selamat menikmati hidangan Anda 🍽️`)
      break
    case 'cancelled':
      lines.push(`Reservasi ${booking.id} telah dibatalkan. Terima kasih, semoga bisa melayani Anda lain kali.`)
      break
    default:
      lines.push(`Terima kasih sudah berkunjung ke ${BRAND.name} 🙏`)
  }
  lines.push(`(Ref: ${booking.id})`)
  return lines.join('\n')
}

export const restaurantWhatsAppNumber = WA_NUMBER
