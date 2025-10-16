// Mock data for the facturación module - Spanish AEAT compliant

export type TipoFactura = 'ordinaria' | 'simplificada' | 'rectificativa'
export type TipoCliente = 'particular' | 'empresario/profesional'
export type TipoIVA = 0 | 4 | 10 | 21
export type MotivoExencion = 'art20.1.26' | 'art20.1.27' | 'art20.1.28' | 'art25' | 'exportacion' | 'otro'
export type CausaRectificacion = 'error' | 'devolucion' | 'descuento' | 'otro'

export interface Domicilio {
  calle: string
  codigoPostal: string
  municipio: string
  provincia: string
  pais: string
}

export interface Emisor {
  nombreORazonSocial: string
  NIF: string
  domicilio: Domicilio
  iban?: string
}

export interface Cliente {
  tipo: TipoCliente
  nombreORazonSocial: string
  NIF?: string
  domicilio?: Domicilio
  pais: string
}

export interface LineaFactura {
  id: number
  descripcion: string
  cantidad: number
  precioUnitario: number
  descuentoPct?: number
  // Régimen de IVA por línea
  tipoIVA?: TipoIVA
  exenta?: boolean
  motivoExencion?: MotivoExencion
  inversionSujetoPasivo?: boolean
  recargoEquivalenciaPct?: number
  // Cálculos automáticos
  baseLinea: number
  cuotaIVA: number
  cuotaRE: number
  totalLinea: number
}

export interface BasePorTipo {
  tipoIVA: TipoIVA
  base: number
  cuotaIVA: number
  recargoEquivalencia: number
}

export interface Totales {
  basesPorTipo: BasePorTipo[]
  baseImponibleTotal: number
  cuotaIVATotal: number
  cuotaRETotal: number
  retencionIRPFPct?: number
  importeRetencionIRPF?: number
  totalFactura: number
}

export interface Invoice {
  id: number
  // Encabezado
  tipoFactura: TipoFactura
  serie?: string
  numero: string
  fechaExpedicion: string
  fechaOperacion?: string
  moneda: string
  lugarEmision?: string
  
  // Emisor y Cliente
  emisor: Emisor
  cliente: Cliente
  
  // Líneas
  lineas: LineaFactura[]
  
  // Totales
  totales: Totales
  
  // Pago y notas
  formaPago?: string
  medioPago?: string
  fechaVencimiento?: string
  notas?: string
  
  // Campos específicos por tipo
  esRectificativa?: boolean
  causaRectificacion?: CausaRectificacion
  referenciasFacturasRectificadas?: string[]
  
  // Sistema
  status: string
  createdAt: string
  updatedAt: string
}

