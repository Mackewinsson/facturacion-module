// Mock data for the facturación module - Spanish AEAT compliant

export type TipoFactura = 'ordinaria' | 'simplificada' | 'rectificativa' | 'emitida' | 'recibida'
export type TipoCliente = 'particular' | 'empresario/profesional'
export type TipoEntidad = 'cliente' | 'proveedor' | 'vendedor'
export type TipoIVA = 0 | 4 | 10 | 21
export type MotivoExencion = 'art20.1.26' | 'art20.1.27' | 'art20.1.28' | 'art25' | 'exportacion' | 'otro'
export type CausaRectificacion = 'error' | 'devolucion' | 'descuento' | 'otro'

export interface Domicilio {
  calle: string
  codigoPostal: string
  municipio: string
  provincia: string
  pais: string
  calleVia?: string // Calle/Via dropdown value
  nombreCalle?: string // Street name
  numero?: string // Street number
  numeroExtension?: string // Street number extension (e.g., "3A")
  centro?: string // Centro/center name (e.g., "PRINCIPAL")
}

export interface Direccion {
  id: number
  centro: string
  direccion: string
  telefono: string
  telefonoMovil: string
  email: string
}

export interface Emisor {
  nombreORazonSocial: string
  NIF: string
  domicilio: Domicilio
}

export interface Entidad {
  id: number
  // Entity Identification
  NIF: string
  razonSocial: string
  nombreComercial?: string
  
  // Persona Fisica fields
  nombre?: string // First name
  apellido1?: string // First surname
  apellido2?: string // Second surname
  sexo?: 'hombre' | 'mujer' // Gender
  
  // Dates
  fechaAlta: string
  fechaBaja?: string
  
  // Type and Classification
  personaFisica: boolean
  tipoIdentificador: 'NIF/CIF-IVA' | 'NIE' | 'PASAPORTE' | 'OTRO'
  paisOrigen: string
  extranjero: boolean
  operadorIntracomunitario: boolean
  importacionExportacion: boolean
  regimenCanario: boolean
  
  // Entity Relationships (checkboxes)
  proveedor: boolean
  cliente: boolean
  vendedor: boolean
  operarioTaller: boolean
  aseguradora: boolean
  financiera: boolean
  agenciaTransporte: boolean
  banco: boolean
  rentacar: boolean
  
  // Currency and Additional Info
  monedaEntidad: string
  
  // Contact Information
  telefono?: string
  telefonoMovil?: string // Mobile phone
  email?: string
  domicilio?: Domicilio
  direcciones?: Direccion[]
  
  // Legacy fields for compatibility
  tipoEntidad: TipoEntidad
  tipo: TipoCliente
  nombreORazonSocial: string
  pais: string
  createdAt: string
  updatedAt: string
  
  // Modification tracking
  modificadoPor?: string // Nombre del usuario que modificó
  fechaModificacion?: string // Fecha y hora de modificación (FEMENT)
  
  // Payment information (for clients)
  formaPago?: string // Forma de pago del cliente (desde FCL.FPAFCL -> CFP.NOMCFP)
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
  fechaContable?: string
  lugarEmision?: string
  departamento?: string
  
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
  
  // Estado de la factura
  estado?: 'borrador' | 'enviada' | 'aceptada' | 'rechazada'
  
