import { prisma } from '@/lib/prisma'
import { Entidad, TipoEntidad } from '@/lib/mock-data'

type ColumnFilters = {
  nif?: string
  nombre?: string
  telefono?: string
}

const normalizeString = (value?: string | null) => value?.trim() || ''

const mapRoles = (row: any) => {
  return {
    proveedor: Boolean(row.FPR),
    cliente: Boolean(row.FCL),
    vendedor: false, // FVE no está directamente relacionado, se verificará por separado
    operarioTaller: Boolean(row.FOT),
    aseguradora: false, // FCS no está directamente relacionado, se verificará por separado
    financiera: Boolean(row.FFI),
    agenciaTransporte: Boolean(row.FTR),
    banco: Boolean(row.FBA),
    rentacar: false // FRC no está directamente relacionado, se verificará por separado
  }
}

const mapEntidad = (row: any): Entidad => {
  const roles = row._roles ?? mapRoles(row)
  const primaryContact = row?.CON?.[0]
  const direcciones = (row?.DIR_DIR_ENTDIRToENT ?? []).map((dir: any) => ({
    id: dir.IDEDIR,
    centro: normalizeString(dir.NOMDIR) || 'Principal',
    direccion: dir.DIRDIR,
    telefono: dir.TLFDIR ?? '',
    telefonoMovil: dir.TL1DIR ?? '',
    email: dir.EMADIR ?? ''
  }))

  return {
    id: row.IDEENT,
    NIF: row.NIFENT,
    razonSocial: row.NCOENT,
    nombreComercial: row.NOMENT ?? '',

    fechaAlta: row.FEAENT?.toISOString() ?? '',
    fechaBaja: row.FEBENT?.toISOString(),

    personaFisica: Boolean(row.PERENT),
    tipoIdentificador: row.TNIENT ?? 'NIF/CIF-IVA',
    paisOrigen: row.PAOENT ? String(row.PAOENT) : '1',
    extranjero: Boolean(row.EXTENT),
    operadorIntracomunitario: Boolean(row.INTENT),
    importacionExportacion: Boolean(row.EXPENT),
    regimenCanario: Boolean(row.CANENT),

    proveedor: roles.proveedor,
    cliente: roles.cliente,
    vendedor: roles.vendedor,
    operarioTaller: roles.operarioTaller,
    aseguradora: roles.aseguradora,
    financiera: roles.financiera,
    agenciaTransporte: roles.agenciaTransporte,
    banco: roles.banco,
    rentacar: roles.rentacar,

    monedaEntidad: row.MONENT === 1 ? 'Euro' : row.MONENT === 2 ? 'Peseta' : 'EUR',

    telefono: primaryContact?.TLFCON ?? '',
    email: primaryContact?.EMACON ?? '',
    domicilio: direcciones[0] && row.DIR_DIR_ENTDIRToENT?.[0]
      ? {
          calle: row.DIR_DIR_ENTDIRToENT[0].DIRDIR ?? '',
          codigoPostal: row.DIR_DIR_ENTDIRToENT[0].CPODIR ?? '',
          municipio: row.DIR_DIR_ENTDIRToENT[0].POBDIR ?? '',
          provincia: row.DIR_DIR_ENTDIRToENT[0].PRO?.NOMPRO ?? '',
          pais: row.DIR_DIR_ENTDIRToENT[0].PAI?.NOMPAI ?? 'España'
        }
      : undefined,
    direcciones,

    // Legacy compatibility
    tipoEntidad: roles.cliente ? 'cliente' : roles.proveedor ? 'proveedor' : roles.vendedor ? 'vendedor' : 'cliente',
    tipo: roles.cliente ? 'empresario/profesional' : 'particular',
    nombreORazonSocial: row.NCOENT,
    pais: row.DIR_DIR_ENTDIRToENT?.[0]?.PAI?.NOMPAI ?? 'España',
    createdAt: row.FEAENT?.toISOString() ?? '',
    updatedAt: row.FEBENT?.toISOString() ?? row.FEAENT?.toISOString() ?? '',
    
    // Modification tracking
    modificadoPor: (row as any).modificadoPor ?? undefined,
    fechaModificacion: row.FEMENT ? new Date(row.FEMENT).toISOString() : undefined,
    
    // Payment information (for clients)
    formaPago: row.FCL?.CFP?.NOMCFP ?? undefined
  }
}

