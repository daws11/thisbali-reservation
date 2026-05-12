import { useEffect } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { CalendarPlus } from 'lucide-react'

import { quickCreateSchema, type QuickCreateValues } from '@/lib/schemas'
import { durationForTable } from '@/lib/availability'
import { formatDate } from '@/lib/format'
import { slotTimes } from '@/data/timeSlots'
import { useBookingStore } from '@/stores/bookingStore'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PaxStepper } from '@/components/booking/PaxStepper'
import { TableSelect } from './TableSelect'
import { toast } from '@/components/ui/toast'

interface QuickCreateDialogProps {
  open: boolean
  initial: { date: string; time: string } | null
  onOpenChange: (open: boolean) => void
  onCreated: (id: string) => void
}

export function QuickCreateDialog({ open, initial, onOpenChange, onCreated }: QuickCreateDialogProps) {
  const createBooking = useBookingStore((s) => s.createBooking)
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<QuickCreateValues>({
    resolver: zodResolver(quickCreateSchema),
    defaultValues: {
      date: initial?.date ?? '',
      timeSlot: initial?.time ?? slotTimes[0],
      pax: 2,
      tableId: null,
      name: '',
      whatsapp: '',
      specialRequest: '',
    },
  })

  useEffect(() => {
    if (open && initial) {
      reset({
        date: initial.date,
        timeSlot: slotTimes.includes(initial.time) ? initial.time : slotTimes[0],
        pax: 2,
        tableId: null,
        name: '',
        whatsapp: '',
        specialRequest: '',
      })
    }
  }, [open, initial, reset])

  const onSubmit = (v: QuickCreateValues) => {
    const booking = createBooking(
      {
        mode: 'reservation',
        date: v.date,
        timeSlot: v.timeSlot,
        pax: v.pax,
        tableId: v.tableId,
        durationMinutes: durationForTable(v.tableId),
        guest: { name: v.name, whatsapp: v.whatsapp },
        occasion: 'none',
        ...(v.specialRequest ? { specialRequest: v.specialRequest } : {}),
        marketingOptIn: false,
      },
      'admin',
    )
    toast.success('Booking created', { description: `${booking.id} · ${v.name}` })
    onCreated(booking.id)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New booking</DialogTitle>
          <DialogDescription>{initial ? formatDate(initial.date) : ''}</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="qc-time">Time</Label>
              <Controller
                control={control}
                name="timeSlot"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger id="qc-time">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {slotTimes.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Party size</Label>
              <Controller
                control={control}
                name="pax"
                render={({ field }) => (
                  <div className="flex h-11 items-center">
                    <PaxStepper value={field.value} onChange={field.onChange} size="md" />
                  </div>
                )}
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qc-table">Table</Label>
            <Controller
              control={control}
              name="tableId"
              render={({ field }) => <TableSelect id="qc-table" value={field.value} onChange={field.onChange} />}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qc-name">Guest name</Label>
            <Input id="qc-name" placeholder="Full name" aria-invalid={!!errors.name} {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qc-phone">WhatsApp</Label>
            <Input id="qc-phone" inputMode="tel" placeholder="08xx…" aria-invalid={!!errors.whatsapp} {...register('whatsapp')} />
            {errors.whatsapp && <p className="text-xs text-destructive">{errors.whatsapp.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="qc-special" optional>
              Special request
            </Label>
            <Textarea id="qc-special" rows={2} maxLength={300} {...register('specialRequest')} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              <CalendarPlus className="size-4" />
              Create booking
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
