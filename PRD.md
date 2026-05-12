# PRD: This Is Bali — Reservation Prototype (Frontend)

**Version:** 1.0
**Owner:** Oliver
**Status:** Draft — Prototype Phase
**Last Updated:** 2026-05-12
**Target:** Frontend-only prototype, optimized for handoff to Claude Code

---

## 1. Overview

### 1.1 Purpose
Build a high-fidelity, frontend-only prototype of a customer-facing reservation system for **This Is Bali — Balinese Food & Desserts (Ubud)**, inspired by the existing flow at `list.thisbali.com`, with three booking modes (Reservation, Walk-in, Waitlist), interactive seating map selection, and a complete admin dashboard for managing bookings.

### 1.2 Goals
1. Deliver a production-grade UI/UX prototype that can be demoed to stakeholders.
2. Validate the booking flow end-to-end before backend integration.
3. Provide a foundation that can later connect to a real backend with minimal refactoring.

### 1.3 Non-Goals
- No backend, no real database, no real authentication.
- No payment processing.
- No SMS/WhatsApp/email notifications (mock only).
- No multi-tenant / multi-restaurant support.
- No production analytics or monitoring.

### 1.4 Success Criteria
- Customer can complete a reservation in **≤ 60 seconds** on mobile.
- All three booking modes (Reservation / Walk-in / Waitlist) are fully functional in the UI.
- Admin can view, filter, and act on bookings across three view modes (List / Calendar / Seating Map).
- Brand identity (black/cream/gold) is consistent across every screen.
- Lighthouse mobile performance score ≥ 85.

---

## 2. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| Build tool | **Vite** | Fast HMR, modern, minimal config |
| Framework | **React 18** + **TypeScript** | Type safety, modern hooks |
| Styling | **Tailwind CSS** + **shadcn/ui** | Utility-first, consistent design tokens, accessible primitives |
| Routing | **React Router v6** | Standard, supports nested routes |
| State | **Zustand** | Lightweight, persistent middleware for localStorage |
| Forms | **React Hook Form** + **Zod** | Performant, schema-based validation |
| Dates | **date-fns** | Tree-shakeable, immutable |
| Animation | **Framer Motion** | Smooth page/element transitions |
| Icons | **lucide-react** | Consistent stroke icon set |
| Persistence | **localStorage** (via Zustand persist) | Survives page reloads in prototype |
| Mock data | Static JSON in `/src/data` | Seed seating map, time slots, dummy bookings |

### 2.1 Project Structure
```
src/
├── app/
│   ├── router.tsx
│   └── App.tsx
├── routes/
│   ├── customer/
│   │   ├── Landing.tsx
│   │   ├── ReservationFlow.tsx
│   │   ├── WalkInFlow.tsx
│   │   ├── WaitlistFlow.tsx
│   │   └── Confirmation.tsx
│   └── admin/
│       ├── Login.tsx
│       ├── Dashboard.tsx
│       ├── BookingsList.tsx
│       ├── BookingsCalendar.tsx
│       └── BookingsSeatingMap.tsx
├── components/
│   ├── ui/              # shadcn primitives
│   ├── seating/         # SeatingMap, Table, Zone
│   ├── booking/         # StepIndicator, TimeSlotPicker, PaxSelector
│   └── layout/          # Header, Footer, AdminShell
├── stores/
│   ├── bookingStore.ts
│   ├── adminAuthStore.ts
│   └── uiStore.ts
├── data/
│   ├── seatingMap.ts
│   ├── timeSlots.ts
│   └── seedBookings.ts
├── lib/
│   ├── schemas.ts       # Zod schemas
│   ├── utils.ts
│   └── constants.ts
├── types/
│   └── index.ts
└── styles/
    └── globals.css
```

---

## 3. Design System

### 3.1 Brand Tokens
Add these to `tailwind.config.ts` and as CSS variables in `globals.css`.

