import { NextRequest, NextResponse } from 'next/server'
import { EntitiesRepository } from '@/lib/repositories/entities'
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-utils'

type RouteParams = {
  params: Promise<{
    nif: string
  }>
}

const getNIF = async (params: Promise<{ nif: string }>) => {
  const resolvedParams = await params
  return decodeURIComponent(resolvedParams.nif)
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authentication optional for development (matches frontend behavior)
    try {
      await requireAuth(request)
    } catch (authError) {
      const isDevelopment = process.env.NODE_ENV === 'development'
      if (!isDevelopment) {
        throw authError
      }
      console.warn('Authentication skipped in development mode')
    }

    const nif = await getNIF(params)
    const entity = await EntitiesRepository.findByNIF(nif)

    if (!entity) {
      return NextResponse.json(
        {
          success: false,
          error: 'Entidad no encontrada'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: entity
    })
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('expired'))) {
      return createUnauthorizedResponse(error.message)
    }
    console.error('Error fetching entity by NIF:', error)
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 && error instanceof Error ? error.message : 'No se pudo obtener la entidad'
      },
      { status }
    )
  }
}