  // Campos adicionales del formulario
  imputacion?: string
  mantenimientoCliente?: string
  exportacionImportacion?: boolean
  ctaIngreso?: string
  aplicarRetencion?: boolean
  ctaRetencion?: string
  baseRetencion?: number
  porcentajeRetencion?: number
  importeRetencion?: number
  ctaGastosAsoc1?: string
  importeGastosAsoc1?: number
  ctaGastosAsoc2?: string
  importeGastosAsoc2?: number
  
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
    tipoFactura: 'emitida',
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
    tipoFactura: 'emitida',
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
    tipoFactura: 'emitida',
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
    tipoFactura: 'emitida',
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
    tipoFactura: 'emitida',
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
    tipoFactura: 'emitida',
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
  },
  {
    id: 9,
    tipoFactura: 'emitida',
    serie: '2024-B',
    numero: '00001',
    fechaExpedicion: '2024-12-10',
    lugarEmision: 'Barcelona',
    
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
      nombreORazonSocial: 'María González López',
      NIF: '87654321B',
      domicilio: {
        calle: 'Avenida Diagonal 456',
        codigoPostal: '08008',
        municipio: 'Barcelona',
        provincia: 'Barcelona',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Mantenimiento preventivo completo',
        cantidad: 1,
        precioUnitario: 320.00,
        tipoIVA: 21,
        baseLinea: 320.00,
        cuotaIVA: 67.20,
        cuotaRE: 0,
        totalLinea: 387.20
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 320.00,
          cuotaIVA: 67.20,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 320.00,
      cuotaIVATotal: 67.20,
      cuotaRETotal: 0,
      totalFactura: 387.20
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES34 5678 9012 3456 7890 1234',
    fechaVencimiento: '2025-01-10',
    notas: 'Mantenimiento programado',
    status: 'PAID',
    createdAt: '2024-12-10T09:15:00Z',
    updatedAt: '2024-12-10T09:15:00Z'
  },
  {
    id: 10,
    tipoFactura: 'emitida',
    numero: '00003',
    fechaExpedicion: '2024-12-12',
    
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
      nombreORazonSocial: 'Carlos Ruiz Martín',
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Cambio de neumáticos',
        cantidad: 4,
        precioUnitario: 85.00,
        tipoIVA: 21,
        baseLinea: 340.00,
        cuotaIVA: 71.40,
        cuotaRE: 0,
        totalLinea: 411.40
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 340.00,
          cuotaIVA: 71.40,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 340.00,
      cuotaIVATotal: 71.40,
      cuotaRETotal: 0,
      totalFactura: 411.40
    },
    
    formaPago: 'Efectivo',
    medioPago: 'Pago en efectivo',
    fechaVencimiento: '2024-12-12',
    notas: 'Cambio de neumáticos de invierno',
    status: 'SENT',
    createdAt: '2024-12-12T14:30:00Z',
    updatedAt: '2024-12-12T14:30:00Z'
  },
  {
    id: 11,
    tipoFactura: 'emitida',
    serie: '2024-A',
    numero: '00005',
    fechaExpedicion: '2024-12-14',
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
      nombreORazonSocial: 'Ana Fernández Silva',
      NIF: '11223344C',
      domicilio: {
        calle: 'Calle Gran Vía 789',
        codigoPostal: '28013',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Reparación de transmisión',
        cantidad: 1,
        precioUnitario: 1200.00,
        tipoIVA: 21,
        baseLinea: 1200.00,
        cuotaIVA: 252.00,
        cuotaRE: 0,
        totalLinea: 1452.00
      },
      {
        id: 2,
        descripcion: 'Mano de obra especializada',
        cantidad: 8,
        precioUnitario: 45.00,
        tipoIVA: 21,
        baseLinea: 360.00,
        cuotaIVA: 75.60,
        cuotaRE: 0,
        totalLinea: 435.60
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 1560.00,
          cuotaIVA: 327.60,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 1560.00,
      cuotaIVATotal: 327.60,
      cuotaRETotal: 0,
      totalFactura: 1887.60
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES56 7890 1234 5678 9012 3456',
    fechaVencimiento: '2025-01-14',
    notas: 'Reparación compleja de transmisión automática',
    status: 'OVERDUE',
    createdAt: '2024-12-14T11:45:00Z',
    updatedAt: '2024-12-14T11:45:00Z'
  },
  {
    id: 12,
    tipoFactura: 'emitida',
    numero: '00004',
    fechaExpedicion: '2024-12-16',
    
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
      nombreORazonSocial: 'Roberto Jiménez Vega',
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Limpieza de inyectores',
        cantidad: 1,
        precioUnitario: 120.00,
        tipoIVA: 21,
        baseLinea: 120.00,
        cuotaIVA: 25.20,
        cuotaRE: 0,
        totalLinea: 145.20
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 120.00,
          cuotaIVA: 25.20,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 120.00,
      cuotaIVATotal: 25.20,
      cuotaRETotal: 0,
      totalFactura: 145.20
    },
    
    formaPago: 'Efectivo',
    medioPago: 'Pago en efectivo',
    fechaVencimiento: '2024-12-16',
    notas: 'Servicio rápido de limpieza',
    status: 'PAID',
    createdAt: '2024-12-16T16:20:00Z',
    updatedAt: '2024-12-16T16:20:00Z'
  },
  {
    id: 13,
    tipoFactura: 'emitida',
    serie: '2024-B',
    numero: '00002',
    fechaExpedicion: '2024-12-18',
    lugarEmision: 'Valencia',
    
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
      nombreORazonSocial: 'Luis Martínez Torres',
      NIF: '99887766D',
      domicilio: {
        calle: 'Calle Colón 321',
        codigoPostal: '46004',
        municipio: 'Valencia',
        provincia: 'Valencia',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Revisión ITV y preparación',
        cantidad: 1,
        precioUnitario: 180.00,
        tipoIVA: 21,
        baseLinea: 180.00,
        cuotaIVA: 37.80,
        cuotaRE: 0,
        totalLinea: 217.80
      },
      {
        id: 2,
        descripcion: 'Ajuste de faros',
        cantidad: 1,
        precioUnitario: 35.00,
        tipoIVA: 21,
        baseLinea: 35.00,
        cuotaIVA: 7.35,
        cuotaRE: 0,
        totalLinea: 42.35
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 215.00,
          cuotaIVA: 45.15,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 215.00,
      cuotaIVATotal: 45.15,
      cuotaRETotal: 0,
      totalFactura: 260.15
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES78 9012 3456 7890 1234 5678',
    fechaVencimiento: '2025-01-18',
    notas: 'Preparación para ITV',
    status: 'SENT',
    createdAt: '2024-12-18T10:30:00Z',
    updatedAt: '2024-12-18T10:30:00Z'
  },
  {
    id: 14,
    tipoFactura: 'emitida',
    numero: '00005',
    fechaExpedicion: '2024-12-20',
    
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
      nombreORazonSocial: 'Isabel Moreno Castro',
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Cambio de batería',
        cantidad: 1,
        precioUnitario: 95.00,
        tipoIVA: 21,
        baseLinea: 95.00,
        cuotaIVA: 19.95,
        cuotaRE: 0,
        totalLinea: 114.95
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 95.00,
          cuotaIVA: 19.95,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 95.00,
      cuotaIVATotal: 19.95,
      cuotaRETotal: 0,
      totalFactura: 114.95
    },
    
    formaPago: 'Efectivo',
    medioPago: 'Pago en efectivo',
    fechaVencimiento: '2024-12-20',
    notas: 'Batería nueva con garantía',
    status: 'PAID',
    createdAt: '2024-12-20T13:15:00Z',
    updatedAt: '2024-12-20T13:15:00Z'
  },
  {
    id: 15,
    tipoFactura: 'emitida',
    serie: '2024-A',
    numero: '00006',
    fechaExpedicion: '2024-12-22',
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
      nombreORazonSocial: 'Pedro Sánchez Ruiz',
      NIF: '55443322E',
      domicilio: {
        calle: 'Calle Alcalá 654',
        codigoPostal: '28009',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Reparación de climatización',
        cantidad: 1,
        precioUnitario: 280.00,
        tipoIVA: 21,
        baseLinea: 280.00,
        cuotaIVA: 58.80,
        cuotaRE: 0,
        totalLinea: 338.80
      },
      {
        id: 2,
        descripcion: 'Recarga de gas refrigerante',
        cantidad: 1,
        precioUnitario: 85.00,
        tipoIVA: 21,
        baseLinea: 85.00,
        cuotaIVA: 17.85,
        cuotaRE: 0,
        totalLinea: 102.85
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 365.00,
          cuotaIVA: 76.65,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 365.00,
      cuotaIVATotal: 76.65,
      cuotaRETotal: 0,
      totalFactura: 441.65
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES90 1234 5678 9012 3456 7890',
    fechaVencimiento: '2025-01-22',
    notas: 'Reparación sistema climatización',
    status: 'DRAFT',
    createdAt: '2024-12-22T15:45:00Z',
    updatedAt: '2024-12-22T15:45:00Z'
  },
  {
    id: 16,
    tipoFactura: 'emitida',
    numero: '00006',
    fechaExpedicion: '2024-12-24',
    
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
      nombreORazonSocial: 'Carmen López Díaz',
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Cambio de aceite y filtro',
        cantidad: 1,
        precioUnitario: 65.00,
        tipoIVA: 21,
        baseLinea: 65.00,
        cuotaIVA: 13.65,
        cuotaRE: 0,
        totalLinea: 78.65
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 65.00,
          cuotaIVA: 13.65,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 65.00,
      cuotaIVATotal: 13.65,
      cuotaRETotal: 0,
      totalFactura: 78.65
    },
    
    formaPago: 'Efectivo',
    medioPago: 'Pago en efectivo',
    fechaVencimiento: '2024-12-24',
    notas: 'Mantenimiento básico',
    status: 'PAID',
    createdAt: '2024-12-24T11:30:00Z',
    updatedAt: '2024-12-24T11:30:00Z'
  },
  {
    id: 17,
    tipoFactura: 'emitida',
    serie: '2024-B',
    numero: '00003',
    fechaExpedicion: '2024-12-26',
    lugarEmision: 'Sevilla',
    
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
      nombreORazonSocial: 'Francisco Herrera Morales',
      NIF: '77665544F',
      domicilio: {
        calle: 'Calle Sierpes 123',
        codigoPostal: '41004',
        municipio: 'Sevilla',
        provincia: 'Sevilla',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Reparación de dirección asistida',
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
        descripcion: 'Mano de obra',
        cantidad: 6,
        precioUnitario: 50.00,
        tipoIVA: 21,
        baseLinea: 300.00,
        cuotaIVA: 63.00,
        cuotaRE: 0,
        totalLinea: 363.00
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 750.00,
          cuotaIVA: 157.50,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 750.00,
      cuotaIVATotal: 157.50,
      cuotaRETotal: 0,
      totalFactura: 907.50
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES12 3456 7890 1234 5678 9012',
    fechaVencimiento: '2025-01-26',
    notas: 'Reparación sistema dirección',
    status: 'SENT',
    createdAt: '2024-12-26T09:20:00Z',
    updatedAt: '2024-12-26T09:20:00Z'
  },
  {
    id: 18,
    tipoFactura: 'emitida',
    numero: '00007',
    fechaExpedicion: '2024-12-28',
    
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
      nombreORazonSocial: 'Antonio Vega Ramos',
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Revisión pre-viaje',
        cantidad: 1,
        precioUnitario: 45.00,
        tipoIVA: 21,
        baseLinea: 45.00,
        cuotaIVA: 9.45,
        cuotaRE: 0,
        totalLinea: 54.45
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 45.00,
          cuotaIVA: 9.45,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 45.00,
      cuotaIVATotal: 9.45,
      cuotaRETotal: 0,
      totalFactura: 54.45
    },
    
    formaPago: 'Efectivo',
    medioPago: 'Pago en efectivo',
    fechaVencimiento: '2024-12-28',
    notas: 'Revisión rápida pre-viaje',
    status: 'PAID',
    createdAt: '2024-12-28T14:10:00Z',
    updatedAt: '2024-12-28T14:10:00Z'
  },
  {
    id: 19,
    tipoFactura: 'emitida',
    serie: '2024-A',
    numero: '00007',
    fechaExpedicion: '2024-12-30',
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
      nombreORazonSocial: 'Elena Rodríguez Pérez',
      NIF: '33445566G',
      domicilio: {
        calle: 'Calle Serrano 987',
        codigoPostal: '28006',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Reparación de embrague',
        cantidad: 1,
        precioUnitario: 850.00,
        tipoIVA: 21,
        baseLinea: 850.00,
        cuotaIVA: 178.50,
        cuotaRE: 0,
        totalLinea: 1028.50
      },
      {
        id: 2,
        descripcion: 'Mano de obra especializada',
        cantidad: 12,
        precioUnitario: 55.00,
        tipoIVA: 21,
        baseLinea: 660.00,
        cuotaIVA: 138.60,
        cuotaRE: 0,
        totalLinea: 798.60
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 1510.00,
          cuotaIVA: 317.10,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 1510.00,
      cuotaIVATotal: 317.10,
      cuotaRETotal: 0,
      totalFactura: 1827.10
    },
    
    formaPago: 'Transferencia bancaria',
    medioPago: 'IBAN: ES34 5678 9012 3456 7890 1234',
    fechaVencimiento: '2025-01-30',
    notas: 'Reparación completa de embrague',
    status: 'DRAFT',
    createdAt: '2024-12-30T12:00:00Z',
    updatedAt: '2024-12-30T12:00:00Z'
  },
  {
    id: 20,
    tipoFactura: 'emitida',
    numero: '00008',
    fechaExpedicion: '2025-01-02',
    
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
      nombreORazonSocial: 'Miguel Torres Sánchez',
      pais: 'España'
    },
    
    lineas: [
      {
        id: 1,
        descripcion: 'Cambio de pastillas de freno',
        cantidad: 1,
        precioUnitario: 75.00,
        tipoIVA: 21,
        baseLinea: 75.00,
        cuotaIVA: 15.75,
        cuotaRE: 0,
        totalLinea: 90.75
      }
    ],
    
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 75.00,
          cuotaIVA: 15.75,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 75.00,
      cuotaIVATotal: 15.75,
      cuotaRETotal: 0,
      totalFactura: 90.75
    },
    
    formaPago: 'Efectivo',
    medioPago: 'Pago en efectivo',
    fechaVencimiento: '2025-01-02',
    notas: 'Cambio de pastillas delanteras',
    status: 'PAID',
    createdAt: '2025-01-02T10:45:00Z',
    updatedAt: '2025-01-02T10:45:00Z'
  },
  // More issued invoices
  {
    id: 21,
    tipoFactura: 'emitida',
    serie: '2025-A',
    numero: '00021',
    fechaExpedicion: '2025-01-10',
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
      }
    },
    cliente: {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'María López Ruiz',
      NIF: '87654321B',
      domicilio: {
        calle: 'Avenida de la Paz 67',
        codigoPostal: '28028',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    lineas: [
      {
        id: 1,
        descripcion: 'Mantenimiento completo - 20.000 km',
        cantidad: 1,
        precioUnitario: 350.00,
        tipoIVA: 21,
        baseLinea: 350.00,
        cuotaIVA: 73.50,
        cuotaRE: 0,
        totalLinea: 423.50
      }
    ],
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 350.00,
          cuotaIVA: 73.50,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 350.00,
      cuotaIVATotal: 73.50,
      cuotaRETotal: 0,
      totalFactura: 423.50
    },
    formaPago: 'Contado',
    medioPago: 'Efectivo',
    fechaVencimiento: '2025-01-10',
    notas: 'Mantenimiento programado',
    status: 'PAID',
    createdAt: '2025-01-10T09:15:00Z',
    updatedAt: '2025-01-10T09:15:00Z'
  },
  {
    id: 22,
    tipoFactura: 'emitida',
    serie: '2025-A',
    numero: '00022',
    fechaExpedicion: '2025-01-12',
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
      }
    },
    cliente: {
      tipo: 'particular',
      nombreORazonSocial: 'Carlos Martín Sánchez',
      NIF: '11223344C',
      domicilio: {
        calle: 'Calle del Sol 89',
        codigoPostal: '28015',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    lineas: [
      {
        id: 1,
        descripcion: 'Reparación de embrague',
        cantidad: 1,
        precioUnitario: 800.00,
        tipoIVA: 21,
        baseLinea: 800.00,
        cuotaIVA: 168.00,
        cuotaRE: 0,
        totalLinea: 968.00
      }
    ],
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 800.00,
          cuotaIVA: 168.00,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 800.00,
      cuotaIVATotal: 168.00,
      cuotaRETotal: 0,
      totalFactura: 968.00
    },
    formaPago: 'Crédito 30 días',
    medioPago: 'Transferencia bancaria',
    fechaVencimiento: '2025-02-11',
    notas: 'Reparación mayor de embrague',
    status: 'SENT',
    createdAt: '2025-01-12T14:30:00Z',
    updatedAt: '2025-01-12T14:30:00Z'
  },
  // Received invoices
  {
    id: 23,
    tipoFactura: 'recibida',
    serie: 'FAC-2025',
    numero: '00001',
    fechaExpedicion: '2025-01-08',
    lugarEmision: 'Barcelona',
    emisor: {
      nombreORazonSocial: 'CIAL. NAVARRO HERMANOS, S.A.',
      NIF: 'A12345678',
      domicilio: {
        calle: 'Calle de la Industria 12',
        codigoPostal: '08001',
        municipio: 'Barcelona',
        provincia: 'Barcelona',
        pais: 'España'
      }
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
        id: 1,
        descripcion: 'Repuestos para motocicletas - Filtros de aceite',
        cantidad: 50,
        precioUnitario: 12.50,
        tipoIVA: 21,
        baseLinea: 625.00,
        cuotaIVA: 131.25,
        cuotaRE: 0,
        totalLinea: 756.25
      }
    ],
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 625.00,
          cuotaIVA: 131.25,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 625.00,
      cuotaIVATotal: 131.25,
      cuotaRETotal: 0,
      totalFactura: 756.25
    },
    formaPago: 'Crédito 30 días',
    medioPago: 'Transferencia bancaria',
    fechaVencimiento: '2025-02-07',
    notas: 'Compra de repuestos para stock',
    ctaIngreso: '6000 000 0000',
    imputacion: 'Compra de mercaderías',
    departamento: 'Administración',
    status: 'DRAFT',
    createdAt: '2025-01-08T11:20:00Z',
    updatedAt: '2025-01-08T11:20:00Z'
  },
  {
    id: 24,
    tipoFactura: 'recibida',
    serie: 'FAC-2025',
    numero: '00002',
    fechaExpedicion: '2025-01-09',
    lugarEmision: 'Valencia',
    emisor: {
      nombreORazonSocial: 'HERRAMIENTAS TÉCNICAS VALENCIA, S.L.',
      NIF: 'B87654321',
      domicilio: {
        calle: 'Polígono Industrial Norte 45',
        codigoPostal: '46015',
        municipio: 'Valencia',
        provincia: 'Valencia',
        pais: 'España'
      }
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
        id: 1,
        descripcion: 'Herramientas especializadas - Juego de llaves torx',
        cantidad: 1,
        precioUnitario: 180.00,
        tipoIVA: 21,
        baseLinea: 180.00,
        cuotaIVA: 37.80,
        cuotaRE: 0,
        totalLinea: 217.80
      },
      {
        id: 2,
        descripcion: 'Herramientas especializadas - Destornilladores de precisión',
        cantidad: 1,
        precioUnitario: 95.00,
        tipoIVA: 21,
        baseLinea: 95.00,
        cuotaIVA: 19.95,
        cuotaRE: 0,
        totalLinea: 114.95
      }
    ],
    totales: {
      basesPorTipo: [
        {
          tipoIVA: 21,
          base: 275.00,
          cuotaIVA: 57.75,
          recargoEquivalencia: 0
        }
      ],
      baseImponibleTotal: 275.00,
      cuotaIVATotal: 57.75,
      cuotaRETotal: 0,
      totalFactura: 332.75
    },
    formaPago: 'Contado',
    medioPago: 'Transferencia bancaria',
    fechaVencimiento: '2025-01-09',
    notas: 'Compra de herramientas para taller',
    ctaIngreso: '6000 000 0000',
    imputacion: 'Compra de herramientas',
    departamento: 'Administración',
    status: 'PAID',
    createdAt: '2025-01-09T16:45:00Z',
    updatedAt: '2025-01-09T16:45:00Z'
  },
  {
    id: 25,
    tipoFactura: 'recibida',
    serie: 'FAC-2025',
    numero: '00003',
    fechaExpedicion: '2025-01-11',
    lugarEmision: 'Sevilla',
    emisor: {
      nombreORazonSocial: 'SERVICIOS INFORMÁTICOS ANDALUCÍA, S.L.',
      NIF: 'A98765432',
      domicilio: {
        calle: 'Calle de la Tecnología 78',
        codigoPostal: '41001',
        municipio: 'Sevilla',
        provincia: 'Sevilla',
        pais: 'España'
      }
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
        id: 1,
        descripcion: 'Mantenimiento de software de gestión',
        cantidad: 1,
        precioUnitario: 300.00,
        tipoIVA: 21,
        baseLinea: 300.00,
        cuotaIVA: 63.00,
        cuotaRE: 0,
        totalLinea: 363.00
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
    formaPago: 'Crédito 15 días',
    medioPago: 'Transferencia bancaria',
    fechaVencimiento: '2025-01-26',
    notas: 'Mantenimiento mensual del software',
    ctaIngreso: '6000 000 0000',
    imputacion: 'Servicios informáticos',
    departamento: 'Administración',
    status: 'SENT',
    createdAt: '2025-01-11T10:15:00Z',
    updatedAt: '2025-01-11T10:15:00Z'
  }
]

