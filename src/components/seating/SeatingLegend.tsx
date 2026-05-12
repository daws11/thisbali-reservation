import { cn } from '@/lib/cn'

interface LegendItem {
  label: string
  swatch: string // inline style for the swatch background
  ring?: boolean
}

const ADMIN_ITEMS: LegendItem[] = [
  { label: 'Empty', swatch: 'color-mix(in oklab, var(--color-foreground) 12%, var(--color-surface))' },
  { label: 'Reserved', swatch: 'var(--color-status-pending)' },
  { label: 'Seated', swatch: 'var(--color-status-seated)' },
  { label: 'Completed', swatch: 'color-mix(in oklab, var(--color-status-completed) 60%, transparent)' },
  { label: 'No-show', swatch: 'transparent', ring: true },
]

const CUSTOMER_ITEMS: LegendItem[] = [
  { label: 'Available', swatch: 'color-mix(in oklab, var(--color-foreground) 14%, var(--color-surface))' },
  { label: 'Selected', swatch: 'var(--color-accent)' },
  { label: 'Full / doesn’t fit', swatch: 'color-mix(in oklab, var(--color-foreground) 5%, var(--color-surface))' },
]

export function SeatingLegend({ variant, className }: { variant: 'admin' | 'customer'; className?: string }) {
  const items = variant === 'admin' ? ADMIN_ITEMS : CUSTOMER_ITEMS
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground', className)}>
      {items.map((it) => (
        <li key={it.label} className="flex items-center gap-1.5">
          <span
            className="inline-block size-3 rounded-[3px]"
            style={
              it.ring
                ? { border: '2px solid var(--color-status-cancelled)' }
                : { background: it.swatch, border: '1px solid var(--color-border)' }
            }
            aria-hidden
          />
          {it.label}
        </li>
      ))}
    </ul>
  )
}
