import { useNavigate } from 'react-router-dom'
import { parseISO } from 'date-fns'
import { CalendarDays, ChevronDown, LogOut, Menu } from 'lucide-react'

import { useUiStore } from '@/stores/uiStore'
import { useAdminAuthStore } from '@/stores/adminAuthStore'
import { formatDate, initialsOf, isoDate, todayISO } from '@/lib/format'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { QuickStats } from '@/components/admin/QuickStats'
import { Button } from '@/components/ui/button'

export function AdminTopBar({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  const navigate = useNavigate()
  const selectedDate = useUiStore((s) => s.selectedDate)
  const setSelectedDate = useUiStore((s) => s.setSelectedDate)
  const user = useAdminAuthStore((s) => s.user)
  const logout = useAdminAuthStore((s) => s.logout)
  const isToday = selectedDate === todayISO()

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur">
      <div className="flex h-14 items-center gap-3 px-4">
        <button
          type="button"
          aria-label="Open menu"
          onClick={onOpenSidebar}
          className="flex size-9 items-center justify-center rounded-lg text-muted-foreground hover:bg-surface-elevated hover:text-foreground md:hidden"
        >
          <Menu className="size-5" />
        </button>

        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm transition-colors hover:bg-surface-elevated"
            >
              <CalendarDays className="size-4 text-accent" />
              <span className="font-medium">{isToday ? 'Today' : formatDate(selectedDate)}</span>
              <ChevronDown className="size-3.5 opacity-60" />
            </button>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto">
            <Calendar
              mode="single"
              selected={parseISO(selectedDate)}
              onSelect={(d) => d && setSelectedDate(isoDate(d))}
            />
            {!isToday && (
              <Button variant="ghost" size="sm" className="mt-1 w-full" onClick={() => setSelectedDate(todayISO())}>
                Jump to today
              </Button>
            )}
          </PopoverContent>
        </Popover>

        <div className="ml-2 hidden flex-1 lg:flex">
          <QuickStats date={selectedDate} />
        </div>

        <div className="ml-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-lg px-1.5 py-1 transition-colors hover:bg-surface-elevated"
              >
                <span className="flex size-8 items-center justify-center rounded-full bg-accent/20 text-xs font-semibold text-accent">
                  {initialsOf(user?.name ?? 'A')}
                </span>
                <span className="hidden text-sm sm:inline">{user?.name ?? 'Admin'}</span>
                <ChevronDown className="size-3.5 opacity-60" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>{user?.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                destructive
                onSelect={() => {
                  logout()
                  navigate('/admin/login', { replace: true })
                }}
              >
                <LogOut />
                Log out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="border-t border-border px-4 py-2 lg:hidden">
        <QuickStats date={selectedDate} />
      </div>
    </header>
  )
}
