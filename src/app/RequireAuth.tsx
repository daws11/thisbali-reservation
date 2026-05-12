import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAdminAuthStore } from '@/stores/adminAuthStore'

export function RequireAuth() {
  const isAuthenticated = useAdminAuthStore((s) => s.isAuthenticated)
  const hasHydrated = useAdminAuthStore((s) => s.hasHydrated)
  const location = useLocation()

  // Wait for the persisted store to rehydrate before deciding (avoids a flash).
  if (!hasHydrated) {
    return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Loading…</div>
  }
  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />
  }
  return <Outlet />
}