export class EntitiesRepository {
  static async list(params: {
    page?: number
    limit?: number
    columnFilters?: ColumnFilters
    tipoEntidadFilter?: 'ALL' | TipoEntidad
  }) {
    const { page = 1, limit = 100, columnFilters = {}, tipoEntidadFilter = 'ALL' } = params

    const where: any = {}

    if (columnFilters.nif) {
      // SQL Server doesn't support , use contains without mode
      where.NIFENT = { contains: columnFilters.nif }
    }

    if (columnFilters.nombre) {
      // SQL Server doesn't support , use contains without mode
      where.NCOENT = { contains: columnFilters.nombre }
    }

    // Apply tipoEntidadFilter at database level when possible
    if (tipoEntidadFilter === 'cliente') {
      where.FCL = { isNot: null }
    } else if (tipoEntidadFilter === 'proveedor') {
      where.FPR = { isNot: null }
    }
    // Note: vendedor (FVE) cannot be filtered at DB level as it's a separate table

    // Get total count from database with same where clause
    const total = await prisma.eNT.count({ where })

    const records = await prisma.eNT.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { FEAENT: 'desc' },
      include: {
        DIR_DIR_ENTDIRToENT: {
          include: {
            PRO: true,
            PAI: true
          }
        },
        CON: {
          include: { DIR: true },
          take: 1
        },
        FPR: true,
        FCL: true,
        FOT: true,
        FFI: true,
        FTR: true,
        FBA: true
      }
    })

    // Check FVE, FCS, FRC relationships separately (not directly related in ENT)
    const entityIds = records.map(r => r.IDEENT)
    const [fveRecords, fcsRecords, frcRecords] = await Promise.all([
      prisma.fVE.findMany({ where: { ENTFVE: { in: entityIds } }, select: { ENTFVE: true } }),
      prisma.fCS.findMany({ where: { ENTFCS: { in: entityIds } }, select: { ENTFCS: true } }),
      prisma.fRC.findMany({ where: { ENTFRC: { in: entityIds } }, select: { ENTFRC: true } })
    ])
    
    const fveSet = new Set(fveRecords.map(r => r.ENTFVE))
    const fcsSet = new Set(fcsRecords.map(r => r.ENTFCS))
    const frcSet = new Set(frcRecords.map(r => r.ENTFRC))

    const mapped = records.map(row => {
      const roles = mapRoles(row)
      // Add FVE, FCS, FRC from separate queries
      roles.vendedor = fveSet.has(row.IDEENT)
      roles.aseguradora = fcsSet.has(row.IDEENT)
      roles.rentacar = frcSet.has(row.IDEENT)
      return mapEntidad({ ...row, _roles: roles })
    })

    // Apply vendedor filter post-query if needed (since FVE is separate table)
    const filtered =
      tipoEntidadFilter === 'vendedor'
        ? mapped.filter(entity => entity.vendedor)
        : mapped

    // For vendedor filter, we need to adjust total count
    // Since we can't count FVE relationships efficiently, we use the filtered count
    // This is a limitation - for accurate vendedor counts, we'd need a more complex query
    const finalTotal = tipoEntidadFilter === 'vendedor' 
      ? filtered.length // Approximate for vendedor filter
      : total

    return {
      entities: filtered,
      total: finalTotal,
      page,
      limit,
      pages: Math.ceil(finalTotal / limit) || 1
    }
  }

  static async findById(id: number) {
    const record = await prisma.eNT.findUnique({
      where: { IDEENT: id },
      include: {
        DIR_DIR_ENTDIRToENT: {
          include: {
            PRO: true,
            PAI: true
          }
        },
        CON: {
          include: { DIR: true },
          take: 1
        },
        FPR: true,
        FCL: {
          include: {
            CFP: true
          }
        },
        FOT: true,
        FFI: true,
        FTR: true,
        FBA: true
      }
    })

    if (!record) return null
    
    // Check FVE, FCS, FRC relationships separately and get user info
    const [fve, fcs, frc, usuario] = await Promise.all([
      prisma.fVE.findUnique({ where: { ENTFVE: record.IDEENT }, select: { ENTFVE: true } }),
      prisma.fCS.findUnique({ where: { ENTFCS: record.IDEENT }, select: { ENTFCS: true } }),
      prisma.fRC.findUnique({ where: { ENTFRC: record.IDEENT }, select: { ENTFRC: true } }),
      record.USUENT ? prisma.eNT.findUnique({ 
        where: { IDEENT: record.USUENT }, 
        select: { NCOENT: true } 
      }) : Promise.resolve(null)
    ])
    
    const roles = mapRoles(record)
    roles.vendedor = Boolean(fve)
    roles.aseguradora = Boolean(fcs)
    roles.rentacar = Boolean(frc)
    
    return mapEntidad({ ...record, _roles: roles, modificadoPor: usuario?.NCOENT })
  }

  static async findByNIF(nif: string) {
    const record = await prisma.eNT.findFirst({
      where: { NIFENT: nif },
      include: {
        DIR_DIR_ENTDIRToENT: {
          include: {
            PRO: true,
            PAI: true
          }
        },
        CON: {
          include: { DIR: true },
          take: 1
        },
        FPR: true,
        FCL: {
          include: {
            CFP: true
          }
        },
        FOT: true,
        FFI: true,
        FTR: true,
        FBA: true
      }
    })

    if (!record) return null
    
    // Check FVE, FCS, FRC relationships separately and get user info
    const [fve, fcs, frc, usuario] = await Promise.all([
      prisma.fVE.findUnique({ where: { ENTFVE: record.IDEENT }, select: { ENTFVE: true } }),
      prisma.fCS.findUnique({ where: { ENTFCS: record.IDEENT }, select: { ENTFCS: true } }),
      prisma.fRC.findUnique({ where: { ENTFRC: record.IDEENT }, select: { ENTFRC: true } }),
      record.USUENT ? prisma.eNT.findUnique({ 
        where: { IDEENT: record.USUENT }, 
        select: { NCOENT: true } 
      }) : Promise.resolve(null)
    ])
    
    const roles = mapRoles(record)
    roles.vendedor = Boolean(fve)
    roles.aseguradora = Boolean(fcs)
    roles.rentacar = Boolean(frc)
    
    return mapEntidad({ ...record, _roles: roles, modificadoPor: usuario?.NCOENT })
  }

  static async create(payload: Omit<Entidad, 'id' | 'createdAt' | 'updatedAt'>) {
    const {
      NIF,
      razonSocial,
      nombreComercial,
      personaFisica,
      tipoIdentificador,
      paisOrigen,
      extranjero,
      operadorIntracomunitario,
      importacionExportacion,
      regimenCanario,
      monedaEntidad,
      domicilio,
      proveedor,
      cliente,
      vendedor,
      operarioTaller,
      aseguradora,
      financiera,
      agenciaTransporte,
      banco,
      rentacar
    } = payload

    // Defaults from DB inspection
    const divId = 1 // Euro
    const defaultPais = 1 // ESPAÑA
    const defaultProvincia = domicilio?.provincia ? undefined : null

    const ent = await prisma.eNT.create({
      data: {
        NIFENT: (NIF || '').substring(0, 50),
        NCOENT: (razonSocial || '').substring(0, 255),
        NOMENT: ((nombreComercial ?? razonSocial) || '').substring(0, 255),
        PERENT: Boolean(personaFisica),
        TNIENT: (tipoIdentificador || '02').substring(0, 2),
        PAOENT: paisOrigen ? Number(paisOrigen) || defaultPais : defaultPais,
        EXTENT: extranjero ? 1 : 0,
        INTENT: operadorIntracomunitario ?? false,
        EXPENT: importacionExportacion ?? false,
        CANENT: regimenCanario ?? false,
        MONENT: typeof monedaEntidad === 'number' ? monedaEntidad : divId
      }
    })

    // Dirección principal
    const dir = domicilio
      ? await prisma.dIR.create({
          data: {
            ENTDIR: ent.IDEENT,
            NOMDIR: 'PRINCIPAL',
            DIRDIR: (domicilio.calle || '').substring(0, 255),
            POBDIR: (domicilio.municipio || '').substring(0, 150),
            CPODIR: (domicilio.codigoPostal || '').substring(0, 10),
            PRODIR: defaultProvincia ?? 30, // Default to Málaga (30) if not provided
            PAIDIR: defaultPais,
            TLFDIR: null,
            TL1DIR: ((domicilio as any).telefono || (domicilio as any).telefonoMovil || '').substring(0, 20) || null,
            EMADIR: ((domicilio as any).email || '').substring(0, 255) || null
          }
        })
      : null

    // Roles helpers (best-effort create; ignore if already exists)
    const tryCreate = async (cb: () => Promise<unknown>) => {
      try {
        await cb()
      } catch (err: any) {
        // Ignore unique violations or empty updates
      }
    }

    if (cliente) {
      // Find or create a default TCL record for FCL
      let tclId = 1
      const existingTcl = await prisma.tCL.findFirst({ orderBy: { IDETCL: 'asc' } })
      if (existingTcl) {
        tclId = existingTcl.IDETCL
      } else {
        // Create a default TCL if none exists
        const newTcl = await prisma.tCL.create({
          data: {
            NOMTCL: 'General',
            PRBTCL: 0,
            PORTCL: 0,
            DDTTCL: false
          }
        })
        tclId = newTcl.IDETCL
      }
      await tryCreate(() =>
        prisma.fCL.create({
          data: {
            ENTFCL: ent.IDEENT,
            FPAFCL: 1,
            TIVFCL: 1,
            TCLFCL: tclId
          }
        })
      )
    }

    if (proveedor) {
      await tryCreate(() =>
        prisma.fPR.create({
          data: {
            ENTFPR: ent.IDEENT,
            FPAFPR: 1,
            TIVFPR: 1
          }
        })
      )
    }

    if (vendedor) {
      await tryCreate(() =>
        prisma.fVE.create({
          data: {
            ENTFVE: ent.IDEENT,
            FPAFVE: 1,
            AGEFVE: 1,
            ALMFVE: 1
          }
        })
      )
    }

    const genericRole = async (table: any, pkField: string) => {
      await tryCreate(() =>
        table.create({
          data: {
            [pkField]: ent.IDEENT
          }
        })
      )
    }

    if (operarioTaller) await genericRole(prisma.fOT, 'ENTFOT')
    if (aseguradora) await genericRole(prisma.fCS, 'ENTFCS')
    if (financiera) await genericRole(prisma.fFI, 'ENTFFI')
    if (agenciaTransporte) await genericRole(prisma.fTR, 'ENTFTR')
    if (banco) await genericRole(prisma.fBA, 'ENTFBA')
    if (rentacar) await genericRole(prisma.fRC, 'ENTFRC')

    // Contacto opcional (CON) si hay teléfono/email
    if ((payload as any).telefono || (payload as any).email) {
      await tryCreate(() =>
        prisma.cON.create({
          data: {
            ENTCON: ent.IDEENT,
            DIRCON: dir?.IDEDIR ?? ent.DFAENT ?? ent.IDEENT,
            NOMCON: razonSocial,
            TLFCON: (payload as any).telefono || '',
            TL1CON: (payload as any).telefono,
            EMACON: (payload as any).email || ''
          }
        })
      )
    }

    return this.findById(ent.IDEENT)
  }

  static async update(id: number, payload: Partial<Entidad>, userId?: number) {
    // Prepare update data for ENT
    const updateData: any = {
      USUENT: userId, // Usuario que modifica
      FEMENT: new Date() // Fecha de modificación
    }

    // Basic fields
    if (payload.NIF !== undefined) updateData.NIFENT = payload.NIF
    if (payload.razonSocial !== undefined) updateData.NCOENT = payload.razonSocial
    if (payload.nombreComercial !== undefined) updateData.NOMENT = payload.nombreComercial ?? payload.razonSocial
    if (payload.personaFisica !== undefined) updateData.PERENT = payload.personaFisica
    if (payload.tipoIdentificador !== undefined) updateData.TNIENT = payload.tipoIdentificador
    if (payload.paisOrigen !== undefined) updateData.PAOENT = payload.paisOrigen ? Number(payload.paisOrigen) : undefined
    if (payload.extranjero !== undefined) updateData.EXTENT = payload.extranjero ? 1 : 0
    if (payload.operadorIntracomunitario !== undefined) updateData.INTENT = payload.operadorIntracomunitario
    if (payload.importacionExportacion !== undefined) updateData.EXPENT = payload.importacionExportacion
    if (payload.regimenCanario !== undefined) updateData.CANENT = payload.regimenCanario

    // Dates
    if (payload.fechaAlta !== undefined) {
      updateData.FEAENT = payload.fechaAlta ? new Date(payload.fechaAlta) : new Date()
    }
    if (payload.fechaBaja !== undefined) {
      updateData.FEBENT = payload.fechaBaja ? new Date(payload.fechaBaja) : null
    }

    // Currency (MONENT)
    if (payload.monedaEntidad !== undefined) {
      let monedaId = 1 // Default to Euro
      if (typeof payload.monedaEntidad === 'number') {
        monedaId = payload.monedaEntidad
      } else if (typeof payload.monedaEntidad === 'string') {
        const monedaUpper = payload.monedaEntidad.toUpperCase()
        if (monedaUpper.includes('EUR') || monedaUpper.includes('EURO')) {
          monedaId = 1
        } else if (monedaUpper.includes('PESETA') || monedaUpper.includes('PTS')) {
          monedaId = 2
        } else {
          // Try to find by name in DIV table
          const div = await prisma.dIV.findFirst({
            where: { NOMDIV: { contains: payload.monedaEntidad } }
          })
          if (div) {
            monedaId = div.IDEDIV
          }
        }
      }
      updateData.MONENT = monedaId
    }

    await prisma.eNT.update({
      where: { IDEENT: id },
      data: updateData
    })

    // Update address (DIR)
    if (payload.domicilio) {
      const dir = await prisma.dIR.findFirst({ where: { ENTDIR: id } })
      if (dir) {
        const dirUpdateData: any = {}
        if (payload.domicilio.calle !== undefined) dirUpdateData.DIRDIR = payload.domicilio.calle
        if (payload.domicilio.municipio !== undefined) dirUpdateData.POBDIR = payload.domicilio.municipio
        if (payload.domicilio.codigoPostal !== undefined) dirUpdateData.CPODIR = payload.domicilio.codigoPostal
        if ((payload as any).telefono !== undefined) dirUpdateData.TLFDIR = (payload as any).telefono || null
        if ((payload.domicilio as any)?.telefonoMovil !== undefined) dirUpdateData.TL1DIR = (payload.domicilio as any).telefonoMovil || null
        if ((payload as any).email !== undefined) dirUpdateData.EMADIR = (payload as any).email || null

        if (Object.keys(dirUpdateData).length > 0) {
          await prisma.dIR.update({
            where: { IDEDIR: dir.IDEDIR },
            data: dirUpdateData
          })
        }
      }
    }

    // Update contact (CON) for phone/email
    if ((payload as any).telefono !== undefined || (payload as any).email !== undefined) {
      const con = await prisma.cON.findFirst({ where: { ENTCON: id } })
      if (con) {
        const conUpdateData: any = {}
        if ((payload as any).telefono !== undefined) {
          conUpdateData.TLFCON = (payload as any).telefono || ''
          conUpdateData.TL1CON = (payload as any).telefono || ''
        }
        if ((payload as any).email !== undefined) {
          conUpdateData.EMACON = (payload as any).email || ''
        }
        if (Object.keys(conUpdateData).length > 0) {
          await prisma.cON.update({
            where: { IDECON: con.IDECON },
            data: conUpdateData
          })
        }
      }
    }

    // Update roles (FCL, FPR, FVE, etc.)
    const tryCreate = async (cb: () => Promise<unknown>) => {
      try {
        const result = await cb()
        return result
      } catch (err: any) {
        // Ignore unique violations or empty updates
      }
    }

    const tryDelete = async (cb: () => Promise<unknown>) => {
      try {
        await cb()
      } catch (err: any) {
        // Ignore errors (e.g., if record doesn't exist or has FK constraints)
      }
    }

    // Cliente (FCL)
    if (payload.cliente !== undefined) {
      const existingFcl = await prisma.fCL.findUnique({ where: { ENTFCL: id } })
      if (payload.cliente && !existingFcl) {
        // Find or create a default TCL record for FCL
        let tclId = 1
        const existingTcl = await prisma.tCL.findFirst({ orderBy: { IDETCL: 'asc' } })
        if (existingTcl) {
          tclId = existingTcl.IDETCL
        } else {
          // Create a default TCL if none exists
          const newTcl = await prisma.tCL.create({
            data: {
              NOMTCL: 'General',
              PRBTCL: 0,
              PORTCL: 0,
              DDTTCL: false
            }
          })
          tclId = newTcl.IDETCL
        }
        await tryCreate(() =>
          prisma.fCL.create({
            data: {
              ENTFCL: id,
              FPAFCL: 1,
              TIVFCL: 1,
              TCLFCL: tclId
            }
          })
        )
      } else if (!payload.cliente && existingFcl) {
        await tryDelete(() => prisma.fCL.delete({ where: { ENTFCL: id } }))
      }
    }
    
    // Force refresh Prisma connection to ensure new relationships are loaded
    // This ensures that findById will include newly created FCL/FPR/etc records
    await prisma.$queryRaw`SELECT 1`

    // Proveedor (FPR)
    if (payload.proveedor !== undefined) {
      const existingFpr = await prisma.fPR.findUnique({ where: { ENTFPR: id } })
      if (payload.proveedor && !existingFpr) {
        await tryCreate(() =>
          prisma.fPR.create({
            data: {
              ENTFPR: id,
              FPAFPR: 1,
              TIVFPR: 1
            }
          })
        )
      }
    }

    // Vendedor (FVE)
    if (payload.vendedor !== undefined) {
      const existingFve = await prisma.fVE.findUnique({ where: { ENTFVE: id } })
      if (payload.vendedor && !existingFve) {
        await tryCreate(() =>
          prisma.fVE.create({
            data: {
              ENTFVE: id,
              FPAFVE: 1,
              AGEFVE: 1,
              ALMFVE: 1
            }
          })
        )
      }
    }

    // Generic roles
    const genericRole = async (table: any, pkField: string, shouldExist: boolean) => {
      const existing = await table.findUnique({ where: { [pkField]: id } })
      if (shouldExist && !existing) {
        await tryCreate(() =>
          table.create({
            data: {
              [pkField]: id
            }
          })
        )
      }
    }

    if (payload.operarioTaller !== undefined) await genericRole(prisma.fOT, 'ENTFOT', payload.operarioTaller)
    if (payload.aseguradora !== undefined) await genericRole(prisma.fCS, 'ENTFCS', payload.aseguradora)
    if (payload.financiera !== undefined) await genericRole(prisma.fFI, 'ENTFFI', payload.financiera)
    if (payload.agenciaTransporte !== undefined) await genericRole(prisma.fTR, 'ENTFTR', payload.agenciaTransporte)
    if (payload.banco !== undefined) await genericRole(prisma.fBA, 'ENTFBA', payload.banco)
    if (payload.rentacar !== undefined) await genericRole(prisma.fRC, 'ENTFRC', payload.rentacar)

    // Update payment method (formaPago) for clients
    if (payload.formaPago !== undefined) {
      const fcl = await prisma.fCL.findUnique({ where: { ENTFCL: id } })
      if (fcl) {
        let formaPagoId: number | undefined
        
        // If formaPago is a number, use it directly
        if (typeof payload.formaPago === 'number') {
          formaPagoId = payload.formaPago
        } else if (typeof payload.formaPago === 'string' && payload.formaPago.trim() !== '') {
          // If it's a string (name), find the ID by name
          const cfp = await prisma.cFP.findFirst({
            where: { NOMCFP: { contains: payload.formaPago } }
          })
          if (cfp) {
            formaPagoId = cfp.IDECFP
          }
        }
        
        // Update FCL.FPAFCL if we found a valid ID
        if (formaPagoId !== undefined) {
          await prisma.fCL.update({
            where: { ENTFCL: id },
            data: { FPAFCL: formaPagoId }
          })
        }
      }
    }

    // After updating relationships, we need to ensure Prisma includes them
    // Use findUnique with explicit include to force fresh data (don't use this.findById which may have cache issues)
    const refreshedRecord = await prisma.eNT.findUnique({
      where: { IDEENT: id },
      include: {
        DIR_DIR_ENTDIRToENT: {
          include: {
            PRO: true,
            PAI: true
          }
        },
        CON: {
          include: { DIR: true },
          take: 1
        },
        FPR: true,
        FCL: {
          include: {
            CFP: true
          }
        },
        FOT: true,
        FFI: true,
        FTR: true,
        FBA: true
      }
    })

    if (!refreshedRecord) return null
    
    // Check FVE, FCS, FRC relationships separately and get user info
    const [fve, fcs, frc, usuario] = await Promise.all([
      prisma.fVE.findUnique({ where: { ENTFVE: refreshedRecord.IDEENT }, select: { ENTFVE: true } }),
      prisma.fCS.findUnique({ where: { ENTFCS: refreshedRecord.IDEENT }, select: { ENTFCS: true } }),
      prisma.fRC.findUnique({ where: { ENTFRC: refreshedRecord.IDEENT }, select: { ENTFRC: true } }),
      refreshedRecord.USUENT ? prisma.eNT.findUnique({ 
        where: { IDEENT: refreshedRecord.USUENT }, 
        select: { NCOENT: true } 
      }) : Promise.resolve(null)
    ])
    
    const roles = mapRoles(refreshedRecord)
    roles.vendedor = Boolean(fve)
    roles.aseguradora = Boolean(fcs)
    roles.rentacar = Boolean(frc)
    
    return mapEntidad({ ...refreshedRecord, _roles: roles, modificadoPor: usuario?.NCOENT })
  }
}

