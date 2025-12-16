/**
 * API Client Helper
 * Provides authenticated fetch wrapper that automatically includes JWT token
 */

/**
 * Fetch with automatic JWT token injection
 * @param url - API endpoint URL
 * @param options - Fetch options (headers will be merged)
 * @param token - JWT token (if not provided, will try to get from auth store)
 * @returns Fetch Response
 */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {},
  token?: string | null
): Promise<Response> {
  const headers = new Headers(options.headers)
  
  // Add Authorization header if token is provided
  if (token) {
    headers.set('Authorization', `Bearer ${token}`)
  }
  
  // Ensure Content-Type is set for POST/PUT requests
  if ((options.method === 'POST' || options.method === 'PUT' || options.method === 'PATCH') && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  const response = await fetch(url, {
    ...options,
    headers
  })

  // Handle 401 Unauthorized - token expired or invalid
  if (response.status === 401) {
    // Clear auth storage and redirect to login
    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth-storage')
      window.location.href = '/login'
    }
  }

  return response
}

/**
 * Create authenticated fetch options
 * @param token - JWT token
 * @param additionalHeaders - Additional headers to include
 * @returns RequestInit object with headers
 */
export function createAuthHeaders(
  token: string | null,
  additionalHeaders: Record<string, string> = {}
): HeadersInit {
  const headers: HeadersInit = {
    ...additionalHeaders
  }
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  
  return headers
}


