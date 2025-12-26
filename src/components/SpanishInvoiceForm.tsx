'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  MockInvoiceService,
  Invoice,
  TipoFactura,
  TipoIVA,
  MotivoExencion,
  CausaRectificacion,
  LineaFactura,
  Cliente
} from '@/lib/mock-data'
import {
  VAT_RATES,
  MOTIVOS_EXENCION,
  CAUSAS_RECTIFICACION,
  FORMAS_PAGO,
  calculateLineBase,
  calculateLineVAT,
  calculateLineRE,
  calculateLineTotal,
  calculateInvoiceTotals,
  generateMencionesObligatorias,
  validateInvoiceByType
} from '@/lib/spanish-tax-calculations'
import ClientSearch from './ClientSearch'
import AddClientModal from './AddClientModal'
import InvoicePreviewModal from './InvoicePreviewModal'

interface SpanishInvoiceFormProps {
  initialData?: Partial<Invoice>
  invoiceId?: number
  hideISP?: boolean
  hideRecargoEquivalencia?: boolean
  allowedVATRates?: number[]
  isReceivedInvoice?: boolean
}

const getEmisorData = () => {
  return {
    nombreORazonSocial: 'Taller Mecánico García S.L.',
    NIF: 'B12345678',
    domicilio: {
      calle: 'Calle de la Industria 45',
      codigoPostal: '28045',
      municipio: 'Madrid',
      provincia: 'Madrid',
      pais: 'España'
    }
  }
}

type DocumentOptionKey = 'customFields' | 'documentText' | 'finalMessage' | 'portalQR'

const DOCUMENT_OPTION_ITEMS: Array<{ key: DocumentOptionKey; label: string; badge?: 'Mejorar plan' | 'Nuevo' }> = [
  // { key: 'customFields', label: 'Campos personalizados', badge: 'Mejorar plan' },
  // { key: 'documentText', label: 'Añadir texto en el documento' },
  // { key: 'finalMessage', label: 'Añadir mensaje al final' },
  // { key: 'portalQR', label: 'Mostrar QR de acceso al Portal', badge: 'Nuevo' }
]

// Payment providers constant commented out
// const PAYMENT_PROVIDERS = ['Stripe', 'PayPal', 'Square', 'GoCardless']

