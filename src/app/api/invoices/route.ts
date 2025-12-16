import { NextRequest, NextResponse } from 'next/server'
import { InvoicesRepository } from '@/lib/repositories/invoices'

type InvoiceFilters = {
  fechaDesde?: string
  fechaHasta?: string
  importeMinimo?: string
  importeMaximo?: string
  formaPago?: string
  lugarEmision?: string
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
  'lugarEmision'
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
    const { searchParams } = new URL(request.url)

    const page = parseNumber(searchParams.get('page'), 1)
    const limit = parseNumber(searchParams.get('limit'), 10)
    const search = searchParams.get('search') || undefined

    const filters = filterKeys.reduce<InvoiceFilters>((acc, key) => {
      const value = searchParams.get(key)
      if (value) acc[key] = value
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
    return NextResponse.json(
      {
        success: false,
        error: 'Creación de facturas requiere clienteId y piezaId; pendiente de mapa de IDs'
      },
      { status: 400 }
    )
  } catch (error) {
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
