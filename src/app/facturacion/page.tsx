'use client'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { MockInvoiceService, Invoice } from '@/lib/mock-data'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'
import InvoiceModal from '@/components/InvoiceModal'

function FacturacionPageContent() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [tipoFilter, setTipoFilter] = useState<'ALL' | 'emitida' | 'recibida'>('ALL')
  const [columnFilters, setColumnFilters] = useState({
    factura: '',
    fecha: '',
    nif: '',
    cliente: '',
    baseImponible: '',
    iva: '',
    total: '',
    direccion: '',
    poblacion: '',
    provincia: '',
    codigoPostal: '',
    formaPago: '',
    medioPago: '',
    estado: ''
  })
  const [dateRange, setDateRange] = useState({
    fechaDesde: '2024-01-01',
    fechaHasta: '2025-12-31'
  })
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    // Authentication disabled for development
    // if (!isAuthenticated) {
    //   router.push('/login')
    //   return
    // }
    loadInvoices()
  }, [isAuthenticated, router, columnFilters, dateRange, tipoFilter])

  // Initialize tipoFilter from URL or localStorage
  useEffect(() => {
    const urlTipo = searchParams.get('tipo')
    const validTipos = ['ALL', 'emitida', 'recibida']
    if (urlTipo && validTipos.includes(urlTipo)) {
      setTipoFilter(urlTipo as 'ALL' | 'emitida' | 'recibida')
      return
    }
    const saved = typeof window !== 'undefined' ? localStorage.getItem('facturacion.tipoFilter') : null
    if (saved && validTipos.includes(saved)) {
      setTipoFilter(saved as 'ALL' | 'emitida' | 'recibida')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist tipoFilter to URL and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('facturacion.tipoFilter', tipoFilter)
      } catch {}
    }
    // Sync query param without losing other params
    const params = new URLSearchParams(searchParams.toString())
    if (tipoFilter === 'ALL') {
      params.delete('tipo')
    } else {
      params.set('tipo', tipoFilter)
    }
    const queryString = params.toString()
    const href = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(href)
  }, [tipoFilter, pathname, router, searchParams])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await MockInvoiceService.getInvoices({
        page: 1,
        limit: 1000, // Load all invoices
        columnFilters: columnFilters,
        filters: {
          fechaDesde: dateRange.fechaDesde,
          fechaHasta: dateRange.fechaHasta
        }
      })

      // Apply client-side filter for tipo de factura (emitida/recibida)
      const filteredByTipo = tipoFilter === 'ALL'
        ? data.invoices
        : data.invoices.filter(inv => inv.tipoFactura === tipoFilter)

      setInvoices(filteredByTipo)
      setTotalResults(filteredByTipo.length)
    } catch (err) {
      setError('Error al cargar las facturas')
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-secondary text-secondary-foreground'
      case 'SENT': return 'bg-info/20 text-info'
      case 'PAID': return 'bg-success/20 text-success'
      case 'OVERDUE': return 'bg-error/20 text-error'
      case 'CANCELLED': return 'bg-warning/20 text-warning'
      default: return 'bg-secondary text-secondary-foreground'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Borrador'
      case 'SENT': return 'Enviada'
      case 'PAID': return 'Pagada'
      case 'OVERDUE': return 'Vencida'
      case 'CANCELLED': return 'Cancelada'
      default: return status
    }
  }



  const handleCreateInvoice = () => {
    router.push('/facturacion/nueva')
  }

  const handleViewInvoice = (id: number) => {
    router.push(`/facturacion/editar/${id}`)
  }

  const handleRowClick = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedInvoice(null)
  }


  const handleModalView = (id: number) => {
    handleCloseModal()
    handleViewInvoice(id)
  }

  const handleModalPrint = (id: number) => {
    // TODO: Implement print functionality
    console.log('Print invoice:', id)
  }


  const handleColumnFilterChange = (columnName: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: value
    }))
  }

  const handleDateRangeChange = (field: 'fechaDesde' | 'fechaHasta', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatDateForDisplay = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Authentication disabled for development
  // if (!isAuthenticated) {
  //   return null
  // }

  return (
    <LayoutWithSidebar>
      <div className="bg-background h-screen flex flex-col">
        <div className="w-full p-4 flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Facturación</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Gestiona tus facturas y clientes</p>
            </div>
          </div>
        </div>


        {/* Toolbar */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left Side - Action Buttons */}
            <div className="flex items-center gap-3">
              
              
              <button
                onClick={handleCreateInvoice}
                className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Factura
              </button>

              {/* Dropdown: Filtrar por tipo de factura */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <select
                  value={tipoFilter}
                  onChange={(e) => setTipoFilter(e.target.value as 'ALL' | 'emitida' | 'recibida')}
                  className="px-3 py-2 border border-input-border bg-input rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-foreground"
                  title="Filtrar por tipo de factura"
                >
                  <option value="ALL">Todas</option>
                  <option value="emitida">Emitidas</option>
                  <option value="recibida">Recibidas</option>
                </select>
              </div>
            </div>

            {/* Center - Centro Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Centro</span>
              <select className="px-3 py-2 border border-input-border bg-input rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent">
                <option>MOTOS</option>
              </select>
            </div>

            {/* Right Side - Date Range */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 px-3 py-2 border border-input-border bg-input rounded-md">
                <input
                  type="date"
                  value={dateRange.fechaDesde}
                  onChange={(e) => handleDateRangeChange('fechaDesde', e.target.value)}
                  className="text-sm font-medium text-foreground bg-transparent border-none outline-none cursor-pointer"
                />
              </div>
              <button className="p-2 text-muted-foreground hover:text-foreground">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
              <div className="flex items-center gap-2 px-3 py-2 border border-input-border bg-input rounded-md">
                <input
                  type="date"
                  value={dateRange.fechaHasta}
                  onChange={(e) => handleDateRangeChange('fechaHasta', e.target.value)}
                  className="text-sm font-medium text-foreground bg-transparent border-none outline-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Search Results Info */}
        {(Object.values(columnFilters).some(filter => filter !== '') || dateRange.fechaDesde !== '2024-01-01' || dateRange.fechaHasta !== '2025-12-31') && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''} con filtros aplicados
                {(dateRange.fechaDesde !== '2025-08-25' || dateRange.fechaHasta !== '2025-09-24') && 
                  ` (${formatDateForDisplay(dateRange.fechaDesde)} - ${formatDateForDisplay(dateRange.fechaHasta)})`
                }
              </span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Invoices List */}
        <div className="bg-white rounded-lg shadow-sm border flex flex-col flex-1 min-h-0 overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="text-gray-500">Cargando facturas...</div>
            </div>
          ) : invoices.length === 0 ? (
            <div className="p-8 text-center">
              <div className="text-gray-500 mb-4">No se encontraron facturas</div>
              <button
                onClick={handleCreateInvoice}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                Crear primera factura
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col flex-1 min-h-0">
                <div className="overflow-auto flex-1">
                  <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    {/* Filter Row */}
                    <tr className="border-b border-gray-200">
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.factura}
                          onChange={(e) => handleColumnFilterChange('factura', e.target.value)}
                          placeholder="Filtrar factura..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.fecha}
                          onChange={(e) => handleColumnFilterChange('fecha', e.target.value)}
                          placeholder="Filtrar fecha..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.nif}
                          onChange={(e) => handleColumnFilterChange('nif', e.target.value)}
                          placeholder="Filtrar NIF..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.cliente}
                          onChange={(e) => handleColumnFilterChange('cliente', e.target.value)}
                          placeholder="Filtrar cliente..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.baseImponible}
                          onChange={(e) => handleColumnFilterChange('baseImponible', e.target.value)}
                          placeholder="Filtrar base..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.iva}
                          onChange={(e) => handleColumnFilterChange('iva', e.target.value)}
                          placeholder="Filtrar IVA..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.total}
                          onChange={(e) => handleColumnFilterChange('total', e.target.value)}
                          placeholder="Filtrar total..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.direccion}
                          onChange={(e) => handleColumnFilterChange('direccion', e.target.value)}
                          placeholder="Filtrar dirección..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.poblacion}
                          onChange={(e) => handleColumnFilterChange('poblacion', e.target.value)}
                          placeholder="Filtrar población..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.provincia}
                          onChange={(e) => handleColumnFilterChange('provincia', e.target.value)}
                          placeholder="Filtrar provincia..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.codigoPostal}
                          onChange={(e) => handleColumnFilterChange('codigoPostal', e.target.value)}
                          placeholder="Filtrar C.P...."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.formaPago}
                          onChange={(e) => handleColumnFilterChange('formaPago', e.target.value)}
                          placeholder="Filtrar forma pago..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.medioPago}
                          onChange={(e) => handleColumnFilterChange('medioPago', e.target.value)}
                          placeholder="Filtrar medio pago..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        <input
                          type="text"
                          value={columnFilters.estado}
                          onChange={(e) => handleColumnFilterChange('estado', e.target.value)}
                          placeholder="Filtrar estado..."
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                      </th>
                      <th className="px-3 py-2">
                        {/* No filter for actions column */}
                      </th>
                    </tr>
                    {/* Header Row */}
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Factura
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fecha
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        NIF
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cliente
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Base Imponible
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IVA
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Dirección
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Población
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Provincia
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        C.P.
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Forma Pago
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Medio Pago
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {invoices.map((invoice) => (
                      <tr 
                        key={invoice.id} 
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => handleRowClick(invoice)}
                      >
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.serie ? `${invoice.serie}-${invoice.numero}` : invoice.numero} ({invoice.tipoFactura})
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(invoice.fechaExpedicion)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.cliente.NIF || '-'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.cliente.nombreORazonSocial}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.totales.baseImponibleTotal)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatCurrency(invoice.totales.cuotaIVATotal)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.totales.totalFactura)}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.cliente.domicilio?.calle || '-'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.cliente.domicilio?.municipio || '-'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.cliente.domicilio?.provincia || '-'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.cliente.domicilio?.codigoPostal || '-'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.formaPago || '-'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm text-gray-900">
                          {invoice.medioPago || '-'}
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                            {getStatusText(invoice.status)}
                          </span>
                        </td>
                        <td className="px-3 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleViewInvoice(invoice.id)
                              }}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  </table>
                </div>
              </div>

            </>
          )}
        </div>

      </div>
      </div>

      {/* Invoice Modal */}
      <InvoiceModal
        invoice={selectedInvoice}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onPrint={handleModalPrint}
        onView={handleModalView}
      />
    </LayoutWithSidebar>
  )
}

export default function FacturacionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FacturacionPageContent />
    </Suspense>
  )
}

