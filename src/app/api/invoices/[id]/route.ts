import { NextRequest, NextResponse } from 'next/server'
import { MockInvoiceService, Invoice } from '@/lib/mock-data'

type RouteParams = {
  params: {
    id: string
  }
}

const getInvoiceId = (params: RouteParams['params']) => {
  const id = parseInt(params.id, 10)
  if (Number.isNaN(id)) {
    throw new Error('ID de factura inválido')
  }
  return id
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = getInvoiceId(params)
    const invoice = await MockInvoiceService.getInvoice(id)

    if (!invoice) {
      return NextResponse.json(
        {
          success: false,
          error: 'Factura no encontrada'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    console.error('Error fetching invoice:', error)
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 ? error?.message : 'No se pudo obtener la factura'
      },
      { status }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = getInvoiceId(params)
    const updateData = (await request.json()) as Partial<Invoice>

    const updated = await MockInvoiceService.updateInvoice(id, updateData)

    if (!updated) {
      return NextResponse.json(
        {
          success: false,
          error: 'Factura no encontrada'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: updated
    })
  } catch (error) {
    console.error('Error updating invoice:', error)
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 ? error?.message : 'No se pudo actualizar la factura'
      },
      { status }
    )
  }
}

export async function DELETE(_request: NextRequest, { params }: RouteParams) {
  try {
    const id = getInvoiceId(params)
    const deleted = await MockInvoiceService.deleteInvoice(id)

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: 'Factura no encontrada'
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true
    })
  } catch (error) {
    console.error('Error deleting invoice:', error)
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 ? error?.message : 'No se pudo eliminar la factura'
      },
      { status }
    )
  }
}
