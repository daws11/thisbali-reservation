import * as React from 'react'
import { cn } from '@/lib/cn'

export interface SegmentedOption<T extends string> {
  value: T
  label: React.ReactNode
  icon?: React.ReactNode
}

interface SegmentedControlProps<T extends string> {
  value: T
  onValueChange: (value: T) => void
  options: SegmentedOption<T>[]
  className?: string
  size?: 'sm' | 'md'
  'aria-label'?: string
}

export function SegmentedControl<T extends string>({
  value,
  onValueChange,
  options,
  className,
  size = 'md',
  ...rest
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={rest['aria-label']}
      className={cn('inline-flex items-center gap-1 rounded-xl border border-border bg-surface p-1', className)}
    >
      {options.map((opt) => {
        const active = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onValueChange(opt.value)}
            className={cn(
              'inline-flex items-center justify-center gap-1.5 rounded-lg font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent',
              size === 'sm' ? 'min-h-8 px-2.5 text-xs' : 'min-h-9 px-3.5 text-sm',
              active
                ? 'bg-accent text-background font-semibold shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-surface-elevated',
            )}
          >
            {opt.icon}
            <span>{opt.label}</span>
          </button>
        )
      })}
    </div>
  )
}
