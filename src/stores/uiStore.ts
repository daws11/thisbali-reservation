import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { todayISO } from '@/lib/format'
import type { BookingMode, BookingStatus } from '@/types'

export type AdminViewMode = 'list' | 'calendar' | 'map'
export type CalendarMode = 'day' | 'week'

export interface BookingFilters {
  search: string
  statuses: BookingStatus[]
  modes: BookingMode[]
  /** ISO dates; null = unbounded on that side */
  from: string | null
  to: string | null
}

export const emptyFilters: BookingFilters = {
  search: '',
  statuses: [],
  modes: [],
  from: null,
  to: null,
}

interface UiState {
  // admin
  adminViewMode: AdminViewMode
  calendarMode: CalendarMode
  selectedDate: string
  sidebarOpen: boolean
  mapScrubTime: string
  filters: BookingFilters

  setAdminViewMode: (v: AdminViewMode) => void
  setCalendarMode: (v: CalendarMode) => void
  setSelectedDate: (d: string) => void
  setSidebarOpen: (v: boolean) => void
  setMapScrubTime: (t: string) => void
  setFilters: (patch: Partial<BookingFilters>) => void
  resetFilters: () => void
}

export const useUiStore = create<UiState>()(
  persist(
    (set, get) => ({
      adminViewMode: 'list',
      calendarMode: 'day',
      selectedDate: todayISO(),
      sidebarOpen: false,
      mapScrubTime: '19:00',
      filters: { ...emptyFilters },

      setAdminViewMode: (v) => set({ adminViewMode: v }),
      setCalendarMode: (v) => set({ calendarMode: v }),
      setSelectedDate: (d) => set({ selectedDate: d }),
      setSidebarOpen: (v) => set({ sidebarOpen: v }),
      setMapScrubTime: (t) => set({ mapScrubTime: t }),
      setFilters: (patch) => set({ filters: { ...get().filters, ...patch } }),
      resetFilters: () => set({ filters: { ...emptyFilters } }),
    }),
    {
      name: 'tib-ui',
      version: 1,
      partialize: (s) => ({
        adminViewMode: s.adminViewMode,
        calendarMode: s.calendarMode,
      }),
    },
  ),
)
