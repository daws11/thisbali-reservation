import * as React from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { guestInfoSchema, type GuestInfoValues } from '@/lib/schemas'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { OccasionSelect } from './OccasionSelect'
import { cn } from '@/lib/cn'

export interface GuestInfoFormHandle {
  /** Validate + return values, or null if invalid (errors are shown inline). */
  submit: () => Promise<GuestInfoValues | null>
}

interface GuestInfoFormProps {
  defaultValues?: Partial<GuestInfoValues>
  onChange?: (values: Partial<GuestInfoValues>) => void
  variant?: 'full' | 'quick'
  className?: string
}

const FieldError = ({ msg }: { msg?: string }) =>
  msg ? <p className="text-xs text-destructive">{msg}</p> : null

export const GuestInfoForm = React.forwardRef<GuestInfoFormHandle, GuestInfoFormProps>(
  ({ defaultValues, onChange, variant = 'full', className }, ref) => {
    const {
      register,
      control,
      handleSubmit,
      watch,
      formState: { errors },
    } = useForm<GuestInfoValues>({
      resolver: zodResolver(guestInfoSchema),
      mode: 'onBlur',
      defaultValues: {
        name: '',
        whatsapp: '',
        email: '',
        occasion: 'none',
        specialRequest: '',
        marketingOptIn: false,
        ...defaultValues,
      },
    })

    React.useEffect(() => {
      if (!onChange) return
      const sub = watch((value) => onChange(value as Partial<GuestInfoValues>))
      return () => sub.unsubscribe()
    }, [watch, onChange])

    React.useImperativeHandle(ref, () => ({
      submit: () =>
        new Promise<GuestInfoValues | null>((resolve) => {
          void handleSubmit(
            (data) => resolve(data),
            () => resolve(null),
          )()
        }),
    }))

    const specialLen = (watch('specialRequest') ?? '').length

    return (
      <form className={cn('space-y-5', className)} onSubmit={(e) => e.preventDefault()} noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="guest-name">Full name</Label>
          <Input
            id="guest-name"
            autoComplete="name"
            placeholder="e.g. Made Wijaya"
            aria-invalid={!!errors.name}
            {...register('name')}
          />
          <FieldError msg={errors.name?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-whatsapp">WhatsApp number</Label>
          <Input
            id="guest-whatsapp"
            inputMode="tel"
            autoComplete="tel"
            placeholder="08xxxxxxxxxx or +62 8xx"
            aria-invalid={!!errors.whatsapp}
            {...register('whatsapp')}
          />
          <FieldError msg={errors.whatsapp?.message} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="guest-email" optional>
            Email
          </Label>
          <Input
            id="guest-email"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@example.com"
            aria-invalid={!!errors.email}
            {...register('email')}
          />
          <FieldError msg={errors.email?.message} />
        </div>

        {variant === 'full' && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="guest-occasion" optional>
                Occasion
              </Label>
              <Controller
                control={control}
                name="occasion"
                render={({ field }) => (
                  <OccasionSelect id="guest-occasion" value={field.value} onChange={field.onChange} />
                )}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="guest-special" optional>
                Special request
              </Label>
              <Textarea
                id="guest-special"
                rows={3}
                maxLength={300}
                placeholder="Dietary needs, accessibility, decorations, seating preferences…"
                aria-invalid={!!errors.specialRequest}
                {...register('specialRequest')}
              />
              <div className="flex items-center justify-between">
                <FieldError msg={errors.specialRequest?.message} />
                <span className="ml-auto text-xs text-muted-foreground tabular-nums">{specialLen}/300</span>
              </div>
            </div>

            <Controller
              control={control}
              name="marketingOptIn"
              render={({ field }) => (
                <label className="flex cursor-pointer items-start gap-3">
                  <Checkbox checked={field.value} onCheckedChange={(v) => field.onChange(v === true)} className="mt-0.5" />
                  <span className="text-sm text-muted-foreground">
                    Send me occasional updates about new dishes and events at This Is Bali.
                  </span>
                </label>
              )}
            />
          </>
        )}
      </form>
    )
  },
)
GuestInfoForm.displayName = 'GuestInfoForm'
