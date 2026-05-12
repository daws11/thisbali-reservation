import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { Lock } from 'lucide-react'

import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { ADMIN_CREDENTIALS_HINT } from '@/lib/constants'
import { loginSchema, type LoginValues } from '@/lib/schemas'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { BrandMark } from '@/components/layout/SiteHeader'
import { toast } from '@/components/ui/toast'

export default function AdminLogin() {
  const navigate = useNavigate()
  const location = useLocation()
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const login = useAdminAuthStore((s) => s.login)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '', rememberMe: true },
  })

  const from = (location.state as { from?: string } | null)?.from ?? '/admin/bookings'
  if (isAuthenticated) return <Navigate to={from} replace />

  const onSubmit = (values: LoginValues) => {
    const ok = login(values.email, values.password, values.rememberMe)
    if (!ok) {
      toast.error('Invalid credentials', { description: 'Check the email and password and try again.' })
      return
    }
    toast.success('Welcome back')
    navigate(from, { replace: true })
  }

  return (
    <div className="flex min-h-dvh items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <BrandMark />
          <p className="mt-1 text-sm text-muted-foreground">Staff dashboard</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="login-email">Email</Label>
                <Input
                  id="login-email"
                  type="email"
                  autoComplete="username"
                  placeholder="admin@thisbali.com"
                  aria-invalid={!!errors.email}
                  {...register('email')}
                />
                {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="login-password">Password</Label>
                <Input
                  id="login-password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="••••••••"
                  aria-invalid={!!errors.password}
                  {...register('password')}
                />
                {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
              </div>
              <label className="flex cursor-pointer items-center justify-between">
                <span className="text-sm text-muted-foreground">Remember me on this device</span>
                <Switch checked={watch('rememberMe')} onCheckedChange={(v) => setValue('rememberMe', v)} />
              </label>
              <Button type="submit" className="w-full" disabled={isSubmitting}>
                <Lock className="size-4" />
                Sign in
              </Button>
            </form>
            <p className="mt-5 rounded-lg border border-border bg-surface-elevated px-3 py-2 text-center text-xs text-muted-foreground">
              Demo login — <span className="font-medium text-foreground">{ADMIN_CREDENTIALS_HINT}</span>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
