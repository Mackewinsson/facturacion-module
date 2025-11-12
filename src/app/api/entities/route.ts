import { NextRequest, NextResponse } from 'next/server'
import { MockEntityService, Entidad, TipoEntidad } from '@/lib/mock-data'

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
    const { searchParams } = new URL(request.url)
    const page = parseNumber(searchParams.get('page'), 1)
    const limit = parseNumber(searchParams.get('limit'), 1000)
    const tipoEntidadFilter = (searchParams.get('tipo') || 'ALL') as 'ALL' | TipoEntidad

    const columnFilters = columnFilterKeys.reduce<ColumnFilters>((acc, key) => {
      const value = searchParams.get(key)
      if (value) acc[key] = value
      return acc
    }, {})

    const data = await MockEntityService.getEntities({
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
    console.error('Error fetching entities:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudieron obtener las entidades'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Omit<Entidad, 'id' | 'createdAt' | 'updatedAt'>

    if (!payload?.NIF || !payload?.razonSocial) {
      return NextResponse.json(
        {
          success: false,
          error: 'NIF y razón social son obligatorios'
        },
        { status: 400 }
      )
    }

    const entity = await MockEntityService.createEntity(payload)

    return NextResponse.json(
      {
        success: true,
        data: entity
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating entity:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudo crear la entidad'
      },
      { status: 500 }
    )
  }
}
