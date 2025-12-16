import { NextRequest, NextResponse } from 'next/server'
import { EntitiesRepository } from '@/lib/repositories/entities'
import { TipoEntidad } from '@/lib/mock-data'
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-utils'

type ColumnFilters = {
  nif?: string
  nombre?: string
  telefono?: string
}

const columnFilterKeys: Array<keyof ColumnFilters> = ['nif', 'nombre', 'telefono']

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export async function GET(request: NextRequest) {
  try {
    await requireAuth(request)
    const { searchParams } = new URL(request.url)
    const page = parseNumber(searchParams.get('page'), 1)
    const limit = parseNumber(searchParams.get('limit'), 1000)
    const tipoEntidadFilter = (searchParams.get('tipo') || 'ALL') as 'ALL' | TipoEntidad

    const columnFilters = columnFilterKeys.reduce<ColumnFilters>((acc, key) => {
      const value = searchParams.get(key)
      if (value) acc[key] = value
      return acc
    }, {})

    const data = await EntitiesRepository.list({
      page,
      limit,
      columnFilters: Object.keys(columnFilters).length ? columnFilters : undefined,
      tipoEntidadFilter
    })

    return NextResponse.json({
      success: true,
      ...data
    })
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('expired'))) {
      return createUnauthorizedResponse(error.message)
    }
    console.error('Error fetching entities:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudieron obtener las entidades',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request)
    const payload = await request.json()
    const entity = await EntitiesRepository.create(payload)
    return NextResponse.json(
      {
        success: true,
        data: entity
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('expired'))) {
      return createUnauthorizedResponse(error.message)
    }
    console.error('Error creating entity:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudo crear la entidad',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status: 500 }
    )
  }
}
