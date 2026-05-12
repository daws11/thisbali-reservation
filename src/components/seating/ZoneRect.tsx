import type { Zone } from '@/types'
import { px } from './canvas'

export function ZoneRect({ zone }: { zone: Zone }) {
  const x = px(zone.bounds.x, 'x')
  const y = px(zone.bounds.y, 'y')
  const w = px(zone.bounds.width, 'x')
  const h = px(zone.bounds.height, 'y')
  return (
    <g aria-hidden>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={9}
        style={{
          fill: 'color-mix(in oklab, var(--color-accent) 4%, transparent)',
          stroke: 'var(--color-accent-muted)',
          strokeWidth: 1,
          strokeDasharray: '4 4',
        }}
      />
      <text
        x={x + 7}
        y={y + 13}
        style={{
          fill: 'var(--color-muted-foreground)',
          fontSize: 8.5,
          fontWeight: 600,
          letterSpacing: '0.6px',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-sans)',
        }}
      >
        {zone.name}
      </text>
    </g>
  )
}