// Mock service functions
export class MockInvoiceService {
  private static invoices: Invoice[] = [...mockInvoices]
  private static nextId = 26

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

// Mock entity data - Clientes, Proveedores, Vendedores
export const mockEntities: Entidad[] = [
  {
    id: 1,
    // Entity Identification
    NIF: 'B10563393',
    razonSocial: '911 GARAJE, S.L.',
    nombreComercial: '911 Garaje',
    
    // Dates
    fechaAlta: '2024-01-15',
    fechaBaja: undefined,
    
    // Type and Classification
    personaFisica: false,
    tipoIdentificador: 'NIF/CIF-IVA',
    paisOrigen: 'ESPAÑA',
    extranjero: false,
    operadorIntracomunitario: false,
    importacionExportacion: false,
    regimenCanario: false,
    
    // Entity Relationships
    proveedor: false,
    cliente: true,
    vendedor: false,
    operarioTaller: false,
    aseguradora: false,
    financiera: false,
    agenciaTransporte: false,
    banco: false,
    rentacar: false,
    
    // Currency and Additional Info
    monedaEntidad: 'Eur',
    
    // Contact Information
    telefono: '952721339',
    email: 'info@911garaje.com',
    domicilio: {
      calle: 'Calle Mayor 15',
      codigoPostal: '29001',
      municipio: 'Málaga',
      provincia: 'Málaga',
      pais: 'España'
    },
    direcciones: [
      {
        id: 1,
        centro: 'PRINCIPAL',
        direccion: 'Calle Mayor 15, 29001 Málaga',
        telefono: '952721339',
        telefonoMovil: '666123456',
        email: 'info@911garaje.com'
      },
      {
        id: 2,
        centro: 'SUCURSAL',
        direccion: 'Avenida Andalucía 25, 29006 Málaga',
        telefono: '952722340',
        telefonoMovil: '666123457',
        email: 'sucursal@911garaje.com'
      }
    ],
    
    // Legacy fields for compatibility
    tipoEntidad: 'cliente',
    tipo: 'empresario/profesional',
    nombreORazonSocial: '911 GARAJE, S.L.',
    pais: 'España',
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  },
  {
    id: 2,
    // Entity Identification
    NIF: 'A08371346',
    razonSocial: 'ACCORINVEST SPAIN S.A',
    nombreComercial: 'Accorinvest',
    
    // Dates
    fechaAlta: '2024-01-20',
    fechaBaja: undefined,
    
    // Type and Classification
    personaFisica: false,
    tipoIdentificador: 'NIF/CIF-IVA',
    paisOrigen: 'ESPAÑA',
    extranjero: false,
    operadorIntracomunitario: false,
    importacionExportacion: false,
    regimenCanario: false,
    
    // Entity Relationships
    proveedor: true,
    cliente: false,
    vendedor: false,
    operarioTaller: false,
    aseguradora: false,
    financiera: false,
    agenciaTransporte: false,
    banco: false,
    rentacar: false,
    
    // Currency and Additional Info
    monedaEntidad: 'Eur',
    
    // Contact Information
    telefono: '944433310',
    email: 'contacto@accorinvest.es',
    domicilio: {
      calle: 'Avenida de la Paz 42',
      codigoPostal: '48015',
      municipio: 'Bilbao',
      provincia: 'Vizcaya',
      pais: 'España'
    },
    
    // Legacy fields for compatibility
    tipoEntidad: 'proveedor',
    tipo: 'empresario/profesional',
    nombreORazonSocial: 'ACCORINVEST SPAIN S.A',
    pais: 'España',
    createdAt: '2024-01-20T14:30:00Z',
    updatedAt: '2024-01-20T14:30:00Z'
  },
  {
    id: 3,
    // Entity Identification
    NIF: 'B92686831',
    razonSocial: 'ACROID CONSULTORES.S.L.',
    nombreComercial: 'Acroid Consultores',
    
    // Dates
    fechaAlta: '2024-02-01',
    fechaBaja: undefined,
    
    // Type and Classification
    personaFisica: false,
    tipoIdentificador: 'NIF/CIF-IVA',
    paisOrigen: 'ESPAÑA',
    extranjero: false,
    operadorIntracomunitario: false,
    importacionExportacion: false,
    regimenCanario: false,
    
    // Entity Relationships
    proveedor: false,
    cliente: false,
    vendedor: true,
    operarioTaller: false,
    aseguradora: false,
    financiera: false,
    agenciaTransporte: false,
    banco: false,
    rentacar: false,
    
    // Currency and Additional Info
    monedaEntidad: 'Eur',
    
    // Contact Information
    telefono: '951382866',
    email: 'ventas@acroid.com',
    domicilio: {
      calle: 'Plaza de España 8',
      codigoPostal: '41013',
      municipio: 'Sevilla',
      provincia: 'Sevilla',
      pais: 'España'
    },
    
    // Legacy fields for compatibility
    tipoEntidad: 'vendedor',
    tipo: 'particular',
    nombreORazonSocial: 'ACROID CONSULTORES.S.L.',
    pais: 'España',
    createdAt: '2024-02-01T09:15:00Z',
    updatedAt: '2024-02-01T09:15:00Z'
  },
  {
    id: 4,
    // Entity Identification
    NIF: 'A61441523',
    razonSocial: 'AGENCIA SERVICIOS MENSAJERIA, S.A.U.',
    nombreComercial: 'ASM Paquetería-Transporte',
    
    // Dates
    fechaAlta: '2024-02-10',
    fechaBaja: undefined,
    
    // Type and Classification
    personaFisica: false,
    tipoIdentificador: 'NIF/CIF-IVA',
    paisOrigen: 'ESPAÑA',
    extranjero: false,
    operadorIntracomunitario: false,
    importacionExportacion: false,
    regimenCanario: false,
    
    // Entity Relationships
    proveedor: false,
    cliente: true,
    vendedor: false,
    operarioTaller: false,
    aseguradora: false,
    financiera: false,
    agenciaTransporte: true,
    banco: false,
    rentacar: false,
    
    // Currency and Additional Info
    monedaEntidad: 'Eur',
    
    // Contact Information
    telefono: '902113300',
    email: 'clientes@asm.es',
    domicilio: {
      calle: 'Polígono Industrial Norte',
      codigoPostal: '28050',
      municipio: 'Madrid',
      provincia: 'Madrid',
      pais: 'España'
    },
    
    // Legacy fields for compatibility
    tipoEntidad: 'cliente',
    tipo: 'empresario/profesional',
    nombreORazonSocial: 'AGENCIA SERVICIOS MENSAJERIA, S.A.U., (ASM PAQUETERIA-TRANSPORTE)',
    pais: 'España',
    createdAt: '2024-02-10T11:45:00Z',
    updatedAt: '2024-02-10T11:45:00Z'
  },
  {
    id: 5,
    // Entity Identification
    NIF: 'B50141365',
    razonSocial: 'AGRIMOTO, S.L.',
    nombreComercial: 'Yamaha Agrimoto',
    
    // Dates
    fechaAlta: '2024-02-15',
    fechaBaja: undefined,
    
    // Type and Classification
    personaFisica: false,
    tipoIdentificador: 'NIF/CIF-IVA',
    paisOrigen: 'ESPAÑA',
    extranjero: false,
    operadorIntracomunitario: false,
    importacionExportacion: false,
    regimenCanario: false,
    
    // Entity Relationships
    proveedor: true,
    cliente: false,
    vendedor: false,
    operarioTaller: false,
    aseguradora: false,
    financiera: false,
    agenciaTransporte: false,
    banco: false,
    rentacar: false,
    
    // Currency and Additional Info
    monedaEntidad: 'Eur',
    
    // Contact Information
    telefono: '976274109',
    email: 'info@agrimoto.com',
    domicilio: {
      calle: 'Carretera Nacional 232',
      codigoPostal: '50012',
      municipio: 'Zaragoza',
      provincia: 'Zaragoza',
      pais: 'España'
    },
    
    // Legacy fields for compatibility
    tipoEntidad: 'proveedor',
    tipo: 'empresario/profesional',
    nombreORazonSocial: 'AGRIMOTO, S.L., (YAMAHA)',
    pais: 'España',
    createdAt: '2024-02-15T16:20:00Z',
    updatedAt: '2024-02-15T16:20:00Z'
  }
]

// Mock Entity Service
export class MockEntityService {
  private static nextId = 11
  private static entities = [...mockEntities]

