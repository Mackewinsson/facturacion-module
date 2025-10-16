// Spanish tax calculations and validations for AEAT compliance

import { TipoIVA, MotivoExencion, LineaFactura, Totales, BasePorTipo } from './mock-data'

// Spanish VAT rates
export const VAT_RATES = {
  0: 0,
  4: 4,
  10: 10,
  21: 21
} as const

// Recargo de equivalencia rates (based on VAT rate)
export const RECARGO_EQUIVALENCIA_RATES = {
  0: 0,
  4: 0.5,
  10: 1.4,
  21: 5.2
} as const

// Motivos de exención con referencias legales
export const MOTIVOS_EXENCION = {
  'art20.1.26': 'Art. 20.Uno.26º LIVA - Servicios de enseñanza',
  'art20.1.27': 'Art. 20.Uno.27º LIVA - Servicios sanitarios',
  'art20.1.28': 'Art. 20.Uno.28º LIVA - Servicios sociales',
  'art25': 'Art. 25 LIVA - Entregas intracomunitarias',
  'exportacion': 'Art. 20.Uno.1º LIVA - Exportaciones',
  'otro': 'Otro motivo de exención'
} as const

// Causas de rectificación
export const CAUSAS_RECTIFICACION = {
  'error': 'Error en la factura original',
  'devolucion': 'Devolución de bienes o servicios',
  'descuento': 'Descuento posterior',
  'otro': 'Otra causa'
} as const

// Formas de pago comunes
export const FORMAS_PAGO = [
  'Transferencia bancaria',
  'Efectivo',
  'Tarjeta de crédito/débito',
  'Bizum',
  'Cheque',
  'Domiciliación bancaria',
  'Letra de cambio',
  'Otro'
] as const

// Validación de NIF español
export function validateNIF(nif: string): boolean {
  if (!nif || nif.length < 8) return false
  
  const nifRegex = /^[0-9]{8}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
  const nieRegex = /^[XYZ][0-9]{7}[TRWAGMYFPDXBNJZSQVHLCKE]$/i
  const cifRegex = /^[ABCDEFGHJNPQRSUVW][0-9]{7}[0-9A-J]$/i
  
  return nifRegex.test(nif) || nieRegex.test(nif) || cifRegex.test(nif)
}

// Validación de NIF-IVA (para operadores intracomunitarios)
export function validateNIFIVA(nif: string): boolean {
  if (!nif) return false
  
  // NIF español
  if (validateNIF(nif)) return true
  
  // NIF-IVA de otros países UE (formato: ES + NIF)
  const nifIVARegex = /^[A-Z]{2}[A-Z0-9]{2,12}$/i
  return nifIVARegex.test(nif)
}

// Cálculo de base imponible por línea
export function calculateLineBase(line: Partial<LineaFactura>): number {
  const cantidad = line.cantidad || 0
  const precioUnitario = line.precioUnitario || 0
  const descuentoPct = line.descuentoPct || 0
  
  const subtotal = cantidad * precioUnitario
  const descuento = subtotal * (descuentoPct / 100)
  
  return subtotal - descuento
}

// Cálculo de cuota IVA por línea
export function calculateLineVAT(line: Partial<LineaFactura>): number {
  if (line.exenta || line.inversionSujetoPasivo) return 0
  
  const base = calculateLineBase(line)
  const tipoIVA = line.tipoIVA || 0
  
  return base * (tipoIVA / 100)
}

// Cálculo de recargo de equivalencia por línea
export function calculateLineRE(line: Partial<LineaFactura>): number {
  if (line.exenta || line.inversionSujetoPasivo) return 0
  
  const base = calculateLineBase(line)
  const tipoIVA = line.tipoIVA || 0
  const recargoPct = line.recargoEquivalenciaPct || RECARGO_EQUIVALENCIA_RATES[tipoIVA as keyof typeof RECARGO_EQUIVALENCIA_RATES] || 0
  
  return base * (recargoPct / 100)
}

// Cálculo de total por línea
export function calculateLineTotal(line: Partial<LineaFactura>): number {
  const base = calculateLineBase(line)
  const cuotaIVA = calculateLineVAT(line)
  const cuotaRE = calculateLineRE(line)
  
  return base + cuotaIVA + cuotaRE
}

// Cálculo de totales de la factura
export function calculateInvoiceTotals(lineas: Partial<LineaFactura>[]): Totales {
  const basesPorTipo: BasePorTipo[] = []
  const tipoMap = new Map<TipoIVA, { base: number, cuotaIVA: number, recargoEquivalencia: number }>()
  
  // Agrupar por tipo de IVA
  lineas.forEach(linea => {
    const tipoIVA = linea.tipoIVA || 0
    const base = calculateLineBase(linea)
    const cuotaIVA = calculateLineVAT(linea)
    const recargoEquivalencia = calculateLineRE(linea)
    
    if (tipoMap.has(tipoIVA)) {
      const existing = tipoMap.get(tipoIVA)!
      existing.base += base
      existing.cuotaIVA += cuotaIVA
      existing.recargoEquivalencia += recargoEquivalencia
    } else {
      tipoMap.set(tipoIVA, { base, cuotaIVA, recargoEquivalencia })
    }
  })
  
  // Convertir a array
  tipoMap.forEach((totals, tipoIVA) => {
    basesPorTipo.push({
      tipoIVA,
      base: totals.base,
      cuotaIVA: totals.cuotaIVA,
      recargoEquivalencia: totals.recargoEquivalencia
    })
  })
  
  // Calcular totales
  const baseImponibleTotal = basesPorTipo.reduce((sum, item) => sum + item.base, 0)
  const cuotaIVATotal = basesPorTipo.reduce((sum, item) => sum + item.cuotaIVA, 0)
  const cuotaRETotal = basesPorTipo.reduce((sum, item) => sum + item.recargoEquivalencia, 0)
  
  return {
    basesPorTipo,
    baseImponibleTotal,
    cuotaIVATotal,
    cuotaRETotal,
    totalFactura: baseImponibleTotal + cuotaIVATotal + cuotaRETotal
  }
}

