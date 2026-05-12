import { useState } from 'react'
import type { Booking, BookingStatus, Table } from '@/types'
import { tableSummary } from '@/data/seatingMap'
import { px } from './canvas'
import type { SeatingMapMode } from './SeatingMap'

interface TableShapeProps {
  table: Table
  mode: SeatingMapMode
  selectable: boolean
  selected: boolean
  dimmed: boolean // doesn't fit party size (select mode)
  unavailable: boolean // fits but slot is full (select mode)
  booking?: Booking
  onActivate?: () => void
}

interface Visual {
  fill: string
  stroke: string
  strokeWidth: number
  opacity: number
  textFill: string
  ring?: string
  cursor: string
}

const TRANSPARENT = 'transparent'
/** a faint tint of the (dark) foreground colour over transparent */
const tint = (pct: number) => `color-mix(in oklab, var(--color-foreground) ${pct}%, transparent)`
const statusColor = (s: BookingStatus) =>
  `var(--color-status-${s === 'no-show' ? 'noshow' : s})`

function computeVisual(p: TableShapeProps, hover: boolean): Visual {
  const { mode } = p

  if (mode === 'display') {
    return { fill: tint(6), stroke: 'var(--color-muted-foreground)', strokeWidth: 1, opacity: 0.6, textFill: 'var(--color-muted-foreground)', cursor: 'default' }
  }

  if (mode === 'select') {
    if (p.selected) {
      return {
        fill: 'var(--color-accent)',
        stroke: 'var(--color-accent-hover)',
        strokeWidth: 2.5,
        opacity: 1,
        textFill: 'var(--color-background)',
        ring: 'color-mix(in oklab, var(--color-accent) 45%, transparent)',
        cursor: 'pointer',
      }
    }
    if (p.dimmed) {
      return { fill: TRANSPARENT, stroke: 'var(--color-border)', strokeWidth: 1, opacity: 0.2, textFill: 'var(--color-muted-foreground)', cursor: 'default' }
    }
    if (p.unavailable) {
      return { fill: tint(4), stroke: 'var(--color-border)', strokeWidth: 1, opacity: 0.45, textFill: 'var(--color-muted-foreground)', cursor: 'not-allowed' }
    }
    // available
    return {
      fill: hover ? tint(14) : tint(7),
      stroke: hover ? 'var(--color-accent)' : tint(38),
      strokeWidth: 1.5,
      opacity: 1,
      textFill: 'var(--color-foreground)',
      cursor: 'pointer',
    }
  }

  // admin
  const b = p.booking
  if (!b) {
    return { fill: hover ? tint(9) : tint(5), stroke: 'var(--color-border)', strokeWidth: 1, opacity: 0.85, textFill: 'var(--color-muted-foreground)', cursor: 'pointer' }
  }
  switch (b.status) {
    case 'pending':
    case 'confirmed':
      // PRD floor-plan legend: gold = reserved, not yet seated.
      return { fill: 'var(--color-status-pending)', stroke: 'var(--color-accent-hover)', strokeWidth: 1.5, opacity: hover ? 1 : 0.95, textFill: 'var(--color-background)', cursor: 'pointer' }
    case 'seated':
      return { fill: statusColor('seated'), stroke: statusColor('seated'), strokeWidth: 1.5, opacity: 1, textFill: 'var(--color-background)', cursor: 'pointer' }
    case 'completed':
      return { fill: `color-mix(in oklab, ${statusColor('completed')} 45%, var(--color-surface))`, stroke: statusColor('completed'), strokeWidth: 1, opacity: 0.85, textFill: 'var(--color-foreground)', cursor: 'pointer' }
    case 'no-show':
      return { fill: `color-mix(in oklab, ${statusColor('no-show')} 14%, transparent)`, stroke: statusColor('cancelled'), strokeWidth: 3, opacity: 1, textFill: statusColor('cancelled'), cursor: 'pointer' }
    default:
      return { fill: tint(5), stroke: 'var(--color-border)', strokeWidth: 1, opacity: 0.85, textFill: 'var(--color-muted-foreground)', cursor: 'pointer' }
  }
}

