import { NextRequest, NextResponse } from 'next/server'
import { MockEntityService, Entidad } from '@/lib/mock-data'

type RouteParams = {
  params: {
    id: string
  }
}

const getEntityId = (params: RouteParams['params']) => {
  const id = parseInt(params.id, 10)
  if (Number.isNaN(id)) {
    throw new Error('ID de entidad inválido')
  }
  return id
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = getEntityId(params)
    const entity = await MockEntityService.getEntity(id)

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
    console.error('Error fetching entity:', error)
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 ? error.message : 'No se pudo obtener la entidad'
      },
      { status }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = getEntityId(params)
    const updateData = (await request.json()) as Partial<Entidad>

    const updated = await MockEntityService.updateEntity(id, updateData)

    if (!updated) {
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
      data: updated
    })
  } catch (error) {
    console.error('Error updating entity:', error)
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 ? error.message : 'No se pudo actualizar la entidad'
      },
      { status }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = getEntityId(params)
    const deleted = await MockEntityService.deleteEntity(id)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Entidad no encontrada'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting entity:', error)
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 ? error.message : 'No se pudo eliminar la entidad'
      },
      { status }
    )
  }
}
