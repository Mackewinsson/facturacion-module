import { NextRequest, NextResponse } from 'next/server'
import { InvoiceDbService } from '@/lib/invoice-db-service'
import { InvoicesRepository } from '@/lib/repositories/invoices'
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-utils'

type RouteParams = {
  params: Promise<{
    id: string
  }>
}

const getInvoiceId = async (params: Promise<{ id: string }>) => {
  const resolvedParams = await params
  const id = parseInt(resolvedParams.id, 10)
  if (Number.isNaN(id)) {
    throw new Error('ID de factura inválido')
  }
  return id
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Authentication optional for development (matches frontend behavior)
  try {
    await requireAuth(request)
    } catch (authError) {
      // In development, allow requests without auth
      // In production, this should be enforced
      const isDevelopment = process.env.NODE_ENV === 'development'
      if (!isDevelopment) {
        throw authError
      }
      // Log but don't fail in development
      console.warn('Authentication skipped in development mode')
    }
    const id = await getInvoiceId(params)
    // Use InvoicesRepository.findById to get full Invoice structure with lines
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
    if (error instanceof Error && (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('expired'))) {
      return createUnauthorizedResponse(error.message)
    }
    console.error('Error fetching invoice:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const errorStack = error instanceof Error ? error.stack : undefined
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 && error instanceof Error ? error.message : 'No se pudo obtener la factura',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        stack: process.env.NODE_ENV === 'development' ? errorStack : undefined
      },
      { status }
    )
  }
}

export async function PUT(request: NextRequest, { params }: RouteParams) {
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
    
    const id = await getInvoiceId(params)
    const body = await request.json()

    // Validate required fields
    if (!body.cliente?.NIF) {
      return NextResponse.json(
        {
          success: false,
          error: 'El NIF del cliente es requerido'
        },
        { status: 400 }
      )
    }

    // Update invoice using repository
    const updatedInvoice = await InvoicesRepository.update(id, body)

    return NextResponse.json({
      success: true,
      data: updatedInvoice
    })
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('expired'))) {
      return createUnauthorizedResponse(error.message)
    }
    console.error('Error updating invoice:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const status = error instanceof Error && (error.message.includes('inválido') || error.message.includes('no encontrada')) ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 && error instanceof Error ? error.message : 'No se pudo actualizar la factura',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status }
    )
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    await requireAuth(request)
    const id = await getInvoiceId(params)
    return NextResponse.json(
      {
        success: false,
        error: 'Eliminación de facturas en base de datos aún no está implementada'
      },
      { status: 501 }
    )
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('expired'))) {
      return createUnauthorizedResponse(error.message)
    }
    console.error('Error deleting invoice:', error)
    const status = error instanceof Error && error.message.includes('inválido') ? 400 : 500
    return NextResponse.json(
      {
        success: false,
        error: status === 400 && error instanceof Error ? error.message : 'No se pudo eliminar la factura'
      },
      { status }
    )
  }
}
