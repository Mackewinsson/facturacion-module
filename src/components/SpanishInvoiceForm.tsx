'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MockInvoiceService, Invoice, TipoFactura, TipoCliente, TipoIVA, MotivoExencion, CausaRectificacion, LineaFactura, Domicilio } from '@/lib/mock-data'
import { 
  VAT_RATES, 
  RECARGO_EQUIVALENCIA_RATES, 
  MOTIVOS_EXENCION, 
  CAUSAS_RECTIFICACION, 
  FORMAS_PAGO,
  validateNIF,
  validateNIFIVA,
  calculateLineBase,
  calculateLineVAT,
  calculateLineRE,
  calculateLineTotal,
  calculateInvoiceTotals,
  generateMencionesObligatorias,
  validateInvoiceByType
} from '@/lib/spanish-tax-calculations'

interface SpanishInvoiceFormProps {
  initialData?: Partial<Invoice>
  invoiceId?: number
  isEdit?: boolean
}

export default function SpanishInvoiceForm({ initialData, invoiceId, isEdit = false }: SpanishInvoiceFormProps) {
  const router = useRouter()
  
  // Form state
  const [formData, setFormData] = useState<Partial<Invoice>>({
    tipoFactura: 'ordinaria',
    serie: '2024-A',
    numero: '',
    fechaExpedicion: new Date().toISOString().split('T')[0],
    fechaOperacion: '',
    moneda: 'EUR',
    lugarEmision: '',
    
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
      iban: ''
    },
    
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
    
    lineas: [{
      id: 1,
      descripcion: '',
      cantidad: 1,
      precioUnitario: 0,
      descuentoPct: 0,
      tipoIVA: 21,
      baseLinea: 0,
      cuotaIVA: 0,
      cuotaRE: 0,
      totalLinea: 0
    }],
    
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

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  useEffect(() => {
    calculateTotals()
  }, [formData.lineas])

  const calculateTotals = () => {
    if (!formData.lineas) return
    
    // Recalculate line totals
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
    
    // Calculate invoice totals
    const totales = calculateInvoiceTotals(updatedLineas)
    
    setFormData(prev => ({
      ...prev,
      lineas: updatedLineas,
      totales
    }))
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = field.split('.')
      
      if (keys.length === 1) {
        newData[keys[0] as keyof Invoice] = value
      } else if (keys.length === 2) {
        if (!newData[keys[0] as keyof Invoice]) {
          newData[keys[0] as keyof Invoice] = {} as any
        }
        (newData[keys[0] as keyof Invoice] as any)[keys[1]] = value
      } else if (keys.length === 3) {
        if (!newData[keys[0] as keyof Invoice]) {
          newData[keys[0] as keyof Invoice] = {} as any
        }
        if (!(newData[keys[0] as keyof Invoice] as any)[keys[1]]) {
          (newData[keys[0] as keyof Invoice] as any)[keys[1]] = {}
        }
        (newData[keys[0] as keyof Invoice] as any)[keys[1]][keys[2]] = value
      }
      
      return newData
    })
  }

  const handleLineChange = (index: number, field: keyof LineaFactura, value: any) => {
    const newLineas = [...(formData.lineas || [])]
    newLineas[index] = { ...newLineas[index], [field]: value }
    
    setFormData(prev => ({
      ...prev,
      lineas: newLineas
    }))
  }

  const addLine = () => {
    const newLine: LineaFactura = {
      id: Date.now(),
      descripcion: '',
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setValidationErrors([])

    try {
      // Validate form
      const errors = validateInvoiceByType(formData)
      if (errors.length > 0) {
        setValidationErrors(errors)
        return
      }

      if (isEdit && invoiceId) {
        // Update existing invoice
        const updatedInvoice = await MockInvoiceService.updateInvoice(invoiceId, formData)
        if (updatedInvoice) {
          router.push('/facturacion')
        } else {
          setError('Error al actualizar la factura')
        }
      } else {
        // Create new invoice
        const newInvoice = await MockInvoiceService.createInvoice(formData as any)
        if (newInvoice) {
          router.push('/facturacion')
        } else {
          setError('Error al crear la factura')
        }
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
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

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          {isEdit ? 'Editar Factura' : 'Nueva Factura'} - {formData.tipoFactura?.toUpperCase()}
        </h1>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {validationErrors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <h3 className="font-bold mb-2">Errores de validación:</h3>
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Encabezado */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Encabezado</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Factura *
                </label>
                <select
                  value={formData.tipoFactura || 'ordinaria'}
                  onChange={(e) => handleInputChange('tipoFactura', e.target.value as TipoFactura)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="ordinaria">Ordinaria (Completa)</option>
                  <option value="simplificada">Simplificada</option>
                  <option value="rectificativa">Rectificativa</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Serie
                </label>
                <input
                  type="text"
                  value={formData.serie || ''}
                  onChange={(e) => handleInputChange('serie', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="2024-A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número
                </label>
                <input
                  type="text"
                  value={formData.numero || ''}
                  onChange={(e) => handleInputChange('numero', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="00001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Expedición *
                </label>
                <input
                  type="date"
                  value={formData.fechaExpedicion || ''}
                  onChange={(e) => handleInputChange('fechaExpedicion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Operación
                </label>
                <input
                  type="date"
                  value={formData.fechaOperacion || ''}
                  onChange={(e) => handleInputChange('fechaOperacion', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Moneda
                </label>
                <select
                  value={formData.moneda || 'EUR'}
                  onChange={(e) => handleInputChange('moneda', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="EUR">EUR - Euro</option>
                  <option value="USD">USD - Dólar</option>
                </select>
              </div>
            </div>
          </div>

          {/* Emisor */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Datos del Emisor</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre o Razón Social *
                </label>
                <input
                  type="text"
                  value={formData.emisor?.nombreORazonSocial || ''}
                  onChange={(e) => handleInputChange('emisor.nombreORazonSocial', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIF *
                </label>
                <input
                  type="text"
                  value={formData.emisor?.NIF || ''}
                  onChange={(e) => handleInputChange('emisor.NIF', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Domicilio *
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                  <input
                    type="text"
                    value={formData.emisor?.domicilio?.calle || ''}
                    onChange={(e) => handleInputChange('emisor.domicilio.calle', e.target.value)}
                    placeholder="Calle"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={formData.emisor?.domicilio?.codigoPostal || ''}
                    onChange={(e) => handleInputChange('emisor.domicilio.codigoPostal', e.target.value)}
                    placeholder="Código Postal"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={formData.emisor?.domicilio?.municipio || ''}
                    onChange={(e) => handleInputChange('emisor.domicilio.municipio', e.target.value)}
                    placeholder="Municipio"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={formData.emisor?.domicilio?.provincia || ''}
                    onChange={(e) => handleInputChange('emisor.domicilio.provincia', e.target.value)}
                    placeholder="Provincia"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    type="text"
                    value={formData.emisor?.domicilio?.pais || ''}
                    onChange={(e) => handleInputChange('emisor.domicilio.pais', e.target.value)}
                    placeholder="País"
                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  IBAN
                </label>
                <input
                  type="text"
                  value={formData.emisor?.iban || ''}
                  onChange={(e) => handleInputChange('emisor.iban', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ES91 2100 0418 4502 0005 1332"
                />
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Datos del Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Cliente *
                </label>
                <select
                  value={formData.cliente?.tipo || 'particular'}
                  onChange={(e) => handleInputChange('cliente.tipo', e.target.value as TipoCliente)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="particular">Particular</option>
                  <option value="empresario/profesional">Empresario/Profesional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre o Razón Social *
                </label>
                <input
                  type="text"
                  value={formData.cliente?.nombreORazonSocial || ''}
                  onChange={(e) => handleInputChange('cliente.nombreORazonSocial', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NIF {formData.cliente?.tipo === 'empresario/profesional' && '*'}
                </label>
                <input
                  type="text"
                  value={formData.cliente?.NIF || ''}
                  onChange={(e) => handleInputChange('cliente.NIF', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required={formData.cliente?.tipo === 'empresario/profesional'}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País *
                </label>
                <input
                  type="text"
                  value={formData.cliente?.pais || ''}
                  onChange={(e) => handleInputChange('cliente.pais', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {formData.tipoFactura === 'ordinaria' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Domicilio {formData.cliente?.tipo === 'empresario/profesional' && '*'}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      value={formData.cliente?.domicilio?.calle || ''}
                      onChange={(e) => handleInputChange('cliente.domicilio.calle', e.target.value)}
                      placeholder="Calle"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required={formData.cliente?.tipo === 'empresario/profesional'}
                    />
                    <input
                      type="text"
                      value={formData.cliente?.domicilio?.codigoPostal || ''}
                      onChange={(e) => handleInputChange('cliente.domicilio.codigoPostal', e.target.value)}
                      placeholder="Código Postal"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={formData.cliente?.domicilio?.municipio || ''}
                      onChange={(e) => handleInputChange('cliente.domicilio.municipio', e.target.value)}
                      placeholder="Municipio"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={formData.cliente?.domicilio?.provincia || ''}
                      onChange={(e) => handleInputChange('cliente.domicilio.provincia', e.target.value)}
                      placeholder="Provincia"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      value={formData.cliente?.domicilio?.pais || ''}
                      onChange={(e) => handleInputChange('cliente.domicilio.pais', e.target.value)}
                      placeholder="País"
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Campos específicos para rectificativa */}
          {formData.tipoFactura === 'rectificativa' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Datos de Rectificación</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Causa de Rectificación *
                  </label>
                  <select
                    value={formData.causaRectificacion || 'error'}
                    onChange={(e) => handleInputChange('causaRectificacion', e.target.value as CausaRectificacion)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {Object.entries(CAUSAS_RECTIFICACION).map(([key, value]) => (
                      <option key={key} value={key}>{value}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Facturas Rectificadas *
                  </label>
                  <input
                    type="text"
                    value={formData.referenciasFacturasRectificadas?.join(', ') || ''}
                    onChange={(e) => handleInputChange('referenciasFacturasRectificadas', e.target.value.split(',').map(s => s.trim()).filter(s => s))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="2024-A-00001, 2024-A-00002"
                    required
                  />
                </div>
              </div>
            </div>
          )}

          {/* Líneas de factura */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Líneas de Factura</h2>
              <button
                type="button"
                onClick={addLine}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                + Añadir Línea
              </button>
            </div>

            <div className="space-y-4">
              {formData.lineas?.map((linea, index) => (
                <div key={linea.id} className="bg-white p-4 border border-gray-200 rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción *
                      </label>
                      <input
                        type="text"
                        value={linea.descripcion}
                        onChange={(e) => handleLineChange(index, 'descripcion', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad *
                      </label>
                      <input
                        type="number"
                        value={linea.cantidad}
                        onChange={(e) => handleLineChange(index, 'cantidad', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio Unitario *
                      </label>
                      <input
                        type="number"
                        value={linea.precioUnitario}
                        onChange={(e) => handleLineChange(index, 'precioUnitario', Number(e.target.value))}
                        min="0"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descuento (%)
                      </label>
                      <input
                        type="number"
                        value={linea.descuentoPct || 0}
                        onChange={(e) => handleLineChange(index, 'descuentoPct', Number(e.target.value))}
                        min="0"
                        max="100"
                        step="0.01"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div className="flex items-end">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm font-medium">
                          {formatCurrency(linea.totalLinea)}
                        </div>
                      </div>
                      {formData.lineas && formData.lineas.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLine(index)}
                          className="ml-2 text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Régimen de IVA por línea */}
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo IVA
                      </label>
                      <select
                        value={linea.tipoIVA || 21}
                        onChange={(e) => handleLineChange(index, 'tipoIVA', Number(e.target.value) as TipoIVA)}
                        disabled={linea.exenta || linea.inversionSujetoPasivo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {Object.entries(VAT_RATES).map(([rate, value]) => (
                          <option key={rate} value={rate}>{value}%</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`exenta-${index}`}
                        checked={linea.exenta || false}
                        onChange={(e) => {
                          handleLineChange(index, 'exenta', e.target.checked)
                          if (e.target.checked) {
                            handleLineChange(index, 'inversionSujetoPasivo', false)
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`exenta-${index}`} className="text-sm font-medium text-gray-700">
                        Exenta
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`isp-${index}`}
                        checked={linea.inversionSujetoPasivo || false}
                        onChange={(e) => {
                          handleLineChange(index, 'inversionSujetoPasivo', e.target.checked)
                          if (e.target.checked) {
                            handleLineChange(index, 'exenta', false)
                          }
                        }}
                        className="mr-2"
                      />
                      <label htmlFor={`isp-${index}`} className="text-sm font-medium text-gray-700">
                        ISP
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Recargo Eq. (%)
                      </label>
                      <input
                        type="number"
                        value={linea.recargoEquivalenciaPct || 0}
                        onChange={(e) => handleLineChange(index, 'recargoEquivalenciaPct', Number(e.target.value))}
                        min="0"
                        max="10"
                        step="0.1"
                        disabled={linea.exenta || linea.inversionSujetoPasivo}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  {linea.exenta && (
                    <div className="mt-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Motivo de Exención *
                      </label>
                      <select
                        value={linea.motivoExencion || ''}
                        onChange={(e) => handleLineChange(index, 'motivoExencion', e.target.value as MotivoExencion)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                      >
                        <option value="">Seleccionar motivo</option>
                        {Object.entries(MOTIVOS_EXENCION).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Totales</h2>
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                {formData.totales?.basesPorTipo?.map((base, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span className="text-gray-600">Base {base.tipoIVA}%:</span>
                    <span className="text-gray-900">{formatCurrency(base.base)}</span>
                  </div>
                ))}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Imponible Total:</span>
                  <span className="text-gray-900">{formatCurrency(formData.totales?.baseImponibleTotal || 0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Cuota IVA Total:</span>
                  <span className="text-gray-900">{formatCurrency(formData.totales?.cuotaIVATotal || 0)}</span>
                </div>
                {formData.totales?.cuotaRETotal && formData.totales.cuotaRETotal > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Cuota RE Total:</span>
                    <span className="text-gray-900">{formatCurrency(formData.totales.cuotaRETotal)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold border-t border-gray-300 pt-2">
                  <span className="text-gray-900">Total Factura:</span>
                  <span className="text-gray-900">{formatCurrency(formData.totales?.totalFactura || 0)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Menciones obligatorias */}
          {getMencionesObligatorias().length > 0 && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Menciones Obligatorias</h2>
              <div className="space-y-2">
                {getMencionesObligatorias().map((mencion, index) => (
                  <div key={index} className="text-sm text-gray-700 bg-yellow-100 p-2 rounded">
                    {mencion}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pago y notas */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-4">Pago y Notas</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Forma de Pago
                </label>
                <select
                  value={formData.formaPago || 'Transferencia bancaria'}
                  onChange={(e) => handleInputChange('formaPago', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {FORMAS_PAGO.map((forma) => (
                    <option key={forma} value={forma}>{forma}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fecha de Vencimiento
                </label>
                <input
                  type="date"
                  value={formData.fechaVencimiento || ''}
                  onChange={(e) => handleInputChange('fechaVencimiento', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas
                </label>
                <textarea
                  value={formData.notas || ''}
                  onChange={(e) => handleInputChange('notas', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Notas adicionales para la factura..."
                />
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.push('/facturacion')}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? 'Guardando...' : (isEdit ? 'Actualizar Factura' : 'Crear Factura')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
