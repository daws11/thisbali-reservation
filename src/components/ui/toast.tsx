import * as React from 'react'
import * as ToastPrimitive from '@radix-ui/react-toast'
import { create } from 'zustand'
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react'
import { cn } from '@/lib/cn'

type ToastTone = 'default' | 'success' | 'error' | 'info'

interface ToastItem {
  id: string
  title?: string
  description?: React.ReactNode
  tone: ToastTone
  duration: number
}

interface ToastStore {
  toasts: ToastItem[]
  push: (t: Omit<ToastItem, 'id'>) => string
  dismiss: (id: string) => void
}

const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  push: (t) => {
    const id = Math.random().toString(36).slice(2)
    set((s) => ({ toasts: [...s.toasts, { ...t, id }] }))
    return id
  },
  dismiss: (id) => set((s) => ({ toasts: s.toasts.filter((x) => x.id !== id) })),
}))

interface ToastOptions {
  title?: string
  description?: React.ReactNode
  duration?: number
}

function make(tone: ToastTone) {
  return (titleOrOpts: string | ToastOptions, opts?: ToastOptions) => {
    const o: ToastOptions =
      typeof titleOrOpts === 'string' ? { title: titleOrOpts, ...opts } : titleOrOpts
    return useToastStore.getState().push({
      title: o.title,
      description: o.description,
      tone,
      duration: o.duration ?? 4500,
    })
  }
}

export const toast = Object.assign(make('default'), {
  success: make('success'),
  error: make('error'),
  info: make('info'),
})

export function useToast() {
  return { toast, dismiss: useToastStore.getState().dismiss }
}

const TONE_ICON: Record<ToastTone, React.ReactNode> = {
  default: null,
  success: <CircleCheck className="size-5 text-success" />,
  error: <CircleAlert className="size-5 text-destructive" />,
  info: <Info className="size-5 text-status-seated" />,
}

const TONE_RING: Record<ToastTone, string> = {
  default: 'border-border',
  success: 'border-success/40',
  error: 'border-destructive/40',
  info: 'border-status-seated/40',
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts)
  const dismiss = useToastStore((s) => s.dismiss)

  return (
    <ToastPrimitive.Provider swipeDirection="right">
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          duration={t.duration}
          onOpenChange={(open) => {
            if (!open) dismiss(t.id)
          }}
          className={cn(
            'pointer-events-auto flex w-full items-start gap-3 rounded-xl border bg-surface p-4 text-sm text-foreground shadow-2xl shadow-black/12',
            'data-[state=open]:animate-slide-in-right data-[state=closed]:animate-fade-out',
            'data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform',
            TONE_RING[t.tone],
          )}
        >
          {TONE_ICON[t.tone] && <div className="mt-0.5 shrink-0">{TONE_ICON[t.tone]}</div>}
          <div className="flex-1 min-w-0">
            {t.title && <ToastPrimitive.Title className="font-medium leading-tight">{t.title}</ToastPrimitive.Title>}
            {t.description && (
              <ToastPrimitive.Description className="mt-0.5 text-muted-foreground">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close
            aria-label="Dismiss"
            className="shrink-0 rounded-md p-1 text-muted-foreground transition-colors hover:bg-surface-elevated hover:text-foreground"
          >
            <X className="size-4" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastPrimitive.Viewport className="fixed bottom-0 right-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:max-w-sm" />
    </ToastPrimitive.Provider>
  )
}
