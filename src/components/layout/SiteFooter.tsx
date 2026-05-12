import { Link } from 'react-router-dom'
import { AtSign, Clock, MapPin, Phone } from 'lucide-react'
import { BRAND } from '@/lib/constants'
import { BrandMark } from './SiteHeader'

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-surface/40">
      <div className="mx-auto max-w-screen-md px-4 py-10">
        <BrandMark />
        <p className="mt-1 text-sm text-muted-foreground">{BRAND.tagline}</p>
        <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-3">
          <div className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-accent" />
            <dd className="text-muted-foreground">{BRAND.location}</dd>
          </div>
          <div className="flex items-start gap-2">
            <Clock className="mt-0.5 size-4 shrink-0 text-accent" />
            <dd className="text-muted-foreground">{BRAND.hours}</dd>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="flex items-center gap-2 text-muted-foreground">
              <Phone className="size-4 shrink-0 text-accent" />
              {BRAND.phoneDisplay}
            </span>
            <span className="flex items-center gap-2 text-muted-foreground">
              <AtSign className="size-4 shrink-0 text-accent" />
              {BRAND.instagram.replace(/^@/, '')}
            </span>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
          <span>Prototype · This Is Bali Reservations · for demonstration only — no real bookings are made.</span>
          <Link to="/admin/login" className="underline underline-offset-2 transition-colors hover:text-foreground">
            Staff login
          </Link>
        </div>
      </div>
    </footer>
  )
}
