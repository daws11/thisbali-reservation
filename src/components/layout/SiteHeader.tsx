import { Link } from 'react-router-dom'
import { BRAND } from '@/lib/constants'
import { cn } from '@/lib/cn'

export function BrandMark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-baseline gap-1.5 leading-none', className)}>
      <span className="font-display text-lg font-bold tracking-tight text-foreground">This Is</span>
      <span className="font-display text-lg font-bold tracking-tight text-accent">Bali</span>
    </span>
  )
}

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-screen-md items-center justify-between px-4">
        <Link
          to="/"
          className="flex items-center gap-2 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <BrandMark />
          <span className="hidden text-xs text-muted-foreground sm:inline">· {BRAND.tagline}</span>
        </Link>
        <span className="text-xs text-muted-foreground">Reservations</span>
      </div>
    </header>
  )
}
