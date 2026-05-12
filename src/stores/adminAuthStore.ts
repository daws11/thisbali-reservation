import { create } from 'zustand'
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware'
import { adminUsers } from '@/data/adminUsers'

interface AdminUserInfo {
  email: string
  name: string
}

interface AdminAuthState {
  isAuthenticated: boolean
  user: AdminUserInfo | null
  rememberMe: boolean
  hasHydrated: boolean
  login: (email: string, password: string, rememberMe: boolean) => boolean
  logout: () => void
  setHasHydrated: (v: boolean) => void
}

const REMEMBER_FLAG = 'tib-auth-remember'
const STORE_KEY = 'tib-admin-auth'

/**
 * Persist auth to localStorage when "remember me" is on, otherwise sessionStorage.
 * `persist`'s storage is fixed at creation time, so this adapter routes each
 * call based on a flag we set in localStorage before writing.
 */
const dynamicStorage: StateStorage = {
  getItem: (name) => {
    const remember = localStorage.getItem(REMEMBER_FLAG) === '1'
    return (remember ? localStorage : sessionStorage).getItem(name)
  },
  setItem: (name, value) => {
    const remember = localStorage.getItem(REMEMBER_FLAG) === '1'
    ;(remember ? localStorage : sessionStorage).setItem(name, value)
  },
  removeItem: (name) => {
    localStorage.removeItem(name)
    sessionStorage.removeItem(name)
  },
}

export const useAdminAuthStore = create<AdminAuthState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      rememberMe: false,
      hasHydrated: false,

      login: (email, password, rememberMe) => {
        const match = adminUsers.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password,
        )
        if (!match) return false
        // Route the upcoming persisted write to the right storage.
        if (rememberMe) localStorage.setItem(REMEMBER_FLAG, '1')
        else localStorage.removeItem(REMEMBER_FLAG)
        set({ isAuthenticated: true, user: { email: match.email, name: match.name }, rememberMe })
        return true
      },

      logout: () => {
        localStorage.removeItem(REMEMBER_FLAG)
        localStorage.removeItem(STORE_KEY)
        sessionStorage.removeItem(STORE_KEY)
        set({ isAuthenticated: false, user: null, rememberMe: false })
      },

      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: STORE_KEY,
      storage: createJSONStorage(() => dynamicStorage),
      partialize: (s) => ({ isAuthenticated: s.isAuthenticated, user: s.user, rememberMe: s.rememberMe }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)