export function TableShape(props: TableShapeProps) {
  const { table, mode, selectable, onActivate, booking } = props
  const [hover, setHover] = useState(false)
  const v = computeVisual(props, hover && selectable)

  const cx = px(table.position.x, 'x')
  const cy = px(table.position.y, 'y')
  const w = px(table.size.width, 'x')
  const h = px(table.size.height, 'y')
  const isCircular = table.shape === 'round' || table.shape === 'stool' || table.shape === 'swing'
  const r = w / 2

  // generous, transparent hit target (≥ ~44px at typical render scales)
  const hitR = Math.max(r + 7, 14)
  const hitW = Math.max(w + 14, 28)
  const hitH = Math.max(h + 14, 28)

  const interactive = !!onActivate && (mode === 'admin' || selectable)
  const labelSize = Math.min(Math.max(r * 0.7, 7), 12)

  const ariaLabel =
    mode === 'admin'
      ? booking
        ? `${table.label}: ${booking.guest.name}, ${booking.pax} guests at ${booking.timeSlot}`
        : `${table.label}: empty`
      : `${tableSummary(table)}${props.unavailable ? ' (unavailable)' : props.dimmed ? " (doesn't fit your party)" : ''}`

  return (
    <g
      transform={`translate(${cx} ${cy})`}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      aria-pressed={mode === 'select' ? props.selected : undefined}
      style={{ cursor: v.cursor, opacity: v.opacity, transition: 'opacity 0.15s' }}
      onClick={interactive ? onActivate : undefined}
      onKeyDown={
        interactive
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onActivate?.()
              }
            }
          : undefined
      }
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <title>{ariaLabel}</title>

      {/* invisible hit target */}
      {interactive &&
        (isCircular ? (
          <circle r={hitR} fill="transparent" style={{ pointerEvents: 'all' }} />
        ) : (
          <rect x={-hitW / 2} y={-hitH / 2} width={hitW} height={hitH} fill="transparent" style={{ pointerEvents: 'all' }} />
        ))}

      {/* selection ring */}
      {v.ring &&
        (isCircular ? (
          <circle r={r + 4.5} fill="none" stroke={v.ring} strokeWidth={3} style={{ pointerEvents: 'none' }} />
        ) : (
          <rect x={-w / 2 - 4.5} y={-h / 2 - 4.5} width={w + 9} height={h + 9} rx={8} fill="none" stroke={v.ring} strokeWidth={3} style={{ pointerEvents: 'none' }} />
        ))}

      {/* the table glyph */}
      {isCircular ? (
        <circle r={r} style={{ fill: v.fill, stroke: v.stroke, strokeWidth: v.strokeWidth, pointerEvents: 'none', transition: 'fill 0.15s, stroke 0.15s' }} />
      ) : (
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={5} style={{ fill: v.fill, stroke: v.stroke, strokeWidth: v.strokeWidth, pointerEvents: 'none', transition: 'fill 0.15s, stroke 0.15s' }} />
      )}

      {/* swing-chair hint: two little hangers */}
      {table.shape === 'swing' && (
        <>
          <line x1={-r * 0.55} y1={-r} x2={-r * 0.3} y2={-r * 1.55} style={{ stroke: v.stroke, strokeWidth: 1, pointerEvents: 'none' }} />
          <line x1={r * 0.55} y1={-r} x2={r * 0.3} y2={-r * 1.55} style={{ stroke: v.stroke, strokeWidth: 1, pointerEvents: 'none' }} />
        </>
      )}

      <text
        textAnchor="middle"
        dominantBaseline="central"
        style={{ fill: v.textFill, fontSize: labelSize, fontWeight: 600, fontFamily: 'var(--font-sans)', pointerEvents: 'none', userSelect: 'none' }}
      >
        {mode === 'admin' && booking ? `${booking.pax}` : table.label}
      </text>
    </g>
  )
}
