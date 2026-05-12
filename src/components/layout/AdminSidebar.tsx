import * as React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { CalendarDays, Cog, LogOut, RotateCcw } from 'lucide-react'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { useBookingStore } from '@/stores/bookingStore'
import { toast } from '@/components/ui/toast'
import { cn } from '@/lib/cn'
import { BrandMark } from './SiteHeader'

function SideLink({
  to,
  icon,
  label,
  onClick,
}: {
  to: string
  icon: React.ReactNode
  label: string
  onClick?: () => void
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors [&_svg]:size-4',
          isActive
            ? 'bg-accent/15 font-medium text-accent'
            : 'text-muted-foreground hover:bg-surface-elevated hover:text-foreground',
        )
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

export function AdminSidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const navigate = useNavigate()
  const logout = useAdminAuthStore((s) => s.logout)
  const resetDemo = useBookingStore((s) => s.resetDemoData)

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
        <BrandMark />
        <span className="ml-2 text-xs text-muted-foreground">Staff</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        <SideLink to="/admin/bookings" icon={<CalendarDays />} label="Bookings" onClick={onNavigate} />
        <span className="flex cursor-not-allowed items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground/40 [&_svg]:size-4">
          <Cog />
          Settings
          <span className="ml-auto text-[10px] uppercase tracking-wide">soon</span>
        </span>
      </nav>
      <div className="space-y-1 border-t border-border p-3">
        <button
          type="button"
          onClick={() => {
            resetDemo()
            toast.success('Demo data reset', { description: 'Bookings restored to the original seed set.' })
            onNavigate?.()
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground [&_svg]:size-4"
        >
          <RotateCcw />
          Reset demo data
        </button>
        <button
          type="button"
          onClick={() => {
            logout()
            navigate('/admin/login', { replace: true })
          }}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground [&_svg]:size-4"
        >
          <LogOut />
          Log out
        </button>
      </div>
    </div>
  )
}
