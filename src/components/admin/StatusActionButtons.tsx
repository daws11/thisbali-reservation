import { nextActions } from '@/lib/bookingStatus'
import { Button } from '@/components/ui/button'
import type { BookingStatus } from '@/types'

export function StatusActionButtons({
  status,
  onTransition,
}: {
  status: BookingStatus
  onTransition: (to: BookingStatus) => void
}) {
  const actions = nextActions(status)
  if (actions.length === 0) {
    return <p className="text-sm text-muted-foreground">This booking is closed — view only.</p>
  }
  return (
    <div className="flex flex-wrap gap-2">
      {actions.map((a) => (
        <Button key={a.to} variant={a.variant} className="flex-1 min-w-32" onClick={() => onTransition(a.to)}>
          {a.label}
        </Button>
      ))}
    </div>
  )
}
