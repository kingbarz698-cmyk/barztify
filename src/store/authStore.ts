import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import apiClient from '@/services/api'
import type { User } from '@/types'

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (identifier: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null, token: null, isAuthenticated: false, isLoading: false,

      login: async (identifier, password) => {
        set({ isLoading: true })
        try {
          const { data } = await apiClient.post('/v1/auth/login', { identifier, password })
          set({ user: data.data.user, token: data.data.token, isAuthenticated: true, isLoading: false })
        } catch (err) { set({ isLoading: false }); throw err }
      },

      register: async (name, email, password) => {
        set({ isLoading: true })
        try {
          const { data } = await apiClient.post('/v1/auth/register', { name, email, password })
          set({ user: data.data.user, token: data.data.token, isAuthenticated: true, isLoading: false })
        } catch (err) { set({ isLoading: false }); throw err }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
    }),
    {
      name: 'barztify-auth',
      partialize: (s) => ({ user: s.user, token: s.token, isAuthenticated: s.isAuthenticated }),
    }
  )
)
