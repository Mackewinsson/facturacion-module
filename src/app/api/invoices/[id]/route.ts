import { NextRequest, NextResponse } from 'next/server'
import { InvoicesRepository } from '@/lib/repositories/invoices'

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
    const invoice = await InvoicesRepository.findById(id)

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
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 ? error?.message : 'No se pudo obtener la factura',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const id = getInvoiceId(params)
    return NextResponse.json(
      {
        success: false,
        error: 'Actualización de facturas requiere mapa de IDs (clienteId, piezaId)'
      },
      { status: 400 }
    )
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
    return NextResponse.json(
      {
        success: false,
        error: 'Eliminación de facturas en base de datos aún no está implementada'
      },
      { status: 501 }
    )
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
