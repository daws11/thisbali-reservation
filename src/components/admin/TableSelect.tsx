import { tables, zones } from '@/data/seatingMap'
import { tableFits } from '@/lib/availability'
import { formatPaxRange } from '@/lib/format'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const UNASSIGNED = '__unassigned__'

export function TableSelect({
  value,
  onChange,
  pax,
  includeUnassigned = true,
  id,
}: {
  value: string | null
  onChange: (v: string | null) => void
  pax?: number
  includeUnassigned?: boolean
  id?: string
}) {
  return (
    <Select value={value ?? UNASSIGNED} onValueChange={(v) => onChange(v === UNASSIGNED ? null : v)}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="Choose a table" />
      </SelectTrigger>
      <SelectContent>
        {includeUnassigned && <SelectItem value={UNASSIGNED}>Unassigned — best available</SelectItem>}
        {zones.map((z) => (
          <SelectGroup key={z.id}>
            <SelectLabel>{z.name}</SelectLabel>
            {tables
              .filter((t) => t.zoneId === z.id)
              .map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.label} · seats {formatPaxRange(t)}
                  {pax != null && !tableFits(t, pax) ? ' · tight fit' : ''}
                </SelectItem>
              ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}
