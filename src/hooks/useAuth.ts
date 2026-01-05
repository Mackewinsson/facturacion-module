import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

/**
 * Custom hook to handle authentication checks with proper hydration handling
 * Waits for Zustand store to hydrate from localStorage before checking auth status
 */
export function useAuth(redirectToLogin = true) {
  const router = useRouter()
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const token = useAuthStore((state) => state.token)
  const hasHydrated = useAuthStore((state) => state._hasHydrated)
  const [isChecking, setIsChecking] = useState(true)

  useEffect(() => {
    // On client side, check if localStorage has auth data
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('auth-storage')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          // If we have stored data but hasn't hydrated yet, mark as hydrated
          if (parsed.state && !hasHydrated) {
            useAuthStore.getState().setHasHydrated(true)
          }
        } catch {
          // Ignore parse errors
        }
      } else if (!hasHydrated) {
        // No stored data, mark as hydrated immediately
        useAuthStore.getState().setHasHydrated(true)
      }
    }
  }, [hasHydrated])

  useEffect(() => {
    // Wait for hydration to complete
    if (!hasHydrated) {
      return
    }

    // Once hydrated, check authentication
    setIsChecking(false)

    // Only redirect if explicitly requested and user is not authenticated
    if (redirectToLogin && !isAuthenticated && !token) {
      router.push('/login')
    }
  }, [hasHydrated, isAuthenticated, token, redirectToLogin, router])

  return {
    isAuthenticated: isAuthenticated || !!token,
    token,
    hasHydrated,
    isChecking: !hasHydrated || isChecking,
  }
}

