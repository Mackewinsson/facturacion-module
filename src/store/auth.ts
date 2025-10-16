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
  isAuthenticated: boolean
  login: (user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: true, // Always authenticated for development
      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: true }), // Keep authenticated even after logout
    }),
    {
      name: 'auth-storage',
    }
  )
)