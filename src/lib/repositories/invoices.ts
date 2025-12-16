import { prisma } from '@/lib/prisma'
import { Invoice, LineaFactura } from '@/lib/mock-data'
import { InvoiceFromDb } from '@/lib/invoice-db-service'

const safeNumber = (value?: number | null) => Number(value ?? 0)

const mapLine = (line: any): LineaFactura => {
  const base = safeNumber(line.IPTLAB)
  const ivaPct = safeNumber(line.IVALAB)
  const rePct = safeNumber(line.REQLAB)
  const cuotaIVA = +(base * (ivaPct / 100)).toFixed(2)
  const cuotaRE = +(base * (rePct / 100)).toFixed(2)
  return {
    id: line.IDELAB,
    descripcion: line.Piezas?.DenominacionPieza ?? line.NPELAB ?? 'Línea sin descripción',
    cantidad: safeNumber(line.SERLAB),
    precioUnitario: safeNumber(line.NETLAB),
    descuentoPct: safeNumber(line.DT1LAB) || undefined,
    tipoIVA: (line.IVALAB as number) ?? 0,
    recargoEquivalenciaPct: rePct || undefined,
    baseLinea: base,
    cuotaIVA,
    cuotaRE,
    totalLinea: +(base + cuotaIVA + cuotaRE).toFixed(2)
  }
}

const resolveTipoFactura = (record: any) => {
  if (record.FRECFA) return 'recibida'
  return 'emitida'
}

