import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  userId: number
  accessLevel: number
  adminLevel: number
  name: string
  entities: Array<{
    id: number
    name: string
  }>
  createdAt: Date
}

interface AuthStore {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => set({ user: null, token: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
)