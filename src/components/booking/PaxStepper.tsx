import { Minus, Plus } from 'lucide-react'
import { LARGE_PARTY_THRESHOLD, MAX_PAX, MIN_PAX } from '@/lib/constants'
import { cn } from '@/lib/cn'

interface PaxStepperProps {
  value: number
  onChange: (v: number) => void
  min?: number
  max?: number
  size?: 'md' | 'lg'
  className?: string
}

export function PaxStepper({
  value,
  onChange,
  min = MIN_PAX,
  max = MAX_PAX,
  size = 'lg',
  className,
}: PaxStepperProps) {
  const clamp = (v: number) => Math.min(max, Math.max(min, v))
  const dec = () => onChange(clamp(value - 1))
  const inc = () => onChange(clamp(value + 1))

  const btn =
    'flex items-center justify-center rounded-full border border-border text-foreground transition-colors hover:bg-surface-elevated disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent'
  const btnSize = size === 'lg' ? 'size-12' : 'size-11'

  return (
    <div className={cn('flex items-center gap-5', className)}>
      <button type="button" aria-label="Decrease party size" onClick={dec} disabled={value <= min} className={cn(btn, btnSize)}>
        <Minus className="size-5" />
      </button>
      <div className="flex min-w-[3.5rem] flex-col items-center">
        <span className={cn('font-display font-semibold tabular-nums leading-none', size === 'lg' ? 'text-4xl' : 'text-3xl')}>
          {value}
        </span>
        <span className="mt-1 text-xs text-muted-foreground">{value === 1 ? 'guest' : 'guests'}</span>
      </div>
      <button type="button" aria-label="Increase party size" onClick={inc} disabled={value >= max} className={cn(btn, btnSize)}>
        <Plus className="size-5" />
      </button>
    </div>
  )
}

export function LargePartyNote({ pax, className }: { pax: number; className?: string }) {
  if (pax <= LARGE_PARTY_THRESHOLD) return null
  return (
    <p className={cn('rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent', className)}>
      For groups over {LARGE_PARTY_THRESHOLD}, please WhatsApp us — we’ll arrange the right space for you.
    </p>
  )
}