```css
:root {
  /* Core palette */
  --background:        #0A0A0A;  /* near-black */
  --surface:           #141414;  /* card bg */
  --surface-elevated:  #1F1F1F;  /* hover/active */
  --foreground:        #F5EEDC;  /* cream */
  --muted-foreground:  #A89F8C;  /* muted cream */
  --accent:            #C9A961;  /* gold */
  --accent-hover:      #D4B876;
  --accent-muted:      #6B5A3E;
  --border:            #2A2A2A;
  --destructive:       #B23A3A;
  --success:           #6B8E5A;

  /* Status colors */
  --status-pending:    #C9A961;
  --status-confirmed:  #6B8E5A;
  --status-seated:     #4A7CB8;
  --status-completed:  #6B7280;
  --status-cancelled:  #B23A3A;
  --status-noshow:     #8B6F4E;
}
```

### 3.2 Typography
- **Display / Headings:** `Playfair Display` (serif, weights 600/700) — for hero titles, brand mark
- **Body / UI:** `Inter` (sans-serif, weights 400/500/600) — for everything else
- **Numerics:** Inter tabular-nums for times and pax counts

Type scale (mobile-first):
- H1: `text-3xl md:text-5xl font-bold tracking-tight`
- H2: `text-2xl md:text-3xl font-semibold`
- H3: `text-lg md:text-xl font-semibold`
- Body: `text-base leading-relaxed`
- Caption: `text-sm text-muted-foreground`

### 3.3 Spacing & Layout
- Base unit: 4px (Tailwind default)
- Mobile container: `px-4`, max-width `100%`
- Tablet/Desktop: `max-w-screen-md` for customer flows, `max-w-screen-2xl` for admin
- Card padding: `p-4 md:p-6`
- Section spacing: `space-y-6 md:space-y-8`

### 3.4 Interaction Patterns
- All tappable targets ≥ 44×44 px (mobile usability)
- Buttons: gold accent for primary, outline cream for secondary, ghost for tertiary
- Active step in flow: gold underline + bold
- Selected table on map: gold fill + ring
- Hover states: subtle elevation (`bg-surface-elevated`)
- Transitions: 200ms ease for color, 300ms for layout shifts

---

## 4. Information Architecture (Routes)

| Route | Access | Description |
|---|---|---|
| `/` | Public | Landing page — choose mode (Reservation / Walk-in / Waitlist) |
| `/reserve` | Public | Reservation multi-step flow |
| `/walk-in` | Public | Walk-in request flow |
| `/waitlist` | Public | Join waitlist flow |
| `/confirmation/:bookingId` | Public | Booking confirmation screen with QR code stub |
| `/admin/login` | Public | Mock admin login |
| `/admin` | Protected | Dashboard (redirects to `/admin/bookings`) |
| `/admin/bookings` | Protected | Bookings management with view toggle (list/calendar/map) |
| `/admin/bookings/:id` | Protected | Booking detail / edit modal |

Protected routes use a `RequireAuth` wrapper that reads `adminAuthStore`.

---

## 5. User Personas

### 5.1 Customer (Primary)
- Mostly tourists or locals on mobile devices
- Mixed English / Bahasa Indonesia
- Expects fast, visual booking with clear pricing/availability cues
- May not know exact preferred table — needs visual guidance

### 5.2 Restaurant Host / Manager (Admin)
- Desktop or tablet usage during service
- Needs at-a-glance view of incoming bookings, walk-ins, and waitlist
- Frequently switches between list view (for context) and seating map (for decisions)

---

## 6. Functional Requirements — Customer

### 6.1 Landing Page (`/`)

**Components:**
- Hero section: brand logo, tagline ("Balinese Food & Desserts • Ubud"), background image of restaurant
- Three large CTA cards:
  1. **Reserve a Table** — Book in advance with date/time/seating
  2. **Walk-in** — I'm here now
  3. **Join Waitlist** — Tables full? Get notified

**Acceptance criteria:**
- Mobile-first: cards stack vertically with full width on mobile, 3-column grid on `md:` breakpoint
- Each card has icon (lucide), title, 1-line description, gold accent on hover/tap
- Footer with restaurant info, location, hours

### 6.2 Reservation Flow (`/reserve`)

**Steps (with `StepIndicator` component showing progress):**

#### Step 1 — Date
- Calendar picker (shadcn `Calendar`)
- Min: today; Max: today + 60 days
- Closed days disabled (mock: no Mondays in seed data)
- "Next" button disabled until date selected