export class InvoicesRepository {
  static async list(params: {
    page?: number
    limit?: number
    search?: string
    columnFilters?: Record<string, string>
    filters?: {
      fechaDesde?: string
      fechaHasta?: string
      importeMinimo?: string
      importeMaximo?: string
    }
  }) {
    const { page = 1, limit = 10, search, columnFilters = {}, filters = {} } = params
    const where: any = {}

    if (search) {
      where.OR = [
        { NUMCFA: { contains: search, mode: 'insensitive' } },
        { ENT: { is: { NIFENT: { contains: search, mode: 'insensitive' } } } },
        { ENT: { is: { NCOENT: { contains: search, mode: 'insensitive' } } } }
      ]
    }

    if (columnFilters.factura) {
      where.NUMCFA = { contains: columnFilters.factura, mode: 'insensitive' }
    }
    if (columnFilters.nif) {
      where.ENT = { is: { NIFENT: { contains: columnFilters.nif, mode: 'insensitive' } } }
    }
    if (columnFilters.cliente) {
      where.ENT = { is: { NCOENT: { contains: columnFilters.cliente, mode: 'insensitive' } } }
    }

    if (filters.fechaDesde || filters.fechaHasta) {
      where.FECCFA = {}
      if (filters.fechaDesde) {
        const from = new Date(filters.fechaDesde)
        if (!Number.isNaN(from.getTime())) where.FECCFA.gte = from
      }
      if (filters.fechaHasta) {
        const to = new Date(filters.fechaHasta)
        if (!Number.isNaN(to.getTime())) where.FECCFA.lte = to
      }
    }

    if (filters.importeMinimo || filters.importeMaximo) {
      where.TOTCFA = {}
      if (filters.importeMinimo) {
        const min = Number(filters.importeMinimo)
        if (!Number.isNaN(min)) where.TOTCFA.gte = min
      }
      if (filters.importeMaximo) {
        const max = Number(filters.importeMaximo)
        if (!Number.isNaN(max)) where.TOTCFA.lte = max
      }
    }

    const [records, total] = await Promise.all([
      prisma.cFA.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { FECCFA: 'desc' },
        include: {
          ENT: true,
          DIR: { include: { PRO: true, PAI: true } }
        }
      }),
      prisma.cFA.count({ where })
    ])

    const invoices: InvoiceFromDb[] = records.map(record => {
      const bi1 = safeNumber(record.BI1CFA)
      const bi2 = safeNumber(record.BI2CFA)
      const bi3 = safeNumber(record.BI3CFA)
      const ci1 = safeNumber(record.CI1CFA)
      const ci2 = safeNumber(record.CI2CFA)
      const ci3 = safeNumber(record.CI3CFA)
      const baseImponible = bi1 + bi2 + bi3
      const iva = ci1 + ci2 + ci3
      return {
        id: record.IDECFA,
        numero: record.NUMCFA || '',
        fecha: record.FECCFA ? record.FECCFA.toISOString() : record.FEMCFA?.toISOString() ?? new Date(0).toISOString(),
        clienteId: record.ENTCFA,
        clienteNombre: record.ENT?.NCOENT || record.ENT?.NOMENT || 'Cliente sin nombre',
        clienteNif: record.ENT?.NIFENT || '',
        direccionId: record.DIRCFA ?? undefined,
        direccion: record.DIR
          ? {
              etiqueta: record.DIR.NOMDIR,
              direccion: record.DIR.DIRDIR,
              poblacion: record.DIR.POBDIR,
              provincia: record.DIR.PRO?.NOMPRO ?? null,
              codigoPostal: record.DIR.CPODIR
            }
          : undefined,
        bases: { bi1, bi2, bi3 },
        cuotasIva: { ci1, ci2, ci3 },
        totales: {
          baseImponible,
          iva,
          total: safeNumber(record.TOTCFA)
        }
      }
    })

    return {
      invoices,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    }
  }

  static async findById(id: number): Promise<Invoice | null> {
    const record = await prisma.cFA.findUnique({
      where: { IDECFA: id },
      include: {
        ENT: true,
        DIR: { include: { PRO: true, PAI: true } },
        ALM: { include: { DIR: true } },
        DEP: true
      }
    })
    if (!record) return null

    // Obtener líneas a partir de CAB->LAB relacionadas con la factura
    const cabRows = await prisma.cAB.findMany({
      where: { FACCAB: record.NUMCFA },
      select: { NUMCAB: true }
    })
    const albaranIds = cabRows.map(c => c.NUMCAB)

    const labRows = albaranIds.length
      ? await prisma.lAB.findMany({
          where: { ALBLAB: { in: albaranIds } },
          include: { Piezas: true }
        })
      : []

    const lineas = labRows.map(mapLine)

    // Vencimientos de crédito
    const credit = await prisma.cRT.findFirst({
      where: { DOCCRT: record.NUMCFA },
      orderBy: { FEVCRT: 'asc' }
    })

    const bi1 = safeNumber(record.BI1CFA)
    const bi2 = safeNumber(record.BI2CFA)
    const bi3 = safeNumber(record.BI3CFA)
    const ci1 = safeNumber(record.CI1CFA)
    const ci2 = safeNumber(record.CI2CFA)
    const ci3 = safeNumber(record.CI3CFA)

    return {
      id,
      tipoFactura: resolveTipoFactura(record) as Invoice['tipoFactura'],
      serie: record.NUMCFA?.slice(0, 1) ?? '',
      numero: record.NUMCFA ?? '',
      fechaExpedicion: record.FEMCFA?.toISOString() ?? record.FECCFA?.toISOString() ?? '',
      fechaContable: record.FECCFA?.toISOString() ?? undefined,
      lugarEmision: record.ALM?.DIR?.POBDIR ?? '',
      departamento: record.DEP?.NOMDEP ?? '',
      emisor: {
        nombreORazonSocial: record.FRECFA ? 'Proveedor' : 'Empresa',
        NIF: record.FRECFA ? '' : record.ENT?.NIFENT ?? '',
        domicilio: {
          calle: record.ALM?.DIR?.DIRDIR ?? '',
          codigoPostal: record.ALM?.DIR?.CPODIR ?? '',
          municipio: record.ALM?.DIR?.POBDIR ?? '',
          provincia: record.ALM?.DIR?.PRO?.NOMPRO ?? '',
          pais: record.ALM?.DIR?.PAI?.NOMPAI ?? ''
        }
      },
      cliente: {
        tipo: 'empresario/profesional',
        nombreORazonSocial: record.ENT?.NCOENT ?? 'Sin nombre',
        NIF: record.ENT?.NIFENT ?? '',
        domicilio: {
          calle: record.DIR?.DIRDIR ?? '',
          codigoPostal: record.DIR?.CPODIR ?? '',
          municipio: record.DIR?.POBDIR ?? '',
          provincia: record.DIR?.PRO?.NOMPRO ?? '',
          pais: record.DIR?.PAI?.NOMPAI ?? ''
        },
        pais: record.DIR?.PAI?.NOMPAI ?? ''
      },
      lineas,
      totales: {
        basesPorTipo: [],
        baseImponibleTotal: bi1 + bi2 + bi3,
        cuotaIVATotal: ci1 + ci2 + ci3,
        cuotaRETotal: safeNumber(record.CRPCFA),
        totalFactura: safeNumber(record.TOTCFA)
      },
      formaPago: record.FPACFA ?? '',
      medioPago: record.MPACFA ?? '',
      fechaVencimiento: credit?.FEVCRT?.toISOString(),
      notas: record.NUTCFA ?? '',
      status: safeNumber(record.TOTCFA) < 0 ? 'OVERDUE' : 'SENT',
      esRectificativa: safeNumber(record.TOTCFA) < 0,
      causaRectificacion: undefined,
      referenciasFacturasRectificadas: [],
      imputacion: '',
      mantenimientoCliente: '',
      exportacionImportacion: Boolean(record.EXPCFA),
      ctaIngreso: '',
      aplicarRetencion: false,
      ctaRetencion: '',
      baseRetencion: 0,
      porcentajeRetencion: 0,
      importeRetencion: 0,
      ctaGastosAsoc1: '',
      importeGastosAsoc1: 0,
      ctaGastosAsoc2: '',
      importeGastosAsoc2: 0,
      statusHistory: undefined
    } as Invoice
  }
}

