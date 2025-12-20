import { NextRequest, NextResponse } from 'next/server'
import { InvoicesRepository } from '@/lib/repositories/invoices'
import { requireAuth, createUnauthorizedResponse } from '@/lib/auth-utils'

type InvoiceFilters = {
  fechaDesde?: string
  fechaHasta?: string
  importeMinimo?: string
  importeMaximo?: string
  formaPago?: string
  lugarEmision?: string
  tipoFactura?: 'emitida' | 'recibida'
}

type InvoiceColumnFilters = {
  factura?: string
  fecha?: string
  nif?: string
  cliente?: string
  baseImponible?: string
  iva?: string
  total?: string
  direccion?: string
  poblacion?: string
  provincia?: string
  codigoPostal?: string
  formaPago?: string
  medioPago?: string
  estado?: string
}

const filterKeys: Array<keyof InvoiceFilters> = [
  'fechaDesde',
  'fechaHasta',
  'importeMinimo',
  'importeMaximo',
  'formaPago',
  'lugarEmision',
  'tipoFactura'
]

const columnFilterKeys: Array<keyof InvoiceColumnFilters> = [
  'factura',
  'fecha',
  'nif',
  'cliente',
  'baseImponible',
  'iva',
  'total',
  'direccion',
  'poblacion',
  'provincia',
  'codigoPostal',
  'formaPago',
  'medioPago',
  'estado'
]

const parseNumber = (value: string | null, fallback: number) => {
  if (!value) return fallback
  const parsed = parseInt(value, 10)
  return Number.isNaN(parsed) ? fallback : parsed
}

export async function GET(request: NextRequest) {
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
    const { searchParams } = new URL(request.url)

    const page = parseNumber(searchParams.get('page'), 1)
    const limit = parseNumber(searchParams.get('limit'), 10)
    const search = searchParams.get('search') || undefined

    const filters = filterKeys.reduce<InvoiceFilters>((acc, key) => {
      const value = searchParams.get(key)
      if (value) {
        if (key === 'tipoFactura' && (value === 'emitida' || value === 'recibida')) {
          acc[key] = value
        } else if (key !== 'tipoFactura') {
          acc[key] = value
        }
      }
      return acc
    }, {})

    const columnFilters = columnFilterKeys.reduce<InvoiceColumnFilters>((acc, key) => {
      const value = searchParams.get(`column_${key}`) ?? searchParams.get(key)
      if (value) acc[key] = value
      return acc
    }, {})

    const data = await InvoicesRepository.list({
      page,
      limit,
      search,
      filters: Object.keys(filters).length ? filters : undefined,
      columnFilters: Object.keys(columnFilters).length ? columnFilters : undefined
    })

    return NextResponse.json({
      success: true,
      ...data
    })
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('expired'))) {
      return createUnauthorizedResponse(error.message)
    }
    console.error('Error fetching invoices:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudieron obtener las facturas'
      },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request)
    return NextResponse.json(
      {
        success: false,
        error: 'Creación de facturas requiere clienteId y piezaId; pendiente de mapa de IDs'
      },
      { status: 400 }
    )
  } catch (error) {
    if (error instanceof Error && (error.message.includes('Missing') || error.message.includes('Invalid') || error.message.includes('expired'))) {
      return createUnauthorizedResponse(error.message)
    }
    console.error('Error creating invoice:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'No se pudo crear la factura'
      },
      { status: 500 }
    )
  }
}