#### Step 2 — Meal Period & Time Slot
- Tabs: **Lunch** (11:00–15:00) / **Dinner** (17:00–22:00)
- Time slot grid: 30-min intervals
- Each slot shows availability indicator:
  - Available (cream text + border)
  - Limited (gold text — fewer than 3 tables left)
  - Full (greyed out, not selectable)
- Mock: derive availability from `timeSlots.ts` + existing bookings in store

#### Step 3 — Party Size (Pax)
- Stepper component: − [number] +
- Range: 1–12
- For pax > 8, show note: "For groups over 8, please WhatsApp us"
- Selected pax filters available tables in next step

#### Step 4 — Pilih Meja (Seating Map)
- Visual seating map (see §8 for spec)
- Tables filtered by capacity ≥ selected pax and availability in chosen slot
- Tap a table to select; selected table highlighted gold with ring
- Show selected table summary at bottom: "Indoor T4 • Seats 2–4 • Window view"
- "Skip — assign best available" option for users who don't care
- Zoom + pan supported on mobile (pinch + drag)

#### Step 5 — Guest Info & Special Request
- Form fields (React Hook Form + Zod):
  - Full name (required, min 2 chars)
  - WhatsApp number (required, Indonesian format validation: starts with `08` or `+62`)
  - Email (optional, valid email format)
  - Occasion (optional select: None / Birthday / Anniversary / Date / Business / Other)
  - Special request (optional textarea, max 300 chars) — e.g., dietary, accessibility, decorations
  - Marketing opt-in checkbox (optional)

#### Step 6 — Review & Confirm
- Summary card showing all selections
- Edit buttons next to each section to jump back
- Big gold "Confirm Reservation" button
- On submit: generate booking ID, store in Zustand, navigate to `/confirmation/:id`

**Cross-cutting:**
- Persistent bottom bar on mobile with "Back" / "Next" buttons
- "Save & exit" option in header — persists draft to localStorage
- Refreshing mid-flow restores the user's progress

### 6.3 Walk-in Flow (`/walk-in`)

Shorter than reservation since the guest is already there.

**Steps:**
1. **Pax** — Stepper 1–12
2. **Check availability** — Page queries available tables now; either:
   - **Tables available:** Show available tables on seating map → select → guest name + WhatsApp → confirm → admin notified
   - **No tables:** Show estimated wait time (mocked) → offer to join waitlist (deep-link to `/waitlist` with pax pre-filled)
3. **Confirmation** — Same screen as reservation but tagged "Walk-in"

### 6.4 Waitlist Flow (`/waitlist`)

**Steps:**
1. **Pax** — Stepper 1–12
2. **Estimated wait** — Mocked: `15 + (pax * 5)` minutes based on current waitlist queue length
3. **Guest info** — Name, WhatsApp, optional email
4. **Confirmation** — Position in queue (e.g., "You're #3 in line"), instruction to wait near the restaurant, mock "We'll WhatsApp you when ready"

### 6.5 Confirmation Page (`/confirmation/:bookingId`)

- Big checkmark icon, "You're confirmed!" headline
- Booking summary (all details)
- Mock QR code (use `qrcode.react` or a static SVG placeholder) — for check-in
- Action buttons:
  - "Add to Calendar" (generates `.ics` file client-side)
  - "Share via WhatsApp" (opens WhatsApp deep link with pre-filled message)
  - "Modify or Cancel" (links to a self-service edit flow — out of scope for v1, link can show "coming soon")
- Note: "We've sent confirmation to your WhatsApp" (mock)

---

## 7. Functional Requirements — Admin

### 7.1 Login (`/admin/login`)

- Simple form: email + password
- Mock credentials hardcoded in `data/adminUsers.ts`:
  - `admin@thisbali.com` / `bali2026`
- On success: set `isAuthenticated: true` in `adminAuthStore`, redirect to `/admin/bookings`
- Wrong credentials: show error toast
- "Remember me" checkbox — persists auth in localStorage; otherwise sessionStorage

### 7.2 Admin Shell

- Sidebar (collapsible on mobile, drawer pattern):
  - Logo
  - Bookings (active)
  - Settings (placeholder, disabled)
  - Logout
- Top bar:
  - Date selector (today by default)
  - Quick stats: Today's bookings count, Pax expected, Walk-ins, Waitlist length
  - User menu (avatar, logout)

