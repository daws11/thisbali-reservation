import { Check } from 'lucide-react'
import { cn } from '@/lib/cn'

interface StepIndicatorProps {
  steps: string[]
  current: number // 1-based
  onStepClick?: (step: number) => void
  className?: string
}

export function StepIndicator({ steps, current, onStepClick, className }: StepIndicatorProps) {
  return (
    <ol className={cn('flex items-center gap-1.5 md:gap-2', className)} aria-label="Progress">
      {steps.map((label, i) => {
        const n = i + 1
        const state = n < current ? 'done' : n === current ? 'current' : 'todo'
        const clickable = !!onStepClick && n < current
        return (
          <li key={label} className="flex flex-1 items-center gap-1.5 md:gap-2">
            <button
              type="button"
              disabled={!clickable}
              onClick={clickable ? () => onStepClick(n) : undefined}
              className={cn(
                'flex items-center gap-2 rounded-lg py-1 transition-colors',
                clickable && 'hover:opacity-80 cursor-pointer',
                !clickable && 'cursor-default',
              )}
              aria-current={state === 'current' ? 'step' : undefined}
            >
              <span
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold tabular-nums transition-colors',
                  state === 'done' && 'border-accent bg-accent text-background',
                  state === 'current' && 'border-accent text-accent',
                  state === 'todo' && 'border-border text-muted-foreground',
                )}
              >
                {state === 'done' ? <Check className="size-3.5 stroke-[3]" /> : n}
              </span>
              <span
                className={cn(
                  'hidden whitespace-nowrap text-sm xl:inline',
                  state === 'current' ? 'font-semibold text-foreground' : 'text-muted-foreground',
                )}
              >
                {label}
              </span>
            </button>
            {n < steps.length && (
              <span
                className={cn('h-px flex-1 transition-colors', n < current ? 'bg-accent/60' : 'bg-border')}
                aria-hidden
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
