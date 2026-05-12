import { Outlet } from 'react-router-dom'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { useUiStore } from '@/stores/uiStore'
import { AdminSidebarContent } from './AdminSidebar'
import { AdminTopBar } from './AdminTopBar'

export function AdminShell() {
  const sidebarOpen = useUiStore((s) => s.sidebarOpen)
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen)

  return (
    <div className="flex min-h-dvh bg-background">
      {/* desktop sidebar */}
      <aside className="hidden w-60 shrink-0 border-r border-border bg-surface md:block">
        <div className="sticky top-0 h-dvh">
          <AdminSidebarContent />
        </div>
      </aside>

      {/* mobile drawer */}
      <DialogPrimitive.Root open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out md:hidden" />
          <DialogPrimitive.Content className="fixed inset-y-0 left-0 z-50 h-dvh w-64 border-r border-border bg-surface shadow-2xl shadow-black/12 data-[state=open]:animate-slide-in-left data-[state=closed]:animate-slide-out-left md:hidden">
            <DialogPrimitive.Title className="sr-only">Navigation</DialogPrimitive.Title>
            <DialogPrimitive.Close
              aria-label="Close menu"
              className="absolute right-3 top-4 rounded-md p-1 text-muted-foreground hover:bg-surface-elevated hover:text-foreground"
            >
              <X className="size-5" />
            </DialogPrimitive.Close>
            <AdminSidebarContent onNavigate={() => setSidebarOpen(false)} />
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      <div className="flex min-w-0 flex-1 flex-col">
        <AdminTopBar onOpenSidebar={() => setSidebarOpen(true)} />
        <main className="flex-1 p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