### 7.3 Bookings Page (`/admin/bookings`)

**View toggle** (segmented control, top right):
- **List** — Default
- **Calendar** — Week + day view
- **Seating Map** — Floor plan with time-slider

#### 7.3.1 List View
- Table with columns:
  - Time (sortable, default sort)
  - Guest name
  - Pax
  - Table
  - Mode (badge: Reservation / Walk-in / Waitlist)
  - Status (colored badge)
  - Special request indicator (icon if present)
  - Actions (kebab menu)
- Filters (top of table):
  - Date range
  - Status (multi-select)
  - Mode (multi-select)
  - Search (name or phone)
- Row click → opens booking detail drawer
- Empty state with illustration when no bookings match filters

#### 7.3.2 Calendar View
- Toggle: **Day** / **Week**
- Day view: vertical timeline 10:00–23:00, each booking shown as a block aligned to its time + duration, colored by status
- Week view: 7-column grid, each column is a day, bookings shown as compact cards
- Click a block → opens booking detail drawer
- Click empty slot → quick-create booking modal (admin-side booking entry)

#### 7.3.3 Seating Map View
- Floor plan with all zones and tables visible
- **Time slider** at top: scrub through the day in 30-min increments
- Each table colored by status for the selected time slot:
  - Cream (empty)
  - Gold (reserved, not yet seated)
  - Blue (seated)
  - Grey (completed)
  - Red ring (no-show)
- Hover/tap a table → tooltip with current booking info
- Click → opens booking detail
- Legend at bottom

### 7.4 Booking Detail Drawer

- Slides in from right (full-screen sheet on mobile)
- Shows all booking info
- Editable fields: time, pax, table, special request, status
- Action buttons (based on current status):
  - **Pending** → Confirm | Cancel
  - **Confirmed** → Mark as Seated | Edit | Cancel
  - **Seated** → Mark as Completed | Mark as No-show
  - **Cancelled / Completed / No-show** → View only
- Audit log at bottom: "Confirmed by admin at 14:32" etc.
- "Send WhatsApp" button (mock — opens WhatsApp deep link with template message)

### 7.5 Status State Machine

```
[Pending] --confirm--> [Confirmed] --seat--> [Seated] --complete--> [Completed]
   |                       |                    |
   v                       v                    v
[Cancelled]            [Cancelled]          [No-show]
```

