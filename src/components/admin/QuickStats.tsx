import * as React from 'react'
import { CalendarDays, Footprints, ListOrdered, Users } from 'lucide-react'
import { useBookingsOnDate } from '@/stores/bookingStore'
import { cn } from '@/lib/cn'

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground [&_svg]:size-4">{icon}</span>
      <span className="font-display text-lg font-semibold tabular-nums leading-none">{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

export function QuickStats({ date, className }: { date: string; className?: string }) {
  const bookings = useBookingsOnDate(date)
  const active = bookings.filter((b) => b.status !== 'cancelled')
  const reservations = active.filter((b) => b.mode === 'reservation')
  const walkIns = active.filter((b) => b.mode === 'walk-in')
  const waitlist = active.filter((b) => b.mode === 'waitlist' && b.status === 'waitlisted')
  const paxExpected = active
    .filter((b) => b.mode !== 'waitlist' && b.status !== 'no-show')
    .reduce((sum, b) => sum + b.pax, 0)

  return (
    <div className={cn('flex flex-wrap items-center gap-x-5 gap-y-1.5', className)}>
      <Stat icon={<CalendarDays />} label="bookings" value={reservations.length + walkIns.length} />
      <Stat icon={<Users />} label="pax expected" value={paxExpected} />
      <Stat icon={<Footprints />} label="walk-ins" value={walkIns.length} />
      <Stat icon={<ListOrdered />} label="on waitlist" value={waitlist.length} />
    </div>
  )
}
