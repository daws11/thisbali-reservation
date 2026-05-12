import { useMemo, useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { CalendarDays, LayoutGrid, List, Map } from 'lucide-react'

import { useBookings } from '@/stores/bookingStore'
import { useUiStore } from '@/stores/uiStore'
import { bookingsByTableAt } from '@/lib/availability'
import { formatDate } from '@/lib/format'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { Card, CardContent } from '@/components/ui/card'
import { BookingsToolbar } from '@/components/admin/BookingsToolbar'
import { BookingsTable } from '@/components/admin/BookingsTable'
import { DayTimeline } from '@/components/admin/DayTimeline'
import { WeekGrid } from '@/components/admin/WeekGrid'
import { QuickCreateDialog } from '@/components/admin/QuickCreateDialog'
import { SeatingMap } from '@/components/seating/SeatingMap'
import { SeatingLegend } from '@/components/seating/SeatingLegend'
import { TimeScrubber } from '@/components/seating/TimeScrubber'
import {
  compareByDateTime,
  inDateScope,
  matchesFilters,
  type DateScope,
  type ListFilters,
} from '@/components/admin/filterBookings'
import type { AdminViewMode, CalendarMode } from '@/stores/uiStore'

const EMPTY_FILTERS: ListFilters = { search: '', statuses: [], modes: [] }

export default function AdminBookings() {
  const navigate = useNavigate()
  const allBookings = useBookings()

  const viewMode = useUiStore((s) => s.adminViewMode)
  const setViewMode = useUiStore((s) => s.setAdminViewMode)
  const calendarMode = useUiStore((s) => s.calendarMode)
  const setCalendarMode = useUiStore((s) => s.setCalendarMode)
  const selectedDate = useUiStore((s) => s.selectedDate)
  const mapScrubTime = useUiStore((s) => s.mapScrubTime)
  const setMapScrubTime = useUiStore((s) => s.setMapScrubTime)

  const [filters, setFilters] = useState<ListFilters>(EMPTY_FILTERS)
  const [dateScope, setDateScope] = useState<DateScope>('day')
  const [sortDesc, setSortDesc] = useState(false)
  const [quickCreate, setQuickCreate] = useState<{ date: string; time: string } | null>(null)

  const openDetail = (id: string) => navigate(`/admin/bookings/${id}`)

  // common filtered set (matches search/status/mode)
  const baseFiltered = useMemo(() => allBookings.filter((b) => matchesFilters(b, filters)), [allBookings, filters])

  const listBookings = useMemo(() => {
    const list = baseFiltered.filter((b) => inDateScope(b, dateScope, selectedDate)).sort(compareByDateTime)
    return sortDesc ? list.reverse() : list
  }, [baseFiltered, dateScope, selectedDate, sortDesc])

  const dayBookings = useMemo(() => baseFiltered.filter((b) => b.date === selectedDate), [baseFiltered, selectedDate])
  const mapBookings = useMemo(
    () => bookingsByTableAt(baseFiltered, selectedDate, mapScrubTime),
    [baseFiltered, selectedDate, mapScrubTime],
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold">Bookings</h1>
          <p className="text-sm text-muted-foreground">
            {viewMode === 'list' ? 'All reservations, walk-ins and waitlist' : formatDate(selectedDate)}
          </p>
        </div>
        <SegmentedControl<AdminViewMode>
          aria-label="View"
          value={viewMode}
          onValueChange={setViewMode}
          options={[
            { value: 'list', icon: <List className="size-4" />, label: 'List' },
            { value: 'calendar', icon: <CalendarDays className="size-4" />, label: 'Calendar' },
            { value: 'map', icon: <Map className="size-4" />, label: 'Map' },
          ]}
        />
      </div>

      {viewMode === 'list' && (
        <>
          <BookingsToolbar
            filters={filters}
            onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
            onReset={() => setFilters(EMPTY_FILTERS)}
            dateScope={dateScope}
            onDateScope={setDateScope}
            resultCount={listBookings.length}
          />
          <BookingsTable
            bookings={listBookings}
            sortDesc={sortDesc}
            onToggleSort={() => setSortDesc((v) => !v)}
            onRowClick={openDetail}
            onAction={(id) => openDetail(id)}
          />
        </>
      )}

      {viewMode === 'calendar' && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <BookingsToolbar
              filters={filters}
              onChange={(patch) => setFilters((f) => ({ ...f, ...patch }))}
              onReset={() => setFilters(EMPTY_FILTERS)}
              resultCount={dayBookings.filter((b) => b.mode !== 'waitlist').length}
            />
            <SegmentedControl<CalendarMode>
              aria-label="Calendar mode"
              value={calendarMode}
              onValueChange={setCalendarMode}
              size="sm"
              options={[
                { value: 'day', label: 'Day' },
                { value: 'week', label: 'Week' },
              ]}
            />
          </div>
          {calendarMode === 'day' ? (
            <DayTimeline
              date={selectedDate}
              bookings={dayBookings}
              onSelect={openDetail}
              onCreate={(d, t) => setQuickCreate({ date: d, time: t })}
            />
          ) : (
            <WeekGrid
              anchorDate={selectedDate}
              bookings={baseFiltered}
              onSelect={openDetail}
              onCreate={(d, t) => setQuickCreate({ date: d, time: t })}
            />
          )}
        </>
      )}

      {viewMode === 'map' && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <SeatingMap
            mode="admin"
            bookingsByTableId={mapBookings}
            onTableClick={(_t, b) => (b ? openDetail(b.id) : undefined)}
          />
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4">
                <TimeScrubber value={mapScrubTime} onChange={setMapScrubTime} />
              </CardContent>
            </Card>
            <Card>
              <CardContent className="space-y-3 p-4">
                <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  <LayoutGrid className="size-3.5" />
                  Legend
                </p>
                <SeatingLegend variant="admin" className="flex-col items-start" />
              </CardContent>
            </Card>
            <p className="px-1 text-xs text-muted-foreground">
              Tap a table to open its booking. Drag and pinch/scroll to zoom the floor plan.
            </p>
          </div>
        </div>
      )}

      <QuickCreateDialog
        open={!!quickCreate}
        initial={quickCreate}
        onOpenChange={(o) => !o && setQuickCreate(null)}
        onCreated={(id) => {
          setQuickCreate(null)
          openDetail(id)
        }}
      />

      <Outlet />
    </div>
  )
}
