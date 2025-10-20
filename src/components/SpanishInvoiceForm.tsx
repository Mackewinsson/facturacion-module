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

interface SpanishInvoiceFormProps {
  initialData?: Partial<Invoice>
  invoiceId?: number
  isEdit?: boolean
  hideISP?: boolean
  hideRecargoEquivalencia?: boolean
  allowedVATRates?: number[]
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

export default function SpanishInvoiceForm({ initialData, invoiceId, isEdit = false, hideISP = false, hideRecargoEquivalencia = false, allowedVATRates }: SpanishInvoiceFormProps) {
  const router = useRouter()

  const [formData, setFormData] = useState<Partial<Invoice>>({
    tipoFactura: 'ordinaria',
    serie: '2024-A',
    numero: '',
    fechaExpedicion: new Date().toISOString().split('T')[0],
    lugarEmision: '',
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
    formaPago: 'Transferencia bancaria',
    fechaVencimiento: '',
    notas: '',
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
  const [documentOptions, setDocumentOptions] = useState<Record<DocumentOptionKey, boolean>>({
    customFields: false,
    documentText: false,
    finalMessage: false,
    portalQR: false
  })
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

      if (isEdit && invoiceId) {
        const updatedInvoice = await MockInvoiceService.updateInvoice(invoiceId, payload as Invoice)
        if (updatedInvoice) {
          router.push('/facturacion')
        } else {
          setError('Error al actualizar la factura')
        }
      } else {
        const newInvoice = await MockInvoiceService.createInvoice(
          payload as unknown as Omit<Invoice, 'id' | 'numero' | 'createdAt' | 'updatedAt'>
        )
        if (newInvoice) {
          router.push('/facturacion')
        } else {
          setError('Error al crear la factura')
        }
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await submitInvoice('APPROVED')
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

  const approveLabel = isEdit ? 'Guardar cambios' : 'Aprobar'
  const baseInputClasses =
    'w-full rounded-lg border border-input-border px-3 py-2 text-sm text-foreground bg-input focus:outline-none focus:ring-2 focus:ring-accent'

  return (
    <div className="bg-background px-4 py-6 lg:px-8">
      <div className="w-full">
        <form
          onSubmit={handleSubmit}
          className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
        >
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
            <div>
              <h1 className="text-2xl font-semibold text-card-foreground">
                {isEdit ? 'Editar factura' : 'Nueva factura'}
              </h1>
              <p className="text-sm text-muted-foreground">
                Organiza la información de tu factura antes de compartirla con el cliente.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Vista previa
              </button>
              <button
                type="button"
                className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
              >
                Opciones
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
                {loading ? 'Guardando...' : approveLabel}
              </button>
            </div>
          </div>

          <div className="space-y-8 px-6 py-6">
            <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-4 text-sm text-blue-800">
              <p className="font-medium text-blue-900">Datos del emisor predefinidos</p>
              <p className="mt-1">
                Los datos fiscales y de contacto de la empresa se aplican automáticamente a cada factura emitida.
              </p>
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

            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-card-foreground">Contacto</label>
                  <div className="mt-2">
                    <ClientSearch
                      onClientSelect={handleClientSelect}
                      selectedClient={selectedClient}
                      placeholder="Selecciona un cliente o busca por nombre, NIF o ciudad..."
                      onAddNewClient={handleAddNewClient}
                    />
                    {selectedClient && (
                      <div className="mt-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-800">
                        <p className="font-medium text-green-900">{selectedClient.nombreORazonSocial}</p>
                        {selectedClient.NIF && <p>NIF: {selectedClient.NIF}</p>}
                        {selectedClient.domicilio && (
                          <p>
                            {selectedClient.domicilio.calle}, {selectedClient.domicilio.municipio}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground">Número de documento</label>
                  <input
                    type="text"
                    value={formData.numero || ''}
                    onChange={e => handleInputChange('numero', e.target.value)}
                    placeholder="F250001"
                    className={`${baseInputClasses} mt-2`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground">Fecha de expedición</label>
                  <input
                    type="date"
                    value={formData.fechaExpedicion || ''}
                    onChange={e => handleInputChange('fechaExpedicion', e.target.value)}
                    className={`${baseInputClasses} mt-2`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground">Fecha de vencimiento</label>
                  <input
                    type="date"
                    value={formData.fechaVencimiento || ''}
                    onChange={e => handleInputChange('fechaVencimiento', e.target.value)}
                    className={`${baseInputClasses} mt-2`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground">Serie</label>
                  <input
                    type="text"
                    value={formData.serie || ''}
                    onChange={e => handleInputChange('serie', e.target.value)}
                    placeholder="2024-A"
                    className={`${baseInputClasses} mt-2`}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground">Tipo de factura</label>
                  <select
                    value={formData.tipoFactura || 'ordinaria'}
                    onChange={e => handleInputChange('tipoFactura', e.target.value as TipoFactura)}
                    className={`${baseInputClasses} mt-2`}
                  >
                    <option value="ordinaria">Ordinaria (Completa)</option>
                    <option value="simplificada">Simplificada</option>
                    <option value="rectificativa">Rectificativa</option>
                    <option value="emitida">Factura Emitida</option>
                    <option value="recibida">Factura Recibida</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground">Lugar de emisión</label>
                  <input
                    type="text"
                    value={formData.lugarEmision || ''}
                    onChange={e => handleInputChange('lugarEmision', e.target.value)}
                    placeholder="Madrid"
                    className={`${baseInputClasses} mt-2`}
                  />
                </div>
              </div>

            </section>

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

            <section>
              <div className="overflow-hidden rounded-2xl border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div>
                    <h2 className="text-lg font-semibold text-card-foreground">Conceptos</h2>
                    <p className="text-sm text-muted-foreground">Detalla los servicios o productos incluidos.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addLine}
                    className="rounded-lg border border-accent px-3 py-2 text-sm font-medium text-accent hover:bg-accent/10"
                  >
                    + Añadir línea
                  </button>
                </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-border">
                      <thead className="bg-muted">
                        <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          <th className="px-5 py-3">Concepto</th>
                          <th className="px-5 py-3">Descripción</th>
                          <th className="px-5 py-3">Cantidad</th>
                          <th className="px-5 py-3">Precio</th>
                          <th className="px-5 py-3">Impuestos</th>
                          <th className="px-5 py-3 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border bg-card">
                        {(formData.lineas || []).map((linea, index) => (
                          <tr key={linea.id} className="align-top">
                            <td className="px-5 py-4">
                              <input
                                type="text"
                                value={linea.descripcion}
                                onChange={e => handleLineChange(index, 'descripcion', e.target.value)}
                                placeholder="Escribe el concepto o usa @ para buscar"
                                className={`${baseInputClasses} bg-white`}
                              />
                            </td>
                            <td className="px-5 py-4">
                              <textarea
                                value={linea.descripcionDetallada || ''}
                                onChange={e =>
                                  handleLineChange(index, 'descripcionDetallada', e.target.value)
                                }
                                placeholder="Añade una descripción que aparecerá en la factura"
                                rows={3}
                                className={`${baseInputClasses} h-[96px] resize-none bg-white`}
                              />
                            </td>
                            <td className="px-5 py-4">
                              <input
                                type="number"
                                value={linea.cantidad}
                                min={0}
                                step={0.01}
                                onChange={e =>
                                  handleLineChange(index, 'cantidad', Number(e.target.value) || 0)
                                }
                                className={`${baseInputClasses} bg-white`}
                              />
                              <div className="mt-3 text-xs text-muted-foreground">
                                Descuento (%)
                                <input
                                  type="number"
                                  value={linea.descuentoPct || 0}
                                  min={0}
                                  max={100}
                                  step={0.01}
                                  onChange={e =>
                                    handleLineChange(
                                      index,
                                      'descuentoPct',
                                      Number(e.target.value) || 0
                                    )
                                  }
                                  className={`${baseInputClasses} mt-1 bg-white`}
                                />
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <input
                                type="number"
                                value={linea.precioUnitario}
                                min={0}
                                step={0.01}
                                onChange={e =>
                                  handleLineChange(index, 'precioUnitario', Number(e.target.value) || 0)
                                }
                                className={`${baseInputClasses} bg-white`}
                              />
                            </td>
                            <td className="px-5 py-4">
                              <div className="space-y-3">
                                <select
                                  value={linea.tipoIVA || 21}
                                  onChange={e =>
                                    handleLineChange(index, 'tipoIVA', Number(e.target.value) as TipoIVA)
                                  }
                                  disabled={linea.exenta || (!hideISP && linea.inversionSujetoPasivo)}
                                  className={`${baseInputClasses} bg-white ${
                                    linea.exenta || (!hideISP && linea.inversionSujetoPasivo)
                                      ? 'cursor-not-allowed text-muted-foreground'
                                      : ''
                                  }`}
                                >
                                  {Object.entries(VAT_RATES)
                                    .filter(([rate]) => !allowedVATRates || allowedVATRates.includes(Number(rate)))
                                    .map(([rate, value]) => (
                                      <option key={rate} value={rate}>
                                        IVA {value}%
                                      </option>
                                    ))}
                                </select>
                                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                                  <label className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      checked={linea.exenta || false}
                                      onChange={e => {
                                        handleLineChange(index, 'exenta', e.target.checked)
                                        if (!hideISP) {
                                          if (e.target.checked) {
                                            handleLineChange(index, 'inversionSujetoPasivo', false)
                                          }
                                        }
                                      }}
                                      className="rounded border-input-border text-accent focus:ring-accent"
                                    />
                                    Exenta
                                  </label>
                                  {!hideISP && (
                                    <label className="flex items-center gap-2">
                                      <input
                                        type="checkbox"
                                        checked={linea.inversionSujetoPasivo || false}
                                        onChange={e => {
                                          handleLineChange(index, 'inversionSujetoPasivo', e.target.checked)
                                          if (e.target.checked) {
                                            handleLineChange(index, 'exenta', false)
                                          }
                                        }}
                                        className="rounded border-input-border text-accent focus:ring-accent"
                                      />
                                      ISP
                                    </label>
                                  )}
                                </div>
                                {linea.exenta && (
                                  <select
                                    value={linea.motivoExencion || ''}
                                    onChange={e =>
                                      handleLineChange(
                                        index,
                                        'motivoExencion',
                                        e.target.value as MotivoExencion
                                      )
                                    }
                                    className={`${baseInputClasses} bg-white`}
                                  >
                                    <option value="">Selecciona motivo de exención</option>
                                    {Object.entries(MOTIVOS_EXENCION).map(([key, value]) => (
                                      <option key={key} value={key}>
                                        {value}
                                      </option>
                                    ))}
                                  </select>
                                )}
                                {!hideRecargoEquivalencia && !linea.exenta && !(!hideISP && linea.inversionSujetoPasivo) && (
                                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span>Recargo equivalencia (%)</span>
                                    <input
                                      type="number"
                                      value={linea.recargoEquivalenciaPct || 0}
                                      min={0}
                                      max={10}
                                      step={0.1}
                                      onChange={e =>
                                        handleLineChange(
                                          index,
                                          'recargoEquivalenciaPct',
                                          Number(e.target.value) || 0
                                        )
                                      }
                                      className={`${baseInputClasses} w-20 bg-white`}
                                    />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-start justify-end gap-3">
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-card-foreground">
                                    {formatCurrency(linea.totalLinea || 0)}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    Base: {formatCurrency(linea.baseLinea || 0)}
                                  </p>
                                </div>
                                {formData.lineas && formData.lineas.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => removeLine(index)}
                                    className="rounded-full border border-transparent p-1 text-muted-foreground hover:border-red-200 hover:text-red-600"
                                  >
                                    ✕
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Document options section commented out
                  <div className="border-t border-gray-200 bg-gray-50 px-5 py-4">
                    <div className="grid gap-3 text-sm text-gray-600 md:grid-cols-2">
                      {DOCUMENT_OPTION_ITEMS.map(option => (
                        <label key={option.key} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={documentOptions[option.key]}
                            onChange={() => handleDocumentOptionToggle(option.key)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="flex items-center gap-2">
                            {option.label}
                            {option.badge && (
                              <span
                                className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                  option.badge === 'Mejorar plan'
                                    ? 'bg-purple-100 text-purple-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}
                              >
                                {option.badge}
                              </span>
                            )}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                  */}
              </div>
            </section>

            <section>
              <div className="rounded-2xl border border-border bg-card px-5 py-5">
                <div className="flex items-center justify-between text-sm text-card-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(formData.totales?.baseImponibleTotal || 0)}</span>
                </div>
                <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {formData.totales?.basesPorTipo?.map((base, index) => (
                    <div key={`${base.tipoIVA}-${index}`} className="flex justify-between">
                      <span>Base {base.tipoIVA}%</span>
                      <span>{formatCurrency(base.base)}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex items-center justify-between text-sm text-card-foreground">
                  <span>IVA</span>
                  <span>{formatCurrency(formData.totales?.cuotaIVATotal || 0)}</span>
                </div>
                {formData.totales?.cuotaRETotal && formData.totales.cuotaRETotal > 0 && (
                  <div className="mt-1 flex items-center justify-between text-sm text-card-foreground">
                    <span>Recargo equivalencia</span>
                    <span>{formatCurrency(formData.totales.cuotaRETotal)}</span>
                  </div>
                )}
                {/* Add discount button commented out
                <button
                  type="button"
                  className="mt-4 text-sm font-medium text-blue-600 hover:text-blue-700"
                >
                  + Añadir descuento
                </button>
                */}
                <div className="mt-4 border-t border-border pt-4">
                  <div className="flex items-center justify-between text-lg font-semibold text-card-foreground">
                    <span>Total</span>
                    <span>{formatCurrency(formData.totales?.totalFactura || 0)}</span>
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

            <section className="grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-border bg-card">
                <div className="border-b border-border px-5 py-4">
                  <h2 className="text-lg font-semibold text-card-foreground">Método de pago</h2>
                  <p className="text-sm text-muted-foreground">
                    Define cómo recibirá tu cliente el cobro de esta factura.
                  </p>
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground">
                      Selecciona una forma de pago
                    </label>
                    <select
                      value={formData.formaPago || 'Transferencia bancaria'}
                      onChange={e => handleInputChange('formaPago', e.target.value)}
                      className={`${baseInputClasses} mt-2`}
                    >
                      {FORMAS_PAGO.map(forma => (
                        <option key={forma} value={forma}>
                          {forma}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground">
                      Mensaje para el cliente
                    </label>
                    <textarea
                      value={formData.notas || ''}
                      onChange={e => handleInputChange('notas', e.target.value)}
                      rows={3}
                      placeholder="Añade instrucciones adicionales visibles para el cliente..."
                      className={`${baseInputClasses} mt-2 h-[96px] resize-none`}
                    />
                  </div>
                  {/* Payment gateway connection section commented out
                  <div className="rounded-xl border border-dashed border-blue-200 bg-blue-50 px-4 py-4">
                    <p className="text-sm font-medium text-blue-900">
                      Conecta tu pasarela de pago para cobrar online de forma rápida.
                    </p>
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-sm font-semibold text-blue-900">
                      {PAYMENT_PROVIDERS.map(provider => (
                        <span
                          key={provider}
                          className="rounded-full bg-white px-3 py-1 shadow-sm shadow-blue-100"
                        >
                          {provider}
                        </span>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="mt-4 rounded-lg border border-blue-300 bg-white px-4 py-2 text-sm font-medium text-blue-700 hover:bg-blue-50"
                    >
                      Conectar
                    </button>
                  </div>
                  */}
                </div>
              </div>

              {/* Categorización section commented out
              <div className="rounded-2xl border border-gray-200 bg-white">
                <div className="border-b border-gray-200 px-5 py-4">
                  <h2 className="text-lg font-semibold text-gray-900">Categorización</h2>
                  <p className="text-sm text-gray-500">
                    Clasifica la factura para tus informes contables internos.
                  </p>
                </div>
                <div className="space-y-4 px-5 py-5">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground">Cuenta contable</label>
                    <input
                      type="text"
                      value={categorization.account}
                      onChange={e =>
                        setCategorization(prev => ({
                          ...prev,
                          account: e.target.value
                        }))
                      }
                      className={`${baseInputClasses} mt-2`}
                    />
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={categorization.accountByConcept}
                      onChange={e =>
                        setCategorization(prev => ({
                          ...prev,
                          accountByConcept: e.target.checked
                        }))
                      }
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    Cuenta por concepto
                  </label>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="block text-sm font-medium text-card-foreground">Etiquetas</label>
                      <input
                        type="text"
                        value={categorization.tags}
                        onChange={e =>
                          setCategorization(prev => ({
                            ...prev,
                            tags: e.target.value
                          }))
                        }
                        placeholder="Añade etiquetas separadas por coma"
                        className={`${baseInputClasses} mt-2`}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-card-foreground">Etiquetas por concepto</label>
                      <input
                        type="text"
                        value={categorization.conceptTags}
                        onChange={e =>
                          setCategorization(prev => ({
                            ...prev,
                            conceptTags: e.target.value
                          }))
                        }
                        placeholder="Marca conceptos específicos"
                        className={`${baseInputClasses} mt-2`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground">Nota interna</label>
                    <textarea
                      value={categorization.internalNote}
                      onChange={e =>
                        setCategorization(prev => ({
                          ...prev,
                          internalNote: e.target.value
                        }))
                      }
                      rows={3}
                      className={`${baseInputClasses} mt-2 h-[96px] resize-none`}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground">Asignar usuarios</label>
                    <input
                      type="text"
                      value={categorization.assignedUsers}
                      onChange={e =>
                        setCategorization(prev => ({
                          ...prev,
                          assignedUsers: e.target.value
                        }))
                      }
                      placeholder="Busca usuarios internos"
                      className={`${baseInputClasses} mt-2`}
                    />
                  </div>
                  <button
                    type="button"
                    className="text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    + Asignar a proyecto
                  </button>
                </div>
              </div>
              */}
            </section>
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
              {loading ? 'Guardando...' : approveLabel}
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
    </div>
  )
}