// Mock invoice data - Spanish AEAT compliant examples
export const mockInvoices: Invoice[] = [
  {
    id: 1,
    tipoFactura: 'ordinaria',
    serie: '2024-A',
    numero: '00001',
    fechaExpedicion: '2024-12-15',
    fechaOperacion: '2024-12-15',
    moneda: 'EUR',
    lugarEmision: 'Madrid',
    
    emisor: {
      nombreORazonSocial: 'Taller Mecánico García S.L.',
      NIF: 'B12345678',
      domicilio: {
        calle: 'Calle de la Industria 45',
        codigoPostal: '28045',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      iban: 'ES91 2100 0418 4502 0005 1332'
    },
    
    cliente: {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Juan Pérez García',
      NIF: '12345678A',
      domicilio: {
        calle: 'Calle Mayor 123',
        codigoPostal: '28001',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Reparación de motor - Cambio de aceite y filtros',
        cantidad: 1,
        precioUnitario: 450.00,
        tipoIVA: 21,
        baseLinea: 450.00,
        cuotaIVA: 94.50,
        cuotaRE: 0,
        totalLinea: 544.50
      },
      {
        id: 2,
        descripcion: 'Revisión de frenos y cambio de pastillas',
        cantidad: 1,
        precioUnitario: 200.00,
        tipoIVA: 21,
        baseLinea: 200.00,
        cuotaIVA: 42.00,
        cuotaRE: 0,
        totalLinea: 242.00
      },
      {
        id: 3,
        descripcion: 'Diagnóstico electrónico',
        cantidad: 1,
        precioUnitario: 200.00,
        tipoIVA: 21,
        baseLinea: 200.00,
        cuotaIVA: 42.00,
        cuotaRE: 0,
        totalLinea: 242.00
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 850.00,
          cuotaIVA: 178.50,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 850.00,
      cuotaIVATotal: 178.50,
      cuotaRETotal: 0,
      totalFactura: 1028.50
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES12 1234 5678 9012 3456 7890',
    fechaVencimiento: '2025-01-14',
    notas: 'Factura por servicios de reparación de vehículo',
    status: 'SENT',
    createdAt: '2024-12-15T10:30:00Z',
    updatedAt: '2024-12-15T10:30:00Z'
  },
  {
    id: 2,
    tipoFactura: 'simplificada',
    numero: '00002',
    fechaExpedicion: '2024-12-14',
    moneda: 'EUR',
    
    emisor: {
      nombreORazonSocial: 'Taller Mecánico García S.L.',
      NIF: 'B12345678',
      domicilio: {
        calle: 'Calle de la Industria 45',
        codigoPostal: '28045',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      }
    },
    
    cliente: {
      tipo: 'particular',
      nombreORazonSocial: 'María López Ruiz',
      pais: 'España'
    },
    
    lineas: [
      {
        id: 4,
        descripcion: 'Cambio de compresor de aire acondicionado',
        cantidad: 1,
        precioUnitario: 800.00,
        tipoIVA: 21,
        baseLinea: 800.00,
        cuotaIVA: 168.00,
        cuotaRE: 0,
        totalLinea: 968.00
      },
      {
        id: 5,
        descripcion: 'Recarga de gas refrigerante',
        cantidad: 1,
        precioUnitario: 150.00,
        tipoIVA: 21,
        baseLinea: 150.00,
        cuotaIVA: 31.50,
        cuotaRE: 0,
        totalLinea: 181.50
      },
      {
        id: 6,
        descripcion: 'Mano de obra especializada',
        cantidad: 5,
        precioUnitario: 50.00,
        tipoIVA: 21,
        baseLinea: 250.00,
        cuotaIVA: 52.50,
        cuotaRE: 0,
        totalLinea: 302.50
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 1200.00,
          cuotaIVA: 252.00,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 1200.00,
      cuotaIVATotal: 252.00,
      cuotaRETotal: 0,
      totalFactura: 1452.00
    },
    
    formaPago: 'Efectivo',
    medioPago: 'Pago en efectivo en taller',
    notas: 'Reparación completa del sistema de climatización',
    status: 'PAID',
    createdAt: '2024-12-14T14:20:00Z',
    updatedAt: '2024-12-14T16:45:00Z'
  },
  {
    id: 3,
    tipoFactura: 'ordinaria',
    serie: '2024-A',
    numero: '00003',
    fechaExpedicion: '2024-12-13',
    fechaOperacion: '2024-12-13',
    moneda: 'EUR',
    
    emisor: {
      nombreORazonSocial: 'Taller Mecánico García S.L.',
      NIF: 'B12345678',
      domicilio: {
        calle: 'Calle de la Industria 45',
        codigoPostal: '28045',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      }
    },
    
    cliente: {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Carlos Rodríguez Martín',
      NIF: '11223344C',
      domicilio: {
        calle: 'Plaza España 7',
        codigoPostal: '46001',
        municipio: 'Valencia',
        provincia: 'Valencia',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 7,
        descripcion: 'Limpieza completa del vehículo',
        cantidad: 1,
        precioUnitario: 150.00,
        tipoIVA: 21,
        baseLinea: 150.00,
        cuotaIVA: 31.50,
        cuotaRE: 0,
        totalLinea: 181.50
      },
      {
        id: 8,
        descripcion: 'Cambio de filtro de aire',
        cantidad: 1,
        precioUnitario: 50.00,
        tipoIVA: 21,
        baseLinea: 50.00,
        cuotaIVA: 10.50,
        cuotaRE: 0,
        totalLinea: 60.50
      },
      {
        id: 9,
        descripcion: 'Revisión de niveles',
        cantidad: 1,
        precioUnitario: 100.00,
        tipoIVA: 21,
        baseLinea: 100.00,
        cuotaIVA: 21.00,
        cuotaRE: 0,
        totalLinea: 121.00
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 300.00,
          cuotaIVA: 63.00,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 300.00,
      cuotaIVATotal: 63.00,
      cuotaRETotal: 0,
      totalFactura: 363.00
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'Bizum: +34 666 123 456',
    fechaVencimiento: '2024-12-28',
    notas: 'Mantenimiento básico y limpieza',
    status: 'OVERDUE',
    createdAt: '2024-12-13T09:15:00Z',
    updatedAt: '2024-12-13T09:15:00Z'
  },
  {
    id: 4,
    tipoFactura: 'rectificativa',
    serie: '2024-A',
    numero: 'R00001',
    fechaExpedicion: '2024-12-12',
    fechaOperacion: '2024-12-12',
    moneda: 'EUR',
    esRectificativa: true,
    causaRectificacion: 'error',
    referenciasFacturasRectificadas: ['2024-A-00001'],
    
    emisor: {
      nombreORazonSocial: 'Taller Mecánico García S.L.',
      NIF: 'B12345678',
      domicilio: {
        calle: 'Calle de la Industria 45',
        codigoPostal: '28045',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      }
    },
    
    cliente: {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Ana García Fernández',
      NIF: '55667788D',
      domicilio: {
        calle: 'Calle Real 89',
        codigoPostal: '15001',
        municipio: 'A Coruña',
        provincia: 'A Coruña',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 10,
        descripcion: 'Rectificación: Reparación de caja de cambios',
        cantidad: 1,
        precioUnitario: -600.00, // Negativo para rectificación
        tipoIVA: 21,
        baseLinea: -600.00,
        cuotaIVA: -126.00,
        cuotaRE: 0,
        totalLinea: -726.00
      },
      {
        id: 11,
        descripcion: 'Rectificación: Cambio de aceite de transmisión',
        cantidad: 1,
        precioUnitario: -150.00, // Negativo para rectificación
        tipoIVA: 21,
        baseLinea: -150.00,
        cuotaIVA: -31.50,
        cuotaRE: 0,
        totalLinea: -181.50
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: -750.00,
          cuotaIVA: -157.50,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: -750.00,
      cuotaIVATotal: -157.50,
      cuotaRETotal: 0,
      totalFactura: -907.50
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES12 1234 5678 9012 3456 7890',
    fechaVencimiento: '2025-01-11',
    notas: 'Factura rectificativa por error en factura 2024-A-00001',
    status: 'DRAFT',
    createdAt: '2024-12-12T16:30:00Z',
    updatedAt: '2024-12-12T16:30:00Z'
  },
  {
    id: 5,
    tipoFactura: 'ordinaria',
    serie: '2024-A',
    numero: '00004',
    fechaExpedicion: '2024-12-11',
    fechaOperacion: '2024-12-11',
    moneda: 'EUR',
    
    emisor: {
      nombreORazonSocial: 'Taller Mecánico García S.L.',
      NIF: 'B12345678',
      domicilio: {
        calle: 'Calle de la Industria 45',
        codigoPostal: '28045',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      }
    },
    
    cliente: {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Roberto Sánchez Jiménez',
      NIF: '99887766E',
      domicilio: {
        calle: 'Gran Vía 156',
        codigoPostal: '08013',
        municipio: 'Barcelona',
        provincia: 'Barcelona',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 12,
        descripcion: 'Reparación completa del motor',
        cantidad: 1,
        precioUnitario: 1500.00,
        tipoIVA: 21,
        baseLinea: 1500.00,
        cuotaIVA: 315.00,
        cuotaRE: 0,
        totalLinea: 1815.00
      },
      {
        id: 13,
        descripcion: 'Cambio de embrague',
        cantidad: 1,
        precioUnitario: 500.00,
        tipoIVA: 21,
        baseLinea: 500.00,
        cuotaIVA: 105.00,
        cuotaRE: 0,
        totalLinea: 605.00
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 2000.00,
          cuotaIVA: 420.00,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 2000.00,
      cuotaIVATotal: 420.00,
      cuotaRETotal: 0,
      totalFactura: 2420.00
    },
    
    formaPago: 'Tarjeta de crédito',
    medioPago: 'Visa **** 1234',
    fechaVencimiento: '2025-01-10',
    notas: 'Factura cancelada por cambio de servicios',
    status: 'CANCELLED',
    createdAt: '2024-12-11T11:00:00Z',
    updatedAt: '2024-12-11T15:30:00Z'
  }
]

// Mock service functions
export class MockInvoiceService {
  private static invoices: Invoice[] = [...mockInvoices]
  private static nextId = 6

  static async getInvoices(params: {
    page?: number
    limit?: number
    status?: string
    search?: string
  } = {}): Promise<{ invoices: Invoice[], pagination: any }> {
    const { page = 1, limit = 10, status, search } = params
    
    let filteredInvoices = [...this.invoices]
    
    // Filter by status
    if (status && status !== 'ALL') {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status)
    }
    
    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase()
      filteredInvoices = filteredInvoices.filter(invoice => {
        const invoiceNumber = `${invoice.serie || ''}-${invoice.numero}`.toLowerCase()
        return invoiceNumber.includes(searchLower) ||
               invoice.cliente.nombreORazonSocial.toLowerCase().includes(searchLower) ||
               (invoice.cliente.NIF && invoice.cliente.NIF.toLowerCase().includes(searchLower))
      })
    }
    
    // Sort by creation date (newest first)
    filteredInvoices.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    
    // Pagination
    const startIndex = (page - 1) * limit
    const endIndex = startIndex + limit
    const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex)
    
    return {
      invoices: paginatedInvoices,
      pagination: {
        page,
        limit,
        total: filteredInvoices.length,
        pages: Math.ceil(filteredInvoices.length / limit)
      }
    }
  }

  static async getInvoice(id: number): Promise<Invoice | null> {
    return this.invoices.find(invoice => invoice.id === id) || null
  }

  static async createInvoice(invoiceData: Omit<Invoice, 'id' | 'numero' | 'createdAt' | 'updatedAt'>): Promise<Invoice> {
    // Generate invoice number based on series and type
    const serie = invoiceData.serie || '2024-A'
    const tipoFactura = invoiceData.tipoFactura
    
    // Count invoices in the same series
    const seriesInvoices = this.invoices.filter(inv => inv.serie === serie)
    const nextNumber = String(seriesInvoices.length + 1).padStart(5, '0')
    
    // For rectificativa, use R prefix
    const numero = tipoFactura === 'rectificativa' ? `R${nextNumber}` : nextNumber
    
    const newInvoice: Invoice = {
      id: this.nextId++,
      numero,
      ...invoiceData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.invoices.unshift(newInvoice) // Add to beginning
    return newInvoice
  }

  static async updateInvoice(id: number, updateData: Partial<Invoice>): Promise<Invoice | null> {
    const index = this.invoices.findIndex(invoice => invoice.id === id)
    if (index === -1) return null
    
    this.invoices[index] = {
      ...this.invoices[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    return this.invoices[index]
  }

  static async deleteInvoice(id: number): Promise<boolean> {
    const index = this.invoices.findIndex(invoice => invoice.id === id)
    if (index === -1) return false
    
    this.invoices.splice(index, 1)
    return true
  }

  static async updateInvoiceStatus(id: number, status: string): Promise<Invoice | null> {
    return this.updateInvoice(id, { status })
  }
}
