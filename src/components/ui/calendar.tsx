import { DayPicker, type DayPickerProps } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

export type CalendarProps = DayPickerProps

/** Brand-themed wrapper around react-day-picker (styling lives in globals.css). */
export function Calendar({ className, showOutsideDays = true, animate = false, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      animate={animate}
      className={cn('inline-block', className)}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? <ChevronLeft className="size-4" /> : <ChevronRight className="size-4" />,
      }}
      {...props}
    />
  )
}
