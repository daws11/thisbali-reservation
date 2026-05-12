# This Is Bali — Reservation Prototype

A high-fidelity, **frontend-only** prototype of a customer-facing reservation system for
*This Is Bali — Balinese Food & Desserts (Ubud)*. Built from [`PRD.md`](./PRD.md).

- **Customer**: `/` redirects straight into **Reserve** (6-step flow with calendar, time slots,
  party size, interactive seating map, guest details, review). Also **Walk-in** (checks availability now,
  degrades to the waitlist) and **Waitlist** (estimated wait + queue position). Confirmation screen has a
  QR check-in stub, an `.ics` download, and a WhatsApp share link.
- **Admin** (`/admin/login` — `admin@thisbali.com` / `bali2026`): dashboard with **List / Calendar / Seating-Map**
  views, filters, a booking-detail drawer driven by a status state machine (with an audit log), and a
  quick-create flow from empty calendar slots.

No backend — all state lives in Zustand + `localStorage`, seeded from static JSON in `src/data`.
The "Reset demo data" item in the admin sidebar restores the original seed bookings.

## Stack

Vite 8 · React 19 (+ React Compiler) · TypeScript · Tailwind CSS v4 · Radix UI primitives ·
React Router v6 · Zustand · React Hook Form + Zod · date-fns · Framer Motion · lucide-react · `qrcode.react`.

## Develop

```bash
pnpm install
pnpm dev       # http://localhost:5173
pnpm build     # tsc -b && vite build
pnpm lint
pnpm preview   # serve the production build
```

## Project layout

```
src/
  app/         router, root <App> (page transitions + toaster), customer layout, RequireAuth
  routes/      customer/ (ReservationFlow, WalkInFlow, WaitlistFlow, Confirmation)
               admin/    (Login, Bookings, BookingDetailRoute, NotFound)
  components/  ui/ (Radix-backed primitives) · layout/ · booking/ · seating/ · admin/
  stores/      bookingStore · adminAuthStore · uiStore  (Zustand + persist)
  data/        seatingMap · timeSlots · seedBookings · adminUsers
  lib/         schemas (Zod) · bookingStatus (state machine) · availability · ics · whatsapp · format · …
  hooks/       useSvgPanZoom · useDraftSync · useMediaQuery
  types/       domain models
```

Real floor plan, brand assets, and backend integration are intentionally out of scope — see `PRD.md`.
