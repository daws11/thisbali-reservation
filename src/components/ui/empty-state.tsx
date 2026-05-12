import * as React from 'react'
import { cn } from '@/lib/cn'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: React.ReactNode
  action?: React.ReactNode
  className?: string
}

export function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-surface/40 px-6 py-12 text-center',
        className,
      )}
    >
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-full border border-border bg-surface-elevated text-muted-foreground [&_svg]:size-6">
          {icon}
        </div>
      )}
      <div className="space-y-1">
        <p className="font-display text-lg font-semibold">{title}</p>
        {description && <p className="text-sm text-muted-foreground max-w-sm">{description}</p>}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  )
}
