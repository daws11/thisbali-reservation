import type { Table, Zone } from '@/types'

// Dummy floor plan — structured so the real plan can be dropped in later.
// Coordinates are percentages of the canvas (0–100). The SVG renderer maps
// them onto a 4:3 viewBox.

export const zones: Zone[] = [
  {
    id: 'indoor',
    name: 'Indoor Dining',
    description: 'Air-conditioned, cozy',
    bounds: { x: 2, y: 3, width: 46, height: 55 },
  },
  {
    id: 'terrace',
    name: 'Outdoor Terrace',
    description: 'Open-air, garden view',
    bounds: { x: 52, y: 3, width: 46, height: 55 },
  },
  {
    id: 'floating',
    name: 'Floating Chairs',
    description: 'Signature swing seats',
    bounds: { x: 2, y: 62, width: 58, height: 35 },
  },
  {
    id: 'bar',
    name: 'Bar Counter',
    description: 'Counter seating',
    bounds: { x: 62, y: 62, width: 36, height: 35 },
  },
]

const round = (capacity: number) => ({ shape: 'round' as const, capacity: { min: capacity, max: capacity }, size: { width: 8, height: 8 } })
const square = (capacity: number) => ({ shape: 'square' as const, capacity: { min: capacity, max: capacity }, size: { width: 10, height: 10 } })
const rect = (min: number, max: number, w = 16, h = 9) => ({ shape: 'rectangle' as const, capacity: { min, max }, size: { width: w, height: h } })
const swing = () => ({ shape: 'swing' as const, capacity: { min: 1, max: 2 }, size: { width: 9, height: 9 } })
const stool = () => ({ shape: 'stool' as const, capacity: { min: 1, max: 1 }, size: { width: 5, height: 5 } })

export const tables: Table[] = [
  // ── Indoor (8) ────────────────────────────────────────────────────────────
  { id: 'I-T1', zoneId: 'indoor', label: 'T1', ...round(2), position: { x: 11, y: 18 }, features: ['window-view'] },
  { id: 'I-T2', zoneId: 'indoor', label: 'T2', ...round(2), position: { x: 22, y: 18 }, features: ['window-view'] },
  { id: 'I-T3', zoneId: 'indoor', label: 'T3', ...round(2), position: { x: 33, y: 18 } },
  { id: 'I-T4', zoneId: 'indoor', label: 'T4', ...round(2), position: { x: 43, y: 18 } },
  { id: 'I-T5', zoneId: 'indoor', label: 'T5', ...square(4), position: { x: 13, y: 38 }, combinableWith: ['I-T6'] },
  { id: 'I-T6', zoneId: 'indoor', label: 'T6', ...square(4), position: { x: 27, y: 38 }, combinableWith: ['I-T5'] },
  { id: 'I-T7', zoneId: 'indoor', label: 'T7', ...rect(4, 6), position: { x: 40, y: 38 } },
  { id: 'I-T8', zoneId: 'indoor', label: 'T8', ...square(4), position: { x: 14, y: 52 }, features: ['wheelchair-accessible'] },

  // ── Terrace (6) ───────────────────────────────────────────────────────────
  { id: 'T-T1', zoneId: 'terrace', label: 'T1', ...square(4), position: { x: 61, y: 19 }, features: ['garden-view'] },
  { id: 'T-T2', zoneId: 'terrace', label: 'T2', ...square(4), position: { x: 74, y: 19 }, features: ['garden-view'] },
  { id: 'T-T3', zoneId: 'terrace', label: 'T3', ...square(4), position: { x: 88, y: 19 } },
  { id: 'T-T4', zoneId: 'terrace', label: 'T4', ...square(4), position: { x: 60, y: 37 } },
  { id: 'T-T5', zoneId: 'terrace', label: 'T5', ...rect(4, 6), position: { x: 80, y: 37 }, features: ['garden-view'] },
  { id: 'T-T6', zoneId: 'terrace', label: 'Communal', ...rect(6, 8, 24, 9), position: { x: 78, y: 52 }, features: ['communal', 'garden-view'] },

  // ── Floating chairs (4) — signature ───────────────────────────────────────
  { id: 'F-S1', zoneId: 'floating', label: 'S1', ...swing(), position: { x: 13, y: 81 }, features: ['signature', 'photogenic'] },
  { id: 'F-S2', zoneId: 'floating', label: 'S2', ...swing(), position: { x: 27, y: 81 }, features: ['signature', 'photogenic'] },
  { id: 'F-S3', zoneId: 'floating', label: 'S3', ...swing(), position: { x: 41, y: 81 }, features: ['signature', 'photogenic'] },
  { id: 'F-S4', zoneId: 'floating', label: 'S4', ...swing(), position: { x: 54, y: 81 }, features: ['signature', 'photogenic'] },

  // ── Bar counter (6) ───────────────────────────────────────────────────────
  { id: 'B-1', zoneId: 'bar', label: 'B1', ...stool(), position: { x: 66, y: 80 } },
  { id: 'B-2', zoneId: 'bar', label: 'B2', ...stool(), position: { x: 72, y: 80 } },
  { id: 'B-3', zoneId: 'bar', label: 'B3', ...stool(), position: { x: 78, y: 80 } },
  { id: 'B-4', zoneId: 'bar', label: 'B4', ...stool(), position: { x: 84, y: 80 } },
  { id: 'B-5', zoneId: 'bar', label: 'B5', ...stool(), position: { x: 90, y: 80 } },
  { id: 'B-6', zoneId: 'bar', label: 'B6', ...stool(), position: { x: 95, y: 80 } },
]

export const tablesById: Record<string, Table> = Object.fromEntries(
  tables.map((t) => [t.id, t]),
)

export const zonesById: Record<string, Zone> = Object.fromEntries(
  zones.map((z) => [z.id, z]),
)

export function tableSummary(table: Table): string {
  const zone = zonesById[table.zoneId]
  const cap = table.capacity.min === table.capacity.max ? `${table.capacity.max}` : `${table.capacity.min}–${table.capacity.max}`
  const feat = table.features?.length ? ` · ${table.features.map(prettyFeature).join(', ')}` : ''
  return `${zone?.name ?? table.zoneId} · ${table.label} · Seats ${cap}${feat}`
}

export function prettyFeature(f: string): string {
  switch (f) {
    case 'window-view': return 'Window view'
    case 'garden-view': return 'Garden view'
    case 'wheelchair-accessible': return 'Wheelchair accessible'
    case 'communal': return 'Communal table'
    case 'signature': return 'Signature'
    case 'photogenic': return 'Photogenic'
    case 'counter': return 'Counter'
    default: return f
  }
}
