import { Prisma } from '@/generated/prisma'
import { prisma } from './prisma'

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

export type InvoiceFromDb = {
  id: number
  numero: string
  fecha: string
  clienteId: number
  clienteNombre: string
  clienteNif: string
  direccionId?: number
  direccion?: {
    etiqueta?: string | null
    direccion: string
    poblacion?: string | null
    provincia?: string | null
    codigoPostal?: string | null
  }
  bases: {
    bi1: number
    bi2: number
    bi3: number
  }
  cuotasIva: {
    ci1: number
    ci2: number
    ci3: number
  }
  totales: {
    baseImponible: number
    iva: number
    total: number
  }
}

type InvoiceWithRelations = Prisma.CFAGetPayload<{
  include: { ENT: true; DIR: { include: { PRO: true } } }
}>

const safeNumber = (value?: number | null) => Number(value ?? 0)

const appendAnd = (where: Prisma.CFAWhereInput, clauses: Prisma.CFAWhereInput[]) => {
  if (!clauses.length) return where
  if (Array.isArray(where.AND)) {
    where.AND = [...where.AND, ...clauses]
  } else if (where.AND) {
    where.AND = [where.AND, ...clauses]
  } else {
    where.AND = clauses
  }
  return where
}

const buildWhere = (params: {
  search?: string
  filters?: InvoiceFilters
  columnFilters?: InvoiceColumnFilters
}) => {
  const where: Prisma.CFAWhereInput = {}
  const { search, filters, columnFilters } = params

  // Rango de fechas
  if (filters?.fechaDesde || filters?.fechaHasta) {
    where.FECCFA = {}
    if (filters.fechaDesde) {
      const from = new Date(filters.fechaDesde)
      if (!Number.isNaN(from.getTime())) {
        where.FECCFA.gte = from
      }
    }
    if (filters.fechaHasta) {
      const to = new Date(filters.fechaHasta)
      if (!Number.isNaN(to.getTime())) {
        where.FECCFA.lte = to
      }
    }
  }

  // Importes mínimos/máximos contra el total de la factura
  if (filters?.importeMinimo || filters?.importeMaximo) {
    where.TOTCFA = {}
    if (filters.importeMinimo) {
      const min = Number(filters.importeMinimo)
      if (!Number.isNaN(min)) {
        where.TOTCFA.gte = min
      }
    }
    if (filters.importeMaximo) {
      const max = Number(filters.importeMaximo)
      if (!Number.isNaN(max)) {
        where.TOTCFA.lte = max
      }
    }
  }

  // Búsqueda global por número, NIF, nombre o dirección
  if (search) {
    where.OR = [
      { NUMCFA: { contains: search,  } },
      { ENT: { is: { NIFENT: { contains: search,  } } } },
      { ENT: { is: { NCOENT: { contains: search,  } } } },
      { DIR: { is: { DIRDIR: { contains: search,  } } } },
      { DIR: { is: { POBDIR: { contains: search,  } } } },
      { DIR: { is: { CPODIR: { contains: search,  } } } }
    ]
  }

  // Filtros por columna que podemos mapear directamente a campos de la BD
  const columnClauses: Prisma.CFAWhereInput[] = []

  if (columnFilters?.factura) {
    columnClauses.push({ NUMCFA: { contains: columnFilters.factura,  } })
  }

  if (columnFilters?.nif) {
    columnClauses.push({ ENT: { is: { NIFENT: { contains: columnFilters.nif,  } } } })
  }

  if (columnFilters?.cliente) {
    columnClauses.push({ ENT: { is: { NCOENT: { contains: columnFilters.cliente,  } } } })
  }

  if (columnFilters?.direccion) {
    columnClauses.push({ DIR: { is: { DIRDIR: { contains: columnFilters.direccion,  } } } })
  }

  if (columnFilters?.poblacion) {
    columnClauses.push({ DIR: { is: { POBDIR: { contains: columnFilters.poblacion,  } } } })
  }

  if (columnFilters?.codigoPostal) {
    columnClauses.push({ DIR: { is: { CPODIR: { contains: columnFilters.codigoPostal,  } } } })
  }

  return appendAnd(where, columnClauses)
}

const mapInvoice = (invoice: InvoiceWithRelations): InvoiceFromDb => {
  const fecha = invoice.FECCFA ? invoice.FECCFA.toISOString() : new Date(0).toISOString()
  const bi1 = safeNumber(invoice.BI1CFA)
  const bi2 = safeNumber(invoice.BI2CFA)
  const bi3 = safeNumber(invoice.BI3CFA)
  const ci1 = safeNumber(invoice.CI1CFA)
  const ci2 = safeNumber(invoice.CI2CFA)
  const ci3 = safeNumber(invoice.CI3CFA)

  const ent = invoice.ENT
  const dir = invoice.DIR

  return {
    id: invoice.IDECFA,
    numero: invoice.NUMCFA || '',
    fecha,
    clienteId: invoice.ENTCFA,
    clienteNombre: ent?.NCOENT || ent?.NOMENT || 'Cliente sin nombre',
    clienteNif: ent?.NIFENT || '',
    direccionId: invoice.DIRCFA ?? undefined,
    direccion: dir
      ? {
          etiqueta: dir.NOMDIR,
          direccion: dir.DIRDIR,
          poblacion: dir.POBDIR,
          provincia: dir.PRO?.NOMPRO ?? null,
          codigoPostal: dir.CPODIR
        }
      : undefined,
    bases: {
      bi1,
      bi2,
      bi3
    },
    cuotasIva: {
      ci1,
      ci2,
      ci3
    },
    totales: {
      baseImponible: bi1 + bi2 + bi3,
      iva: ci1 + ci2 + ci3,
      total: safeNumber(invoice.TOTCFA)
    }
  }
}

export class InvoiceDbService {
  static async getInvoices(params: {
    page?: number
    limit?: number
    search?: string
    filters?: InvoiceFilters
    columnFilters?: InvoiceColumnFilters
  }) {
    const { page = 1, limit = 10, search, filters, columnFilters } = params
    const where = buildWhere({ search, filters, columnFilters })
    const skip = (page - 1) * limit

    const [records, total] = await Promise.all([
      prisma.cFA.findMany({
        where,
        skip,
        take: limit,
        orderBy: { FECCFA: 'desc' },
        include: { ENT: true, DIR: { include: { PRO: true } } }
      }),
      prisma.cFA.count({ where })
    ])

    return {
      invoices: records.map(mapInvoice),
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async getInvoice(id: number) {
    const record = await prisma.cFA.findUnique({
      where: { IDECFA: id },
      include: { ENT: true, DIR: { include: { PRO: true } } }
    })

    if (!record) return null
    return mapInvoice(record)
  }
}
