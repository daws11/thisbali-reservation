import { useNavigate, useParams } from 'react-router-dom'
import { BookingDetailSheet } from '@/components/admin/BookingDetailSheet'

export default function BookingDetailRoute() {
  const { id } = useParams()
  const navigate = useNavigate()
  return <BookingDetailSheet bookingId={id ?? null} onClose={() => navigate('/admin/bookings')} />
}