  static async getEntities(filters: {
    page?: number
    limit?: number
    columnFilters?: Record<string, string>
    tipoEntidadFilter?: 'ALL' | 'cliente' | 'proveedor' | 'vendedor'
  } = {}): Promise<{
    entities: Entidad[]
    total: number
    pages: number
  }> {
    const { page = 1, limit = 1000, columnFilters = {}, tipoEntidadFilter = 'ALL' } = filters

    let filteredEntities = [...this.entities]

    // Filter by entity type
    if (tipoEntidadFilter !== 'ALL') {
      filteredEntities = filteredEntities.filter(entity => entity.tipoEntidad === tipoEntidadFilter)
    }

    // Apply column filters
    if (columnFilters.nif) {
      filteredEntities = filteredEntities.filter(entity =>
        entity.NIF?.toLowerCase().includes(columnFilters.nif.toLowerCase())
      )
    }

    if (columnFilters.nombre) {
      filteredEntities = filteredEntities.filter(entity =>
        entity.razonSocial.toLowerCase().includes(columnFilters.nombre.toLowerCase())
      )
    }

    if (columnFilters.telefono) {
      filteredEntities = filteredEntities.filter(entity =>
        entity.telefono?.toLowerCase().includes(columnFilters.telefono.toLowerCase())
      )
    }

    return {
      entities: filteredEntities,
      total: filteredEntities.length,
      pages: Math.ceil(filteredEntities.length / limit)
    }
  }

  static async getEntity(id: number): Promise<Entidad | null> {
    return this.entities.find(entity => entity.id === id) || null
  }

  static async createEntity(entityData: Omit<Entidad, 'id' | 'createdAt' | 'updatedAt'>): Promise<Entidad> {
    const newEntity: Entidad = {
      id: this.nextId++,
      ...entityData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    this.entities.unshift(newEntity)
    return newEntity
  }

  static async updateEntity(id: number, updateData: Partial<Entidad>): Promise<Entidad | null> {
    const index = this.entities.findIndex(entity => entity.id === id)
    if (index === -1) return null
    
    this.entities[index] = {
      ...this.entities[index],
      ...updateData,
      updatedAt: new Date().toISOString()
    }
    
    return this.entities[index]
  }

  static async deleteEntity(id: number): Promise<boolean> {
    const index = this.entities.findIndex(entity => entity.id === id)
    if (index === -1) return false
    
    this.entities.splice(index, 1)
    return true
  }
}
