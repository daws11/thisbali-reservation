import { ChevronDown, RotateCcw, Search, SlidersHorizontal } from 'lucide-react'
import { BOOKING_MODES, BOOKING_STATUSES, type BookingMode, type BookingStatus } from '@/types'
import { formatMode, formatStatus } from '@/lib/format'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { StatusDot } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DateScope, ListFilters } from './filterBookings'

interface ToolbarProps {
  filters: ListFilters
  onChange: (patch: Partial<ListFilters>) => void
  onReset: () => void
  /** date-scope selector — only shown in list view */
  dateScope?: DateScope
  onDateScope?: (s: DateScope) => void
  resultCount: number
}

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]
}

export function BookingsToolbar({ filters, onChange, onReset, dateScope, onDateScope, resultCount }: ToolbarProps) {
  const hasFilters = !!filters.search || filters.statuses.length > 0 || filters.modes.length > 0

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[12rem] flex-1">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="Search name, phone or booking ID"
          className="pl-9"
        />
      </div>

      {dateScope && onDateScope && (
        <Select value={dateScope} onValueChange={(v) => onDateScope(v as DateScope)}>
          <SelectTrigger className="h-11 w-auto min-w-[7.5rem] gap-1.5">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">This day</SelectItem>
            <SelectItem value="week">This week</SelectItem>
            <SelectItem value="upcoming">Upcoming</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      )}

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1.5">
            <SlidersHorizontal className="size-4" />
            Status
            {filters.statuses.length > 0 && (
              <span className="rounded-full bg-accent/20 px-1.5 text-xs text-accent tabular-nums">{filters.statuses.length}</span>
            )}
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter by status</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {BOOKING_STATUSES.map((s: BookingStatus) => (
            <DropdownMenuCheckboxItem
              key={s}
              checked={filters.statuses.includes(s)}
              onCheckedChange={() => onChange({ statuses: toggle(filters.statuses, s) })}
              onSelect={(e) => e.preventDefault()}
            >
              <span className="flex items-center gap-2">
                <StatusDot status={s} />
                {formatStatus(s)}
              </span>
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1.5">
            Mode
            {filters.modes.length > 0 && (
              <span className="rounded-full bg-accent/20 px-1.5 text-xs text-accent tabular-nums">{filters.modes.length}</span>
            )}
            <ChevronDown className="size-3.5 opacity-60" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Filter by mode</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {BOOKING_MODES.map((m: BookingMode) => (
            <DropdownMenuCheckboxItem
              key={m}
              checked={filters.modes.includes(m)}
              onCheckedChange={() => onChange({ modes: toggle(filters.modes, m) })}
              onSelect={(e) => e.preventDefault()}
            >
              {formatMode(m)}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {hasFilters && (
        <Button variant="ghost" size="sm" onClick={onReset}>
          <RotateCcw className="size-3.5" />
          Clear
        </Button>
      )}

      <span className="ml-auto text-sm text-muted-foreground tabular-nums">
        {resultCount} {resultCount === 1 ? 'booking' : 'bookings'}
      </span>
    </div>
  )
}
