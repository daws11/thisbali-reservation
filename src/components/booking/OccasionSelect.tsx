import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OCCASIONS, type Occasion } from '@/types'
import { OCCASION_LABELS } from '@/lib/occasions'

export function OccasionSelect({
  value,
  onChange,
  id,
}: {
  value: Occasion
  onChange: (v: Occasion) => void
  id?: string
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as Occasion)}>
      <SelectTrigger id={id}>
        <SelectValue placeholder="None" />
      </SelectTrigger>
      <SelectContent>
        {OCCASIONS.map((o) => (
          <SelectItem key={o} value={o}>
            {OCCASION_LABELS[o]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
