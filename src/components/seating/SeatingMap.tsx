import * as React from 'react'
import { Maximize2, Minus, Plus } from 'lucide-react'
import { tables, zones } from '@/data/seatingMap'
import { tableFits } from '@/lib/availability'
import { useSvgPanZoom } from '@/hooks/useSvgPanZoom'
import { cn } from '@/lib/cn'
import type { Booking, Table } from '@/types'
import { BASE_H, BASE_W } from './canvas'
import { TableShape } from './TableShape'
import { ZoneRect } from './ZoneRect'

export type SeatingMapMode = 'select' | 'admin' | 'display'

export interface SeatingMapProps {
  mode: SeatingMapMode
  className?: string
  panZoom?: boolean

  // select mode
  selectedTableId?: string | null
  onSelectTable?: (table: Table | null) => void
  filterPax?: number
  availableTableIds?: Set<string>

  // admin mode
  bookingsByTableId?: Map<string, Booking>
  onTableClick?: (table: Table, booking?: Booking) => void
}

export function SeatingMap({
  mode,
  className,
  panZoom = false,
  selectedTableId = null,
  onSelectTable,
  filterPax,
  availableTableIds,
  bookingsByTableId,
  onTableClick,
}: SeatingMapProps) {
  const { svgRef, viewBox, isZoomed, reset, zoomBy } = useSvgPanZoom({
    width: BASE_W,
    height: BASE_H,
    enabled: panZoom,
    minScale: 1,
    maxScale: 4,
  })

  const renderTable = (table: Table) => {
    const fits = filterPax == null || tableFits(table, filterPax)
    const isAvailable = availableTableIds ? availableTableIds.has(table.id) : true
    const booking = bookingsByTableId?.get(table.id)

    let selectable = false
    if (mode === 'select') selectable = fits && isAvailable
    if (mode === 'admin') selectable = true

    const handleActivate = () => {
      if (mode === 'select') {
        if (!selectable) return
        onSelectTable?.(selectedTableId === table.id ? null : table)
      } else if (mode === 'admin') {
        onTableClick?.(table, booking)
      }
    }

    return (
      <TableShape
        key={table.id}
        table={table}
        mode={mode}
        selectable={selectable}
        selected={mode === 'select' && selectedTableId === table.id}
        dimmed={mode === 'select' && !fits}
        unavailable={mode === 'select' && fits && !isAvailable}
        booking={booking}
        onActivate={handleActivate}
      />
    )
  }

  return (
    <div
      className={cn(
        'relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-border bg-surface',
        className,
      )}
    >
      <svg
        ref={panZoom ? svgRef : undefined}
        viewBox={panZoom ? viewBox : `0 0 ${BASE_W} ${BASE_H}`}
        preserveAspectRatio="none"
        className={cn('absolute inset-0 size-full', panZoom && 'touch-none cursor-grab active:cursor-grabbing')}
        role="img"
        aria-label="Restaurant floor plan"
      >
        <rect x={0} y={0} width={BASE_W} height={BASE_H} fill="var(--color-surface)" />
        {zones.map((z) => (
          <ZoneRect key={z.id} zone={z} />
        ))}
        {tables.map(renderTable)}
      </svg>

      {panZoom && (
        <div className="absolute bottom-2.5 right-2.5 flex flex-col gap-1.5">
          <ZoomButton label="Zoom in" onClick={() => zoomBy(1.4)}>
            <Plus className="size-4" />
          </ZoomButton>
          <ZoomButton label="Zoom out" onClick={() => zoomBy(1 / 1.4)}>
            <Minus className="size-4" />
          </ZoomButton>
          {isZoomed && (
            <ZoomButton label="Reset view" onClick={reset}>
              <Maximize2 className="size-3.5" />
            </ZoomButton>
          )}
        </div>
      )}
    </div>
  )
}

function ZoomButton({
  children,
  label,
  onClick,
}: {
  children: React.ReactNode
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-lg border border-border bg-surface/90 text-muted-foreground backdrop-blur transition-colors hover:bg-surface-elevated hover:text-foreground"
    >
      {children}
    </button>
  )
}