export default function SpanishInvoiceForm({ initialData, invoiceId, hideISP = false, hideRecargoEquivalencia = false, allowedVATRates, isReceivedInvoice = false }: SpanishInvoiceFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<Partial<Invoice>>({
    tipoFactura: isReceivedInvoice ? 'recibida' : 'ordinaria',
    serie: isReceivedInvoice ? '' : 'X7',
    numero: isReceivedInvoice ? '' : '001134',
    fechaExpedicion: new Date().toISOString().split('T')[0],
    fechaContable: new Date().toISOString().split('T')[0],
    lugarEmision: '',
    departamento: 'Administración',
    cliente: {
      tipo: 'particular',
      nombreORazonSocial: '',
      NIF: '',
      domicilio: {
        calle: '',
        codigoPostal: '',
        municipio: '',
        provincia: '',
        pais: 'España'
      },
      pais: 'España'
    },
    imputacion: '',
    mantenimientoCliente: isReceivedInvoice ? 'Compra - Proveedor' : 'Mantenimiento - Cliente',
    exportacionImportacion: false,
    lineas: [
      {
        id: 1,
        descripcion: '',
        descripcionDetallada: '',
        cantidad: 1,
        precioUnitario: 0,
        descuentoPct: 0,
        tipoIVA: 21,
        baseLinea: 0,
        cuotaIVA: 0,
        cuotaRE: 0,
        totalLinea: 0
      }
    ],
    totales: {
      basesPorTipo: [],
      baseImponibleTotal: 0,
      cuotaIVATotal: 0,
      cuotaRETotal: 0,
      totalFactura: 0
    },
    formaPago: 'Crédito 30 días',
    medioPago: 'Sin Pagar',
    fechaVencimiento: '',
    notas: '',
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
    esRectificativa: false,
    causaRectificacion: 'error',
    referenciasFacturasRectificadas: [],
    status: 'DRAFT'
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState<string[]>([])
  const [selectedClient, setSelectedClient] = useState<Cliente | null>(null)
  const [showAddClientModal, setShowAddClientModal] = useState(false)
  const [suggestedClientName, setSuggestedClientName] = useState('')
  const [showPreviewModal, setShowPreviewModal] = useState(false)
  const [documentOptions, setDocumentOptions] = useState<Record<DocumentOptionKey, boolean>>({
    customFields: false,
    documentText: false,
    finalMessage: false,
    portalQR: false
  })
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  // Categorization state commented out
  // const [categorization, setCategorization] = useState({
  //   account: '70000000 Ventas de mercaderías',
  //   accountByConcept: false,
  //   tags: '',
  //   conceptTags: false,
  //   internalNote: '',
  //   assignedUsers: '',
  //   project: ''
  // })

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        lineas: initialData.lineas
          ? initialData.lineas.map(linea => ({
              descripcionDetallada: '',
              ...linea
            }))
          : prev.lineas,
        totales: initialData.totales || prev.totales
      }))
    }
  }, [initialData])

  // Normalize line VAT to first allowed rate if restrictions are provided
  useEffect(() => {
    if (!allowedVATRates || !allowedVATRates.length) return
    setFormData(prev => {
      const currentLines = prev.lineas || []
      const normalized = currentLines.map(linea => {
        const currentRate = (linea.tipoIVA as number) || 0
        if (!allowedVATRates.includes(currentRate)) {
          return { ...linea, tipoIVA: allowedVATRates[0] as unknown as TipoIVA }
        }
        return linea
      })
      return { ...prev, lineas: normalized }
    })
  }, [allowedVATRates])

  useEffect(() => {
    if (!formData.lineas) return

    const updatedLineas = formData.lineas.map(linea => {
      const base = calculateLineBase(linea)
      const cuotaIVA = calculateLineVAT(linea)
      const cuotaRE = calculateLineRE(linea)
      const total = calculateLineTotal(linea)

      return {
        ...linea,
        baseLinea: base,
        cuotaIVA,
        cuotaRE,
        totalLinea: total
      }
    })

    const totales = calculateInvoiceTotals(updatedLineas)

    setFormData(prev => {
      const currentLineas = prev.lineas || []
      const hasCalculatedValuesChanged =
        updatedLineas.length !== currentLineas.length ||
        updatedLineas.some((linea, index) => {
          const current = currentLineas[index]
          if (!current) return true
          return (
            linea.baseLinea !== current.baseLinea ||
            linea.cuotaIVA !== current.cuotaIVA ||
            linea.cuotaRE !== current.cuotaRE ||
            linea.totalLinea !== current.totalLinea
          )
        })

      const hasTotalsChanged =
        !prev.totales ||
        prev.totales.baseImponibleTotal !== totales.baseImponibleTotal ||
        prev.totales.cuotaIVATotal !== totales.cuotaIVATotal ||
        (prev.totales.cuotaRETotal || 0) !== (totales.cuotaRETotal || 0) ||
        prev.totales.totalFactura !== totales.totalFactura

      if (!hasCalculatedValuesChanged && !hasTotalsChanged) {
        return prev
      }

      return {
        ...prev,
        lineas: updatedLineas,
        totales
      }
    })
  }, [formData.lineas])

  const handleInputChange = (field: string, value: unknown) => {
    setFormData(prev => {
      const clone: Record<string, unknown> = { ...prev }
      const keys = field.split('.')
      let current: Record<string, unknown> = clone

      keys.forEach((key, index) => {
        if (index === keys.length - 1) {
          current[key] = value
          return
        }

        const existing = current[key]
        if (typeof existing === 'object' && existing !== null && !Array.isArray(existing)) {
          const cloned = { ...(existing as Record<string, unknown>) }
          current[key] = cloned
          current = cloned
        } else {
          const placeholder: Record<string, unknown> = {}
          current[key] = placeholder
          current = placeholder
        }
      })

      return clone as Partial<Invoice>
    })
  }

  const handleClientSelect = (client: Cliente | null) => {
    setSelectedClient(client)
    if (client) {
      setFormData(prev => ({
        ...prev,
        cliente: client
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        cliente: {
          tipo: 'particular',
          nombreORazonSocial: '',
          NIF: '',
          domicilio: {
            calle: '',
            codigoPostal: '',
            municipio: '',
            provincia: '',
            pais: 'España'
          },
          pais: 'España'
        }
      }))
    }
  }

  const handleAddNewClient = (suggestedName?: string) => {
    setSuggestedClientName(suggestedName || '')
    setShowAddClientModal(true)
  }

  const handleClientAdded = (newClient: Cliente) => {
    setSelectedClient(newClient)
    setFormData(prev => ({
      ...prev,
      cliente: newClient
    }))
    setShowAddClientModal(false)
    setSuggestedClientName('')
  }

  const handleLineChange = <K extends keyof LineaFactura>(
    index: number,
    field: K,
    value: LineaFactura[K]
  ) => {
    const currentLineas = [...(formData.lineas || [])]
    const targetLine = currentLineas[index]
    if (!targetLine) return

    currentLineas[index] = { ...targetLine, [field]: value }

    setFormData(prev => ({
      ...prev,
      lineas: currentLineas
    }))
  }

  const addLine = () => {
    const newLine: LineaFactura = {
      id: Date.now(),
      descripcion: '',
      descripcionDetallada: '',
      cantidad: 1,
      precioUnitario: 0,
      descuentoPct: 0,
      tipoIVA: 21,
      baseLinea: 0,
      cuotaIVA: 0,
      cuotaRE: 0,
      totalLinea: 0
    }

    setFormData(prev => ({
      ...prev,
      lineas: [...(prev.lineas || []), newLine]
    }))
  }

  const removeLine = (index: number) => {
    if (formData.lineas && formData.lineas.length > 1) {
      const newLineas = formData.lineas.filter((_, i) => i !== index)
      setFormData(prev => ({
        ...prev,
        lineas: newLineas
      }))
    }
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    const currentLineas = [...(formData.lineas || [])]
    const draggedItem = currentLineas[draggedIndex]
    
    // Remove the dragged item
    currentLineas.splice(draggedIndex, 1)
    
    // Insert it at the new position
    currentLineas.splice(dropIndex, 0, draggedItem)
    
    setFormData(prev => ({
      ...prev,
      lineas: currentLineas
    }))
    
    setDraggedIndex(null)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const submitInvoice = async (nextStatus: 'DRAFT' | 'APPROVED') => {
    setLoading(true)
    setError('')
    setValidationErrors([])

    try {
      const emisorData = getEmisorData()
      const lineas = (formData.lineas || []).map(linea => {
        const base = calculateLineBase(linea)
        const cuotaIVA = calculateLineVAT(linea)
        const cuotaRE = calculateLineRE(linea)
        const total = calculateLineTotal(linea)

        return {
          ...linea,
          baseLinea: base,
          cuotaIVA,
          cuotaRE,
          totalLinea: total
        }
      })
      const totales = calculateInvoiceTotals(lineas)

      const payload: Partial<Invoice> = {
        ...formData,
        status: nextStatus,
        emisor: emisorData,
        lineas,
        totales
      }

      const errors = validateInvoiceByType(payload as Invoice)
      if (errors.length > 0) {
        setValidationErrors(errors)
        setLoading(false)
        return
      }

      setFormData(prev => ({
        ...prev,
        status: nextStatus,
        lineas,
        totales
      }))

      const newInvoice = await MockInvoiceService.createInvoice(
        payload as unknown as Omit<Invoice, 'id' | 'numero' | 'createdAt' | 'updatedAt'>
      )
      if (newInvoice) {
        router.push(`/facturacion/preview/${newInvoice.id}`)
      } else {
        setError('Error al crear la factura')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await submitInvoice('DRAFT')
  }

  const handleSaveDraft = async () => {
    await submitInvoice('DRAFT')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const getMencionesObligatorias = () => {
    return generateMencionesObligatorias(formData)
  }

  // Document option toggle function commented out
  // const handleDocumentOptionToggle = (key: DocumentOptionKey) => {
  //   setDocumentOptions(prev => ({
  //     ...prev,
  //     [key]: !prev[key]
  //   }))
  // }

  const baseInputClasses =
    'w-full rounded-lg border border-input-border px-3 py-2 text-sm text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-accent'

  return (
    <div className="bg-background px-4 py-6 lg:px-8">
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          {/* Header with title and action buttons */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
            <h1 className="text-2xl font-semibold text-card-foreground">
              {isReceivedInvoice ? 'Nueva factura recibida' : 'Nueva factura'}
            </h1>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Vista previa
              </button>
              <button
                type="button"
                onClick={handleSaveDraft}
                disabled={loading}
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-60"
              >
                Guardar como borrador
              </button>
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            {/* Row 1: Factura number and date */}
            <div className="flex items-center gap-8 mb-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">Factura</label>
                {isReceivedInvoice ? (
                  <input
                    type="text"
                    value={`${formData.serie || ''}${formData.numero || ''}`}
                    onChange={e => {
                      const value = e.target.value
                      const match = value.match(/^([A-Za-z0-9]*)(.*)$/)
                      if (match) {
                        const serie = match[1] || ''
                        const numero = match[2] || ''
                        handleInputChange('serie', serie)
                        handleInputChange('numero', numero)
                      }
                    }}
                    placeholder="Número de factura"
                    className={`${baseInputClasses} w-40`}
                  />
                ) : (
                  <span className="text-lg font-semibold text-card-foreground">
                    {formData.serie}{formData.numero}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-muted-foreground">de fecha</label>
                <input
                  type="date"
                  value={formData.fechaExpedicion || ''}
                  onChange={e => handleInputChange('fechaExpedicion', e.target.value)}
                  className={`${baseInputClasses} w-40`}
                />
              </div>
            </div>

            {/* Row 2: Proveedor + Exportación/Importación */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-card-foreground mb-2">Proveedor</label>
                <ClientSearch
                  onClientSelect={handleClientSelect}
                  selectedClient={selectedClient}
                  placeholder="CIAL. NAVARRO HERMANOS, S.A."
                  onAddNewClient={handleAddNewClient}
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="exportacionImportacion"
                  checked={formData.exportacionImportacion || false}
                  onChange={e => handleInputChange('exportacionImportacion', e.target.checked)}
                  className="rounded border-input-border text-accent focus:ring-accent"
                />
                <label htmlFor="exportacionImportacion" className="text-sm font-medium text-card-foreground">
                  Exportación/Importación
                </label>
              </div>
            </div>

            {/* Row 3: Dirección/Teléfono dropdown */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <div className="relative">
                  <select
                    value={selectedClient?.telefono || ''}
                    onChange={() => {}}
                    className={`${baseInputClasses}`}
                  >
                    <option value="">
                      {selectedClient?.telefono 
                        ? `(${selectedClient.telefono})` 
                        : '(952223930 / 952221315)'}
                    </option>
                  </select>
                </div>
              </div>
            </div>

            {/* Row 4: Forma pago */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-card-foreground mb-2">Forma pago</label>
                <select
                  value={formData.formaPago || 'Crédito 30 días'}
                  onChange={e => handleInputChange('formaPago', e.target.value)}
                  className={`${baseInputClasses}`}
                >
                  <option value="Crédito 30 días">Crédito 30 días</option>
                  <option value="Contado">Contado</option>
                  <option value="Transferencia bancaria">Transferencia bancaria</option>
                  <option value="Tarjeta">Tarjeta</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>
            </div>

            {/* Row 5: Notas */}
            <div>
              <label className="block text-sm font-medium text-card-foreground mb-2">Notas</label>
              <textarea
                value={formData.notas || ''}
                onChange={e => handleInputChange('notas', e.target.value)}
                rows={3}
                className={`${baseInputClasses} resize-none`}
              />
            </div>

            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            {validationErrors.length > 0 && (
              <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                <p className="font-semibold text-red-800">Revisa estos datos antes de continuar:</p>
                <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                  {validationErrors.map((validationError, index) => (
                    <li key={index}>{validationError}</li>
                  ))}
                </ul>
              </div>
            )}


            {formData.tipoFactura === 'rectificativa' && (
              <section className="rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5">
                <h2 className="text-lg font-semibold text-amber-900">Datos de rectificación</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-amber-900">Causa de rectificación</label>
                    <select
                      value={formData.causaRectificacion || 'error'}
                      onChange={e =>
                        handleInputChange('causaRectificacion', e.target.value as CausaRectificacion)
                      }
                      className={`${baseInputClasses} mt-2`}
                    >
                      {Object.entries(CAUSAS_RECTIFICACION).map(([key, value]) => (
                        <option key={key} value={key}>
                          {value}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-amber-900">
                      Facturas rectificadas (separadas por coma)
                    </label>
                    <input
                      type="text"
                      value={formData.referenciasFacturasRectificadas?.join(', ') || ''}
                      onChange={e =>
                        handleInputChange(
                          'referenciasFacturasRectificadas',
                          e.target.value
                            .split(',')
                            .map(value => value.trim())
                            .filter(Boolean)
                        )
                      }
                      placeholder="2024-A-00001, 2024-A-00002"
                      className={`${baseInputClasses} mt-2`}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Invoice Lines Section */}
            <section>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-lg font-semibold text-card-foreground">Líneas de Factura</h2>
                </div>
                
                <div className="p-5">
                  {/* Table Header */}
                  <div className="grid grid-cols-13 gap-4 mb-4 pb-2 border-b border-border">
                    <div className="col-span-1 text-sm font-medium text-muted-foreground"></div>
                    <div className="col-span-3 text-sm font-medium text-muted-foreground">Concepto</div>
                    <div className="col-span-3 text-sm font-medium text-muted-foreground">Descripción</div>
                    <div className="col-span-1 text-sm font-medium text-muted-foreground text-center">Cantidad</div>
                    <div className="col-span-1 text-sm font-medium text-muted-foreground text-center">Precio</div>
                    <div className="col-span-2 text-sm font-medium text-muted-foreground text-center">Impuestos</div>
                    <div className="col-span-1 text-sm font-medium text-muted-foreground text-center">Total</div>
                    <div className="col-span-1 text-sm font-medium text-muted-foreground text-center"></div>
                  </div>
                  
                  {/* Table Rows */}
                  <div className="space-y-2">
                    {formData.lineas?.map((linea, index) => (
                      <div 
                        key={linea.id} 
                        className={`grid grid-cols-13 gap-4 items-center py-2 rounded-lg transition-colors ${
                          draggedIndex === index ? 'bg-blue-50 border-2 border-blue-200' : 'hover:bg-muted/20'
                        }`}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, index)}
                      >
                        {/* Drag Handle */}
                        <div className="col-span-1 flex justify-center">
                          <div 
                            className="w-4 h-4 text-muted-foreground cursor-move hover:text-card-foreground"
                            draggable
                            onDragStart={(e) => handleDragStart(e, index)}
                            onDragEnd={handleDragEnd}
                            title="Arrastrar para reordenar"
                          >
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 16a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"/>
                            </svg>
                          </div>
                        </div>
                        
                        {/* Concepto */}
                        <div className="col-span-3">
                          <input
                            type="text"
                            value={linea.descripcion || ''}
                            onChange={e => handleLineChange(index, 'descripcion', e.target.value)}
                            placeholder="Escribe el concepto o usa @ para buscar"
                            className={`${baseInputClasses} text-sm`}
                          />
                        </div>
                        
                        {/* Descripción */}
                        <div className="col-span-3">
                          <div className="relative">
                            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <input
                              type="text"
                              placeholder="Desc"
                              className={`${baseInputClasses} text-sm pl-10`}
                            />
                          </div>
                        </div>
                        
                        {/* Cantidad */}
                        <div className="col-span-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={linea.cantidad || 1}
                            onChange={e => handleLineChange(index, 'cantidad', Number(e.target.value))}
                            className={`${baseInputClasses} text-sm text-center`}
                          />
                        </div>
                        
                        {/* Precio */}
                        <div className="col-span-1">
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={linea.precioUnitario || 0}
                            onChange={e => handleLineChange(index, 'precioUnitario', Number(e.target.value))}
                            className={`${baseInputClasses} text-sm text-center`}
                          />
                        </div>
                        
                        {/* Impuestos */}
                        <div className="col-span-2">
                          <div className="flex items-center justify-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                              X IVA {linea.tipoIVA || 21}%
                              <button
                                type="button"
                                className="ml-1 text-blue-600 hover:text-blue-800"
                                onClick={() => handleLineChange(index, 'tipoIVA', 0 as TipoIVA)}
                              >
                                ×
                              </button>
                            </span>
                          </div>
                        </div>
                        
                        {/* Total */}
                        <div className="col-span-1 text-center">
                          <span className="text-sm font-medium text-card-foreground">
                            {formatCurrency(linea.totalLinea || 0)}
                          </span>
                        </div>
                        
                        {/* Delete Button */}
                        <div className="col-span-1 flex justify-center">
                          {formData.lineas && formData.lineas.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeLine(index)}
                              className="text-red-600 hover:text-red-800 p-1"
                              title="Eliminar línea"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Add Line Button */}
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={addLine}
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-card-foreground"
                    >
                      <span>Añadir línea</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            {/* Totales y Cálculos Section */}
            <section>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-lg font-semibold text-card-foreground">Totales y Cálculos</h2>
                </div>
                
                <div className="p-5">
                  <div className="space-y-4">
                    {/* Tax Breakdown Row */}
                    <div className="grid grid-cols-4 gap-6">
                      {/* Base */}
                      <div className="text-center">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Base</label>
                        <div className="text-base font-medium text-card-foreground">
                          {formatCurrency(formData.totales?.baseImponibleTotal || 0)}
                        </div>
                      </div>

                      {/* IVA */}
                      <div className="text-center">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">IVA</label>
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(formData.totales?.cuotaIVATotal || 0)}
                          </span>
                          <select
                            value={formData.lineas?.[0]?.tipoIVA || 21}
                            onChange={e => handleLineChange(0, 'tipoIVA', Number(e.target.value) as TipoIVA)}
                            className="rounded-md border border-input-border px-2 py-1 text-sm text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-accent"
                          >
                            <option value={21}>21%</option>
                            <option value={10}>10%</option>
                            <option value={4}>4%</option>
                            <option value={0}>0%</option>
                          </select>
                        </div>
                      </div>
                      
                      {/* Rec. */}
                      <div className="text-center">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Rec.</label>
                        <div className="text-base font-medium text-card-foreground">
                          {formatCurrency(formData.totales?.cuotaRETotal || 0)}
                        </div>
                      </div>
                      
                      {/* Total */}
                      <div className="text-center">
                        <label className="block text-sm font-medium text-muted-foreground mb-2">Total</label>
                        <div className="text-base font-medium text-card-foreground">
                          {formatCurrency(formData.totales?.totalFactura || 0)}
                        </div>
                      </div>
                    </div>

                    {/* Aplicar retención checkbox */}
                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="aplicarRetencion"
                        checked={formData.aplicarRetencion || false}
                        onChange={e => handleInputChange('aplicarRetencion', e.target.checked)}
                        className="rounded border-input-border text-accent focus:ring-accent"
                      />
                      <label htmlFor="aplicarRetencion" className="text-sm font-medium text-card-foreground">
                        Aplicar retención
                      </label>
                    </div>

                    {/* Retention fields - only shown when checkbox is checked */}
                    {formData.aplicarRetencion && (
                      <div className="grid grid-cols-4 gap-4 pl-6 pt-2">
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">Cta. Ret.</label>
                          <input
                            type="text"
                            value={formData.ctaRetencion || ''}
                            onChange={e => handleInputChange('ctaRetencion', e.target.value)}
                            className={`${baseInputClasses} text-sm`}
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">Base</label>
                          <div className="text-sm font-medium text-card-foreground bg-muted px-3 py-2 rounded-md">
                            {formatCurrency(formData.baseRetencion || 0)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">%</label>
                          <div className="text-sm font-medium text-card-foreground bg-muted px-3 py-2 rounded-md">
                            {formData.porcentajeRetencion || 0}%
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">Importe</label>
                          <div className="text-sm font-medium text-card-foreground bg-muted px-3 py-2 rounded-md">
                            {formatCurrency(formData.importeRetencion || 0)}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>


            {getMencionesObligatorias().length > 0 && (
              <section className="rounded-2xl border border-yellow-200 bg-yellow-50 px-5 py-5">
                <h3 className="text-lg font-semibold text-yellow-900">Menciones obligatorias</h3>
                <div className="mt-3 space-y-2">
                  {getMencionesObligatorias().map((mencion, index) => (
                    <div
                      key={index}
                      className="rounded-lg border border-yellow-200 bg-white/80 px-3 py-2 text-sm text-yellow-900"
                    >
                      {mencion}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          <div className="flex flex-wrap justify-end gap-3 border-t border-border px-6 py-5">
            <button
              type="button"
              onClick={() => router.push('/facturacion')}
              className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>

      <AddClientModal
        isOpen={showAddClientModal}
        onClose={() => setShowAddClientModal(false)}
        onClientAdded={handleClientAdded}
        suggestedName={suggestedClientName}
      />

      <InvoicePreviewModal
        isOpen={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        formData={formData}
      />
    </div>
  )
}