// Generar menciones obligatorias según el tipo de factura
export function generateMencionesObligatorias(invoice: any): string[] {
  const menciones: string[] = []
  
  // Menciones por tipo de factura
  if (invoice.tipoFactura === 'rectificativa') {
    menciones.push('FACTURA RECTIFICATIVA')
    if (invoice.causaRectificacion) {
      menciones.push(`Causa: ${CAUSAS_RECTIFICACION[invoice.causaRectificacion as keyof typeof CAUSAS_RECTIFICACION]}`)
    }
    if (invoice.referenciasFacturasRectificadas?.length) {
      menciones.push(`Facturas rectificadas: ${invoice.referenciasFacturasRectificadas.join(', ')}`)
    }
  }
  
  // Menciones por líneas exentas
  const lineasExentas = invoice.lineas?.filter((linea: any) => linea.exenta)
  if (lineasExentas?.length) {
    lineasExentas.forEach((linea: any) => {
      if (linea.motivoExencion) {
        menciones.push(`Operación exenta según ${MOTIVOS_EXENCION[linea.motivoExencion as keyof typeof MOTIVOS_EXENCION]}`)
      }
    })
  }
  
  // Menciones por inversión del sujeto pasivo
  const lineasISP = invoice.lineas?.filter((linea: any) => linea.inversionSujetoPasivo)
  if (lineasISP?.length) {
    menciones.push('Inversión del sujeto pasivo – art. 84.Uno.2º LIVA')
  }
  
  // Menciones por recargo de equivalencia
  const lineasRE = invoice.lineas?.filter((linea: any) => linea.recargoEquivalenciaPct && linea.recargoEquivalenciaPct > 0)
  if (lineasRE?.length) {
    menciones.push('Recargo de equivalencia aplicado')
  }
  
  return menciones
}

// Validaciones específicas por tipo de factura
export function validateInvoiceByType(invoice: any): string[] {
  const errors: string[] = []
  
  // Validaciones comunes
  if (!invoice.emisor?.nombreORazonSocial) {
    errors.push('El nombre o razón social del emisor es obligatorio')
  }
  
  if (!invoice.emisor?.NIF) {
    errors.push('El NIF del emisor es obligatorio')
  } else if (!validateNIF(invoice.emisor.NIF)) {
    errors.push('El NIF del emisor no es válido')
  }
  
  if (!invoice.cliente?.nombreORazonSocial) {
    errors.push('El nombre o razón social del cliente es obligatorio')
  }
  
  if (!invoice.fechaExpedicion) {
    errors.push('La fecha de expedición es obligatoria')
  }
  
  if (!invoice.lineas?.length) {
    errors.push('Debe incluir al menos una línea de factura')
  }
  
  // Validaciones por tipo de factura
  if (invoice.tipoFactura === 'ordinaria') {
    if (!invoice.cliente.domicilio) {
      errors.push('El domicilio del cliente es obligatorio en facturas ordinarias')
    }
    
    if (invoice.cliente.tipo === 'empresario/profesional' && !invoice.cliente.NIF) {
      errors.push('El NIF del cliente es obligatorio para empresarios/profesionales')
    }
  }
  
  if (invoice.tipoFactura === 'rectificativa') {
    if (!invoice.causaRectificacion) {
      errors.push('La causa de rectificación es obligatoria')
    }
    
    if (!invoice.referenciasFacturasRectificadas?.length) {
      errors.push('Debe especificar las facturas rectificadas')
    }
  }
  
  // Validaciones de líneas
  invoice.lineas?.forEach((linea: any, index: number) => {
    if (!linea.descripcion?.trim()) {
      errors.push(`La descripción de la línea ${index + 1} es obligatoria`)
    }
    
    if (!linea.cantidad || linea.cantidad <= 0) {
      errors.push(`La cantidad de la línea ${index + 1} debe ser mayor que 0`)
    }
    
    if (linea.precioUnitario < 0) {
      errors.push(`El precio unitario de la línea ${index + 1} no puede ser negativo`)
    }
    
    // Validar régimen de IVA
    if (!linea.exenta && !linea.inversionSujetoPasivo && !linea.tipoIVA) {
      errors.push(`Debe especificar el tipo de IVA para la línea ${index + 1}`)
    }
    
    if (linea.exenta && !linea.motivoExencion) {
      errors.push(`Debe especificar el motivo de exención para la línea ${index + 1}`)
    }
  })
  
  return errors
}
