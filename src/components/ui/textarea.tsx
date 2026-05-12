import * as React from 'react'
import { cn } from '@/lib/cn'

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, rows = 3, ...props }, ref) => (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'flex w-full rounded-lg border border-border bg-background px-3.5 py-2.5 text-base text-foreground transition-colors resize-y min-h-[80px]',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-destructive',
        className,
      )}
      {...props}
    />
  ),
)
Textarea.displayName = 'Textarea'
