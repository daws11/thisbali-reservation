import { Link, Outlet } from 'react-router-dom'
import { Star } from 'lucide-react'
import heroImg from '@/assets/restaurant-hero.jpg'
import { BRAND } from '@/lib/constants'
import { SiteFooter } from '@/components/layout/SiteFooter'

/**
 * Two-column layout — the restaurant photo fills the left half (sticky,
 * full-height on large screens), the booking flow scrolls on the right —
 * mirroring the real list.thisbali.com reservation page. On small screens it
 * stacks: photo banner on top, content below.
 */
export function CustomerLayout() {
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* photo panel */}
      <aside className="relative h-56 shrink-0 overflow-hidden bg-surface-elevated sm:h-72 lg:sticky lg:top-0 lg:h-dvh lg:w-[45%] xl:w-[42%]">
        <img
          src={heroImg}
          alt="This Is Bali — Balinese Food &amp; Desserts, Ubud"
          className="size-full object-cover object-top lg:object-center"
          loading="eager"
          fetchPriority="high"
          decoding="async"
        />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6 lg:p-8">
          <Link to="/" className="font-display text-2xl font-bold leading-none drop-shadow-sm sm:text-3xl lg:text-4xl">
            This Is Bali
          </Link>
          <p className="mt-1.5 flex items-center gap-1.5 text-sm text-white/85 sm:mt-2">
            <Star className="size-3.5 fill-current text-amber-300" />
            <span className="font-medium text-white">4.9</span>
            <span>(16.3k reviews)</span>
            <span aria-hidden>·</span>
            <span>Balinese</span>
            <span aria-hidden>·</span>
            <span>$$</span>
            <span aria-hidden className="hidden sm:inline">·</span>
            <span className="hidden sm:inline">{BRAND.location.split(',')[1]?.trim() ?? 'Ubud'}</span>
          </p>
        </div>
      </aside>

      {/* booking flow */}
      <div className="flex min-w-0 flex-1 flex-col">
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
    </div>
  )
}