- Reservations start as `Pending`
- Walk-ins start as `Confirmed` (since they're already there)
- Waitlist entries start as `Waitlisted`, can transition to `Confirmed` once a table opens

---

## 8. Seating Map Specification (Dummy)

**Note:** Real floor plan to be provided later. Build with dummy data that's easy to swap.

### 8.1 Zones
1. **Indoor Dining** — 8 tables (mix of 2-pax, 4-pax, 6-pax)
2. **Outdoor Terrace** — 6 tables (mostly 4-pax, one 8-pax communal)
3. **Floating Chair Area** ⭐ (signature) — 4 swing/floating chairs (2-pax each)
4. **Bar Counter** — 6 bar stools (1-pax each)

### 8.2 Data Model

```typescript
// src/types/index.ts

export type ZoneId = 'indoor' | 'terrace' | 'floating' | 'bar';

export interface Zone {
  id: ZoneId;
  name: string;
  description: string;
  // Bounding box on the canvas (percentage of total canvas)
  bounds: { x: number; y: number; width: number; height: number };
}

export type TableShape = 'round' | 'square' | 'rectangle' | 'stool' | 'swing';

export interface Table {
  id: string;            // e.g., "I-T1", "T-T4", "F-T2"
  zoneId: ZoneId;
  label: string;         // e.g., "T1"
  shape: TableShape;
  capacity: { min: number; max: number };
  // Position on canvas (percentage)
  position: { x: number; y: number };
  // Dimensions on canvas (percentage)
  size: { width: number; height: number };
  features?: string[];   // e.g., ["window-view", "wheelchair-accessible"]
  combinableWith?: string[]; // table IDs this can join with for large parties
}
```

### 8.3 Seed Data Structure

```typescript
// src/data/seatingMap.ts
export const zones: Zone[] = [
  { id: 'indoor',   name: 'Indoor Dining',     description: 'Air-conditioned, cozy',   bounds: { x: 0,  y: 0,  width: 50, height: 60 } },
  { id: 'terrace',  name: 'Outdoor Terrace',   description: 'Open-air, garden view',   bounds: { x: 50, y: 0,  width: 50, height: 60 } },
  { id: 'floating', name: 'Floating Chairs',   description: 'Signature swing seats',   bounds: { x: 0,  y: 60, width: 60, height: 40 } },
  { id: 'bar',      name: 'Bar Counter',       description: 'Counter seating',         bounds: { x: 60, y: 60, width: 40, height: 40 } },
];

export const tables: Table[] = [
  // ~24 tables total, dummy positions
];
```

### 8.4 Rendering
- Use **SVG canvas** (not absolutely-positioned divs) for crisp rendering at any zoom level
- Container has a fixed aspect ratio (e.g., 4:3) and scales responsively
- Each table is an interactive `<g>` element with click + hover handlers
- Zones rendered as labeled rectangles in the background
- Mobile: support pinch-to-zoom (via `react-svg-pan-zoom` or similar) and pan

---

## 9. Data Models

### 9.1 Booking

```typescript
export type BookingMode = 'reservation' | 'walk-in' | 'waitlist';

export type BookingStatus =
  | 'pending'
  | 'confirmed'
  | 'seated'
  | 'completed'
  | 'cancelled'
  | 'no-show'
  | 'waitlisted';

export type Occasion = 'none' | 'birthday' | 'anniversary' | 'date' | 'business' | 'other';

export interface Booking {
  id: string;                          // e.g., "TIB-2026-0042"
  mode: BookingMode;
  status: BookingStatus;
  // Scheduling
  date: string;                        // ISO date "2026-05-15"
  timeSlot: string;                    // "19:00"
  durationMinutes: number;             // default 90
  // Party
  pax: number;
  tableId: string | null;              // null for waitlist or unassigned walk-in
  // Guest
  guest: {
    name: string;
    whatsapp: string;                  // E.164 normalized
    email?: string;
  };
  occasion: Occasion;
  specialRequest?: string;
  marketingOptIn: boolean;
  // Metadata
  createdAt: string;                   // ISO datetime
  updatedAt: string;
  auditLog: AuditEntry[];
}

export interface AuditEntry {
  timestamp: string;
  action: string;                      // "created" | "confirmed" | "seated" | ...
  by: 'customer' | 'admin';
  note?: string;
}
```

### 9.2 Zustand Stores

```typescript
// stores/bookingStore.ts
interface BookingStore {
  bookings: Booking[];
  draftBooking: Partial<Booking> | null;

  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'updatedAt' | 'auditLog'>) => Booking;
  updateBooking: (id: string, patch: Partial<Booking>, by: 'customer' | 'admin') => void;
  cancelBooking: (id: string, by: 'customer' | 'admin') => void;
  setDraft: (draft: Partial<Booking>) => void;
  clearDraft: () => void;

  // Selectors
  getBookingById: (id: string) => Booking | undefined;
  getBookingsByDate: (date: string) => Booking[];
  getAvailableTablesForSlot: (date: string, timeSlot: string, pax: number) => Table[];
}

// stores/adminAuthStore.ts
interface AdminAuthStore {
  isAuthenticated: boolean;
  user: { email: string; name: string } | null;
  login: (email: string, password: string) => boolean;
  logout: () => void;
}
```

Both stores use `zustand/middleware` `persist` to localStorage.

---

## 10. Validation Schemas (Zod)

```typescript
// lib/schemas.ts
export const indonesianPhoneRegex = /^(?:\+62|62|0)8\d{8,11}$/;

export const guestInfoSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(80),
  whatsapp: z.string().regex(indonesianPhoneRegex, 'Please enter a valid Indonesian phone number'),
  email: z.string().email().optional().or(z.literal('')),
  occasion: z.enum(['none', 'birthday', 'anniversary', 'date', 'business', 'other']).default('none'),
  specialRequest: z.string().max(300).optional(),
  marketingOptIn: z.boolean().default(false),
});

export const reservationSchema = z.object({
  date: z.string(),
  timeSlot: z.string().regex(/^\d{2}:\d{2}$/),
  pax: z.number().int().min(1).max(12),
  tableId: z.string().nullable(),
}).merge(guestInfoSchema);
```

---

## 11. Acceptance Criteria

### Customer
- [ ] User can complete reservation flow on mobile in under 60 seconds with no errors
- [ ] All form validation errors are inline, with clear messages in EN (BI labels can be added in v2)
- [ ] Refreshing mid-flow restores draft state
- [ ] Seating map is pinch-zoomable on mobile and click-to-select on desktop
- [ ] Filtering by pax hides tables that don't fit (with clear "X tables hidden" indicator)
- [ ] Walk-in flow gracefully degrades to waitlist when no tables available
- [ ] Confirmation page generates valid `.ics` file and working WhatsApp deep link

### Admin
- [ ] Login persists across page reloads when "Remember me" is checked
- [ ] All three views (List / Calendar / Map) show the same underlying data and stay in sync
- [ ] Time slider on seating map updates table states in <100ms
- [ ] Status transitions follow the state machine (no invalid transitions allowed)
- [ ] Audit log shows every change with timestamp and actor
- [ ] Empty states are handled gracefully (no white screens or crashes)

### Brand & UX
- [ ] All screens use the documented color palette (no off-brand colors)
- [ ] All headings use Playfair Display, body uses Inter
- [ ] All tap targets ≥ 44×44 px on mobile
- [ ] Page transitions are smooth (Framer Motion)
- [ ] Lighthouse mobile performance ≥ 85, accessibility ≥ 95

---

## 12. Out of Scope (v1)

- Real backend / API integration
- Real authentication (OAuth, SSO)
- Payment / deposit handling
- Real WhatsApp / email notifications
- Multi-language UI (will add EN/BI toggle in v2)
- Self-service booking modification by customer (link to "coming soon")
- Analytics dashboards beyond basic stats
- Print-friendly views

---

## 13. Future Enhancements (Post-Prototype)

1. **Backend integration** — Replace Zustand stores with API client (TanStack Query)
2. **Real auth** — Supabase or NextAuth
3. **WhatsApp Business API** — auto-send confirmations and reminders (leveraging existing WABA infrastructure)
4. **Bilingual UI** — EN + Bahasa Indonesia toggle
5. **Customer self-service** — modify/cancel via link
6. **Capacity & yield optimization** — auto-suggest tables to maximize covers
7. **Floor plan editor** — admin can drag-drop tables to design the map
8. **Reporting** — covers per day, no-show rate, occasion breakdown
9. **Integration with POS** — link bookings to actual orders

---

## 14. Implementation Order (Suggested for Claude Code)

To minimize blocking and enable parallel demoability:

1. **Foundation** — Vite + TS + Tailwind + shadcn setup, brand tokens, fonts, routing skeleton
2. **Data layer** — Types, Zod schemas, seed data, Zustand stores
3. **Customer Landing** — Mode selection cards
4. **Reservation Flow** — Steps 1–3 (date, time, pax) first; Step 4 (seating map) second; Steps 5–6 (info, review) third
5. **Seating Map component** — Reusable for customer + admin views
6. **Confirmation page** — With QR placeholder, .ics generator, WhatsApp deep link
7. **Walk-in + Waitlist flows** — Reuse Reservation components
8. **Admin Login + Shell** — Mock auth, sidebar, top bar
9. **Admin List View** — Table with filters, detail drawer
10. **Admin Calendar View** — Day + week
11. **Admin Seating Map View** — Time slider, status coloring
12. **Polish** — Animations, empty states, error boundaries, Lighthouse pass

---

## 15. Open Questions

These can be answered before or during implementation:

1. **Seating map source of truth** — Final floor plan dimensions and exact table positions still pending. Build with dummy, structure to swap easily.
2. **Operating hours** — Confirm lunch (11:00–15:00) and dinner (17:00–22:00) windows.
3. **Closed days** — Confirm Monday closure (currently a placeholder).
4. **Booking duration** — Default 90 minutes — confirm or adjust per zone (e.g., bar may be shorter).
5. **Capacity rules** — Are there any tables that should never be assigned to fewer than X pax (to avoid wasting 6-pax tables on duos)? Adjust filtering accordingly.
6. **Brand assets** — Final logo file (SVG preferred), restaurant photos for landing hero.

---

**End of PRD.**
