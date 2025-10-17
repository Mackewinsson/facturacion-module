// Mock data for the facturación module - Spanish AEAT compliant

export type TipoFactura = 'ordinaria' | 'simplificada' | 'rectificativa' | 'emitida' | 'recibida'
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
  descripcionDetallada?: string
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
  },
  {
    id: 6,
    tipoFactura: 'emitida',
    serie: '2024-E',
    numero: '00001',
    fechaExpedicion: '2024-12-10',
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
    },
    
    cliente: {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'AutoRepuestos López S.L.',
      NIF: 'A87654321',
      domicilio: {
        calle: 'Avenida de la Industria 78',
        codigoPostal: '28050',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 14,
        descripcion: 'Servicios de reparación especializada',
        cantidad: 1,
        precioUnitario: 1200.00,
        tipoIVA: 21,
        baseLinea: 1200.00,
        cuotaIVA: 252.00,
        cuotaRE: 0,
        totalLinea: 1452.00
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
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES12 1234 5678 9012 3456 7890',
    fechaVencimiento: '2025-01-09',
    notas: 'Factura emitida por servicios de reparación',
    status: 'SENT',
    createdAt: '2024-12-10T09:30:00Z',
    updatedAt: '2024-12-10T09:30:00Z'
  },
  {
    id: 7,
    tipoFactura: 'recibida',
    serie: '2024-R',
    numero: '00001',
    fechaExpedicion: '2024-12-09',
    lugarEmision: 'Barcelona',
    
    emisor: {
      nombreORazonSocial: 'Proveedor de Repuestos S.A.',
      NIF: 'A11223344',
      domicilio: {
        calle: 'Carrer de la Indústria 123',
        codigoPostal: '08025',
        municipio: 'Barcelona',
        provincia: 'Barcelona',
        pais: 'España'
      },
    },
    
    cliente: {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Taller Mecánico García S.L.',
      NIF: 'B12345678',
      domicilio: {
        calle: 'Calle de la Industria 45',
        codigoPostal: '28045',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 15,
        descripcion: 'Repuestos y piezas de recambio',
        cantidad: 10,
        precioUnitario: 85.00,
        tipoIVA: 21,
        baseLinea: 850.00,
        cuotaIVA: 178.50,
        cuotaRE: 0,
        totalLinea: 1028.50
      },
      {
        id: 16,
        descripcion: 'Filtros de aceite y aire',
        cantidad: 5,
        precioUnitario: 25.00,
        tipoIVA: 21,
        baseLinea: 125.00,
        cuotaIVA: 26.25,
        cuotaRE: 0,
        totalLinea: 151.25
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 975.00,
          cuotaIVA: 204.75,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 975.00,
      cuotaIVATotal: 204.75,
      cuotaRETotal: 0,
      totalFactura: 1179.75
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES91 2100 0418 4502 0005 1332',
    fechaVencimiento: '2025-01-08',
    notas: 'Factura recibida por compra de repuestos',
    status: 'PAID',
    createdAt: '2024-12-09T14:15:00Z',
    updatedAt: '2024-12-09T16:20:00Z'
  },
  {
    id: 8,
    tipoFactura: 'ordinaria',
    serie: '2024-TEST',
    numero: '00001',
    fechaExpedicion: '2024-12-08',
    lugarEmision: 'Sevilla',
    
    emisor: {
      nombreORazonSocial: 'Nibisoft S.L.',
      NIF: 'B98765432',
      domicilio: {
        calle: 'Calle Tecnología 123',
        codigoPostal: '41001',
        municipio: 'Sevilla',
        provincia: 'Sevilla',
        pais: 'España'
      },
    },
    
    cliente: {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Empresa de Pruebas S.A.',
      NIF: 'A12345678',
      domicilio: {
        calle: 'Avenida de las Pruebas 456',
        codigoPostal: '28080',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 17,
        descripcion: 'Desarrollo de software personalizado',
        cantidad: 1,
        precioUnitario: 2500.00,
        tipoIVA: 21,
        baseLinea: 2500.00,
        cuotaIVA: 525.00,
        cuotaRE: 0,
        totalLinea: 3025.00
      },
      {
        id: 18,
        descripcion: 'Consultoría técnica especializada',
        cantidad: 10,
        precioUnitario: 100.00,
        tipoIVA: 21,
        baseLinea: 1000.00,
        cuotaIVA: 210.00,
        cuotaRE: 0,
        totalLinea: 1210.00
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 3500.00,
          cuotaIVA: 735.00,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 3500.00,
      cuotaIVATotal: 735.00,
      cuotaRETotal: 0,
      totalFactura: 4235.00
    },
    
    formaPago: 'Tarjeta de crédito',
    medioPago: 'Visa **** 5678',
    fechaVencimiento: '2025-01-07',
    notas: 'Factura de prueba para testing de búsqueda avanzada',
    status: 'DRAFT',
    createdAt: '2024-12-08T10:00:00Z',
    updatedAt: '2024-12-08T10:00:00Z'
  }
]

// Mock service functions
export class MockInvoiceService {
  private static invoices: Invoice[] = [...mockInvoices]
  private static nextId = 9

  static async getInvoices(params: {
    page?: number
    limit?: number
    status?: string
    search?: string
    filters?: {
      fechaDesde?: string
      fechaHasta?: string
      importeMinimo?: string
      importeMaximo?: string
      formaPago?: string
      lugarEmision?: string
    }
    columnFilters?: {
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
  } = {}): Promise<{ invoices: Invoice[], pagination: any }> {
    const { page = 1, limit = 10, status, search, filters, columnFilters } = params
    
    let filteredInvoices = [...this.invoices]
    
    // Filter by status
    if (status && status !== 'ALL') {
      filteredInvoices = filteredInvoices.filter(invoice => invoice.status === status)
    }
    
    // Filter by search - search across all visible table fields
    if (search) {
      const searchLower = search.toLowerCase()
      filteredInvoices = filteredInvoices.filter(invoice => {
        // Número de factura (serie + número)
        const invoiceNumber = `${invoice.serie || ''}-${invoice.numero}`.toLowerCase()
        
        // Fecha de expedición
        const fechaExpedicion = new Date(invoice.fechaExpedicion).toLocaleDateString('es-ES').toLowerCase()
        
        // Cliente - NIF y nombre
        const clienteNIF = invoice.cliente.NIF?.toLowerCase() || ''
        const clienteNombre = invoice.cliente.nombreORazonSocial.toLowerCase()
        
        // Totales - base imponible, IVA, total
        const baseImponible = invoice.totales.baseImponibleTotal.toString()
        const cuotaIVA = invoice.totales.cuotaIVATotal.toString()
        const totalFactura = invoice.totales.totalFactura.toString()
        
        // Dirección del cliente
        const direccion = invoice.cliente.domicilio?.calle?.toLowerCase() || ''
        const poblacion = invoice.cliente.domicilio?.municipio?.toLowerCase() || ''
        const provincia = invoice.cliente.domicilio?.provincia?.toLowerCase() || ''
        const codigoPostal = invoice.cliente.domicilio?.codigoPostal?.toLowerCase() || ''
        
        // Forma de pago y medio de pago
        const formaPago = invoice.formaPago?.toLowerCase() || ''
        const medioPago = invoice.medioPago?.toLowerCase() || ''
        
        // Estado
        const estado = invoice.status.toLowerCase()
        
        // Tipo de factura
        const tipoFactura = invoice.tipoFactura.toLowerCase()
        
        // Emisor - NIF y nombre
        const emisorNIF = invoice.emisor.NIF?.toLowerCase() || ''
        const emisorNombre = invoice.emisor.nombreORazonSocial.toLowerCase()
        
        // Lugar de emisión
        const lugarEmision = invoice.lugarEmision?.toLowerCase() || ''
        
        // Notas
        const notas = invoice.notas?.toLowerCase() || ''
        
        // Líneas de factura - descripciones de productos/servicios
        const lineasDescripciones = invoice.lineas?.map(linea => linea.descripcion.toLowerCase()).join(' ') || ''
        
        return invoiceNumber.includes(searchLower) ||
               fechaExpedicion.includes(searchLower) ||
               clienteNIF.includes(searchLower) ||
               clienteNombre.includes(searchLower) ||
               baseImponible.includes(searchLower) ||
               cuotaIVA.includes(searchLower) ||
               totalFactura.includes(searchLower) ||
               direccion.includes(searchLower) ||
               poblacion.includes(searchLower) ||
               provincia.includes(searchLower) ||
               codigoPostal.includes(searchLower) ||
               formaPago.includes(searchLower) ||
               medioPago.includes(searchLower) ||
               estado.includes(searchLower) ||
               tipoFactura.includes(searchLower) ||
               emisorNIF.includes(searchLower) ||
               emisorNombre.includes(searchLower) ||
               lugarEmision.includes(searchLower) ||
               notas.includes(searchLower) ||
               lineasDescripciones.includes(searchLower)
      })
    }
    
    // Apply advanced filters
    if (filters) {
      filteredInvoices = filteredInvoices.filter(invoice => {
        // Filter by fecha desde
        if (filters.fechaDesde) {
          const invoiceDate = new Date(invoice.fechaExpedicion)
          const desdeDate = new Date(filters.fechaDesde)
          if (invoiceDate < desdeDate) {
            return false
          }
        }
        
        // Filter by fecha hasta
        if (filters.fechaHasta) {
          const invoiceDate = new Date(invoice.fechaExpedicion)
          const hastaDate = new Date(filters.fechaHasta)
          if (invoiceDate > hastaDate) {
            return false
          }
        }
        
        // Filter by importe mínimo
        if (filters.importeMinimo) {
          const minImporte = parseFloat(filters.importeMinimo)
          if (invoice.totales.totalFactura < minImporte) {
            return false
          }
        }
        
        // Filter by importe máximo
        if (filters.importeMaximo) {
          const maxImporte = parseFloat(filters.importeMaximo)
          if (invoice.totales.totalFactura > maxImporte) {
            return false
          }
        }
        
        // Filter by forma de pago
        if (filters.formaPago && invoice.formaPago !== filters.formaPago) {
          return false
        }
        
        // Filter by lugar de emisión
        if (filters.lugarEmision) {
          const lugarEmision = invoice.lugarEmision?.toLowerCase() || ''
          if (!lugarEmision.includes(filters.lugarEmision.toLowerCase())) {
            return false
          }
        }
        
        return true
      })
    }
    
    // Apply column filters
    if (columnFilters) {
      filteredInvoices = filteredInvoices.filter(invoice => {
        // Filter by factura (invoice number/type)
        if (columnFilters.factura) {
          const invoiceNumber = `${invoice.serie || ''}-${invoice.numero} (${invoice.tipoFactura})`.toLowerCase()
          if (!invoiceNumber.includes(columnFilters.factura.toLowerCase())) {
            return false
          }
        }
        
        // Filter by fecha (date)
        if (columnFilters.fecha) {
          const fechaExpedicion = new Date(invoice.fechaExpedicion).toLocaleDateString('es-ES').toLowerCase()
          if (!fechaExpedicion.includes(columnFilters.fecha.toLowerCase())) {
            return false
          }
        }
        
        // Filter by NIF
        if (columnFilters.nif) {
          const nif = invoice.cliente.NIF?.toLowerCase() || ''
          if (!nif.includes(columnFilters.nif.toLowerCase())) {
            return false
          }
        }
        
        // Filter by cliente (client name)
        if (columnFilters.cliente) {
          const clienteNombre = invoice.cliente.nombreORazonSocial.toLowerCase()
          if (!clienteNombre.includes(columnFilters.cliente.toLowerCase())) {
            return false
          }
        }
        
        // Filter by base imponible
        if (columnFilters.baseImponible) {
          const baseImponible = invoice.totales.baseImponibleTotal.toString()
          if (!baseImponible.includes(columnFilters.baseImponible)) {
            return false
          }
        }
        
        // Filter by IVA
        if (columnFilters.iva) {
          const cuotaIVA = invoice.totales.cuotaIVATotal.toString()
          if (!cuotaIVA.includes(columnFilters.iva)) {
            return false
          }
        }
        
        // Filter by total
        if (columnFilters.total) {
          const totalFactura = invoice.totales.totalFactura.toString()
          if (!totalFactura.includes(columnFilters.total)) {
            return false
          }
        }
        
        // Filter by dirección
        if (columnFilters.direccion) {
          const direccion = invoice.cliente.domicilio?.calle?.toLowerCase() || ''
          if (!direccion.includes(columnFilters.direccion.toLowerCase())) {
            return false
          }
        }
        
        // Filter by población
        if (columnFilters.poblacion) {
          const poblacion = invoice.cliente.domicilio?.municipio?.toLowerCase() || ''
          if (!poblacion.includes(columnFilters.poblacion.toLowerCase())) {
            return false
          }
        }
        
        // Filter by provincia
        if (columnFilters.provincia) {
          const provincia = invoice.cliente.domicilio?.provincia?.toLowerCase() || ''
          if (!provincia.includes(columnFilters.provincia.toLowerCase())) {
            return false
          }
        }
        
        // Filter by código postal
        if (columnFilters.codigoPostal) {
          const codigoPostal = invoice.cliente.domicilio?.codigoPostal?.toLowerCase() || ''
          if (!codigoPostal.includes(columnFilters.codigoPostal.toLowerCase())) {
            return false
          }
        }
        
        // Filter by forma de pago
        if (columnFilters.formaPago) {
          const formaPago = invoice.formaPago?.toLowerCase() || ''
          if (!formaPago.includes(columnFilters.formaPago.toLowerCase())) {
            return false
          }
        }
        
        // Filter by medio de pago
        if (columnFilters.medioPago) {
          const medioPago = invoice.medioPago?.toLowerCase() || ''
          if (!medioPago.includes(columnFilters.medioPago.toLowerCase())) {
            return false
          }
        }
        
        // Filter by estado
        if (columnFilters.estado) {
          const estado = invoice.status.toLowerCase()
          if (!estado.includes(columnFilters.estado.toLowerCase())) {
            return false
          }
        }
        
        return true
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
    
    // For different types, use appropriate prefixes
    let numero = nextNumber
    if (tipoFactura === 'rectificativa') {
      numero = `R${nextNumber}`
    } else if (tipoFactura === 'emitida') {
      numero = `E${nextNumber}`
    } else if (tipoFactura === 'recibida') {
      numero = `R${nextNumber}`
    }
    
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
