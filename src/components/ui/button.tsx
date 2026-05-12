import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/cn'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-accent text-background hover:bg-accent-hover font-semibold shadow-sm shadow-black/8',
        secondary:
          'border border-accent/60 text-foreground hover:bg-surface-elevated hover:border-accent',
        outline: 'border border-border text-foreground hover:bg-surface-elevated',
        ghost: 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/85 font-semibold',
        link: 'text-accent underline-offset-4 hover:underline px-0 h-auto',
      },
      size: {
        sm: 'h-9 px-3 text-sm',
        md: 'h-11 px-5',
        lg: 'h-12 px-7 text-base',
        icon: 'size-11',
        iconSm: 'size-9',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, type, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        type={asChild ? undefined : (type ?? 'button')}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
