import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-jwt-secret-key-not-for-production'
const JWT_EXPIRES_IN = '1h' // 1 hour

export interface JWTPayload {
  userId: number
  accessLevel: number
  adminLevel: number
  iat?: number
  exp?: number
}

/**
 * Generate a JWT token with user data
 * @param payload - User data to include in token
 * @returns JWT token string
 */
export function signToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  })
}

/**
 * Verify and decode a JWT token
 * @param token - JWT token string
 * @returns Decoded payload or throws error
 */
export function verifyToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired')
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token')
    }
    throw error
  }
}

/**
 * Extract Bearer token from Authorization header
 * @param request - Next.js request object
 * @returns Token string or null if not found
 */
export function extractTokenFromHeader(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization')
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

