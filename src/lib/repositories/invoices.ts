import { prisma } from '@/lib/prisma'
import { Invoice, LineaFactura } from '@/lib/mock-data'
import { InvoiceFromDb } from '@/lib/invoice-db-service'

const safeNumber = (value?: number | null) => Number(value ?? 0)

const mapLine = (line: any): LineaFactura => {
  const base = safeNumber(line.IPTLAB)
  const ivaPct = safeNumber(line.IVALAB)
  const rePct = safeNumber(line.REQLAB)
  const dt1 = safeNumber(line.DT1LAB)
  const dt2 = safeNumber(line.DT2LAB)
  const descuentoTotal = dt1 + dt2 // Suma de ambos descuentos según DBA: "LAB.DT1LAB Y LAB.DT2LAB"
  const cuotaIVA = +(base * (ivaPct / 100)).toFixed(2)
  const cuotaRE = +(base * (rePct / 100)).toFixed(2)
  return {
    id: line.IDELAB,
    descripcion: line.Piezas?.DenominacionPieza ?? line.NPELAB ?? 'Línea sin descripción',
    cantidad: safeNumber(line.SERLAB),
    precioUnitario: safeNumber(line.NETLAB),
    descuentoPct: descuentoTotal > 0 ? descuentoTotal : undefined,
    tipoIVA: (Math.round(safeNumber(line.IVALAB)) as 0 | 4 | 10 | 21) || 0,
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
      tipoFactura?: 'emitida' | 'recibida'
    }
  }) {
    const { page = 1, limit = 10, search, columnFilters = {}, filters = {} } = params
    const where: any = {}
    
    // Filter by invoice type: FRECFA = false for emitida, true for recibida
    if (filters.tipoFactura) {
      where.FRECFA = filters.tipoFactura === 'recibida'
    }

    if (search) {
      where.OR = [
        { NUMCFA: { contains: search } },
        { ENT: { is: { NIFENT: { contains: search } } } },
        { ENT: { is: { NCOENT: { contains: search } } } }
      ]
    }

    if (columnFilters.factura) {
      where.NUMCFA = { contains: columnFilters.factura }
    }
    if (columnFilters.nif) {
      where.ENT = { is: { NIFENT: { contains: columnFilters.nif } } }
    }
    if (columnFilters.cliente) {
      where.ENT = { is: { NCOENT: { contains: columnFilters.cliente } } }
    }

    // Combine DIR-related filters into a single DIR object with AND logic
    const dirFilters: any = {}
    if (columnFilters.direccion) {
      dirFilters.DIRDIR = { contains: columnFilters.direccion }
    }
    if (columnFilters.poblacion) {
      dirFilters.POBDIR = { contains: columnFilters.poblacion }
    }
    if (columnFilters.provincia) {
      dirFilters.PRO = { is: { NOMPRO: { contains: columnFilters.provincia } } }
    }
    if (columnFilters.codigoPostal) {
      dirFilters.CPODIR = { contains: columnFilters.codigoPostal }
    }
    if (Object.keys(dirFilters).length > 0) {
      where.DIR = { is: dirFilters }
    }

    // Payment filters
    if (columnFilters.formaPago) {
      const formaPagoNum = Number(columnFilters.formaPago)
      if (!Number.isNaN(formaPagoNum)) {
        where.FPACFA = formaPagoNum
      } else {
        // If not a number, search by payment method name
        where.CFP = { is: { NOMCFP: { contains: columnFilters.formaPago } } }
      }
    }
    if (columnFilters.medioPago) {
      const medioPagoNum = Number(columnFilters.medioPago)
      if (!Number.isNaN(medioPagoNum)) {
        where.MPACFA = medioPagoNum
      }
    }

    // Numeric filters with range matching
    if (columnFilters.baseImponible) {
      const baseValue = Number(columnFilters.baseImponible)
      if (!Number.isNaN(baseValue)) {
        const baseFilters = [
          { BI1CFA: { gte: baseValue * 0.99, lte: baseValue * 1.01 } },
          { BI2CFA: { gte: baseValue * 0.99, lte: baseValue * 1.01 } },
          { BI3CFA: { gte: baseValue * 0.99, lte: baseValue * 1.01 } },
          { BIPCFA: { gte: baseValue * 0.99, lte: baseValue * 1.01 } }
        ]
        // Combine with existing OR if present
        if (where.OR) {
          if (where.AND) {
            where.AND.push({ OR: baseFilters })
          } else {
            where.AND = [
              { OR: where.OR },
              { OR: baseFilters }
            ]
            delete where.OR
          }
        } else {
          where.OR = baseFilters
        }
      }
    }
    if (columnFilters.iva) {
      const ivaValue = Number(columnFilters.iva)
      if (!Number.isNaN(ivaValue)) {
        const ivaFilters = [
          { CI1CFA: { gte: ivaValue * 0.99, lte: ivaValue * 1.01 } },
          { CI2CFA: { gte: ivaValue * 0.99, lte: ivaValue * 1.01 } },
          { CI3CFA: { gte: ivaValue * 0.99, lte: ivaValue * 1.01 } },
          { CIPCFA: { gte: ivaValue * 0.99, lte: ivaValue * 1.01 } }
        ]
        if (where.OR) {
          if (where.AND) {
            where.AND.push({ OR: ivaFilters })
          } else {
            where.AND = [
              { OR: where.OR },
              { OR: ivaFilters }
            ]
            delete where.OR
          }
        } else {
          where.OR = ivaFilters
        }
      }
    }
    if (columnFilters.total) {
      const totalValue = Number(columnFilters.total)
      if (!Number.isNaN(totalValue)) {
        where.TOTCFA = { gte: totalValue * 0.99, lte: totalValue * 1.01 }
      }
    }

    // Date filter
    if (columnFilters.fecha) {
      const fechaValue = new Date(columnFilters.fecha)
      if (!Number.isNaN(fechaValue.getTime())) {
        const startOfDay = new Date(fechaValue)
        startOfDay.setHours(0, 0, 0, 0)
        const endOfDay = new Date(fechaValue)
        endOfDay.setHours(23, 59, 59, 999)
        // Only apply date filter if not conflicting with factura filter
        if (!columnFilters.factura) {
          where.FECCFA = { gte: startOfDay, lte: endOfDay }
        } else {
          // If both exist, combine with AND
          if (!where.AND) where.AND = []
          where.AND.push({ FECCFA: { gte: startOfDay, lte: endOfDay } })
        }
      }
    }

    // Status filter
    if (columnFilters.estado) {
      const estadoLower = columnFilters.estado.toLowerCase()
      if (estadoLower === 'rectificativa') {
        where.TOTCFA = { lt: 0 }
      } else if (estadoLower === 'pagada' || estadoLower === 'paid') {
        where.TOTCFA = { gt: 0 }
      }
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
      const bip = safeNumber(record.BIPCFA)
      const ci1 = safeNumber(record.CI1CFA)
      const ci2 = safeNumber(record.CI2CFA)
      const ci3 = safeNumber(record.CI3CFA)
      const cip = safeNumber(record.CIPCFA)
      const baseImponible = bi1 + bi2 + bi3 + bip
      const iva = ci1 + ci2 + ci3 + cip
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
      orderBy: { FVTCRT: 'asc' }
    })

    const bi1 = safeNumber(record.BI1CFA)
    const bi2 = safeNumber(record.BI2CFA)
    const bi3 = safeNumber(record.BI3CFA)
    const bip = safeNumber(record.BIPCFA)
    const ci1 = safeNumber(record.CI1CFA)
    const ci2 = safeNumber(record.CI2CFA)
    const ci3 = safeNumber(record.CI3CFA)
    const cip = safeNumber(record.CIPCFA)
    const cr1 = safeNumber(record.CR1CFA)
    const cr2 = safeNumber(record.CR2CFA)
    const cr3 = safeNumber(record.CR3CFA)
    const crp = safeNumber(record.CRPCFA)

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
          provincia: (record.ALM?.DIR as any)?.PRO?.NOMPRO ?? '',
          pais: (record.ALM?.DIR as any)?.PAI?.NOMPAI ?? ''
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
        baseImponibleTotal: bi1 + bi2 + bi3 + bip,
        cuotaIVATotal: ci1 + ci2 + ci3 + cip,
        cuotaRETotal: cr1 + cr2 + cr3 + crp,
        totalFactura: safeNumber(record.TOTCFA)
      },
      formaPago: String(record.FPACFA ?? ''),
      medioPago: record.MPACFA ?? '',
      fechaVencimiento: credit?.FVTCRT?.toISOString(),
      notas: record.NOTCFA ?? '',
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
      statusHistory: undefined,
      createdAt: record.FECCFA?.toISOString() || new Date().toISOString(),
      updatedAt: record.FEMCFA?.toISOString() || new Date().toISOString()
    } as unknown as Invoice
  }
}

