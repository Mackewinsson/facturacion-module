import { NextRequest, NextResponse } from 'next/server'
import { extractTokenFromHeader, verifyToken, JWTPayload } from './jwt'

/**
 * Get authenticated user from request
 * Extracts and verifies JWT token from Authorization header
 * @param request - Next.js request object
 * @returns Decoded user payload
 * @throws Error if token is missing, invalid, or expired
 */
export async function getAuthenticatedUser(request: NextRequest): Promise<JWTPayload> {
  const token = extractTokenFromHeader(request)
  
  if (!token) {
    throw new Error('Missing authorization token')
  }

  try {
    return verifyToken(token)
  } catch (error) {
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Invalid token')
  }
}

/**
 * Require authentication for API route
 * Returns authenticated user or throws 401 error
 * @param request - Next.js request object
 * @returns Decoded user payload
 */
export async function requireAuth(request: NextRequest): Promise<JWTPayload> {
  try {
    return await getAuthenticatedUser(request)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unauthorized'
    throw new Error(message)
  }
}

/**
 * Create 401 Unauthorized response
 * @param message - Error message
 * @returns NextResponse with 401 status
 */
export function createUnauthorizedResponse(message: string = 'Unauthorized'): NextResponse {
  return NextResponse.json(
    { success: false, error: message },
    { status: 401 }
  )
}

