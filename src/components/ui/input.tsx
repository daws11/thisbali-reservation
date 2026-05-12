import * as React from 'react'
import { cn } from '@/lib/cn'

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type = 'text', ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={cn(
        'flex h-11 w-full rounded-lg border border-border bg-background px-3.5 py-2 text-base text-foreground transition-colors',
        'placeholder:text-muted-foreground/70',
        'focus-visible:border-accent focus-visible:outline-2 focus-visible:outline-offset-0 focus-visible:outline-accent/50',
        'disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-destructive aria-[invalid=true]:focus-visible:outline-destructive/50',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'
