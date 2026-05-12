import { Moon, Sun } from 'lucide-react'
import { SegmentedControl } from '@/components/ui/segmented-control'
import { OPEN_HOURS } from '@/lib/constants'
import type { MealPeriod } from '@/types'

export function MealPeriodTabs({
  value,
  onChange,
  className,
}: {
  value: MealPeriod
  onChange: (p: MealPeriod) => void
  className?: string
}) {
  return (
    <SegmentedControl<MealPeriod>
      aria-label="Meal period"
      value={value}
      onValueChange={onChange}
      className={className}
      options={[
        {
          value: 'lunch',
          icon: <Sun className="size-4" />,
          label: `Lunch · ${OPEN_HOURS.lunch.start}–${OPEN_HOURS.lunch.end}`,
        },
        {
          value: 'dinner',
          icon: <Moon className="size-4" />,
          label: `Dinner · ${OPEN_HOURS.dinner.start}–${OPEN_HOURS.dinner.end}`,
        },
      ]}
    />
  )
}
