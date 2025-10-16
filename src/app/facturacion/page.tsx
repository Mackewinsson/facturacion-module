'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { MockInvoiceService, Invoice } from '@/lib/mock-data'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function FacturacionPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('ALL')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({
    fechaDesde: '',
    fechaHasta: '',
    importeMinimo: '',
    importeMaximo: '',
    formaPago: '',
    lugarEmision: ''
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadInvoices()
  }, [isAuthenticated, router, currentPage, statusFilter, searchTerm, filters])

  // Debounced search effect
  useEffect(() => {
    if (!isAuthenticated) return
    
    const timeoutId = setTimeout(() => {
      setCurrentPage(1)
      loadInvoices()
    }, 300) // 300ms delay for debouncing

    return () => clearTimeout(timeoutId)
  }, [searchTerm])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await MockInvoiceService.getInvoices({
        page: currentPage,
        limit: 10,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
        search: searchTerm || undefined,
        filters: filters
      })
      
      setInvoices(data.invoices)
      setTotalPages(data.pagination.pages)
      setTotalResults(data.pagination.total)
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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadInvoices()
  }

  const handleStatusFilter = (status: string) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleCreateInvoice = () => {
    router.push('/facturacion/nueva')
  }

  const handleEditInvoice = (id: number) => {
    router.push(`/facturacion/editar/${id}`)
  }

  const handleViewInvoice = (id: number) => {
    router.push(`/facturacion/ver/${id}`)
  }

  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }))
    setCurrentPage(1)
  }

  const clearFilters = () => {
    setFilters({
      fechaDesde: '',
      fechaHasta: '',
      importeMinimo: '',
      importeMaximo: '',
      formaPago: '',
      lugarEmision: ''
    })
    setCurrentPage(1)
  }

  const applyFilters = () => {
    setCurrentPage(1)
    loadInvoices()
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
      <div className="bg-background">
        <div className="max-w-7xl mx-auto p-4">
        {/* Header */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-foreground">Facturación</h1>
              <p className="text-sm sm:text-base text-muted-foreground">Gestiona tus facturas y clientes</p>
            </div>
            <button
              onClick={handleCreateInvoice}
              className="mt-4 sm:mt-0 bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-md text-sm font-medium"
            >
              + Nueva Factura
            </button>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar por número, cliente, fecha, importes, dirección, estado, tipo..."
                  className="flex-1 px-3 py-2 border-2 border-input-border bg-input rounded-md focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent text-base text-foreground placeholder-muted-foreground"
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 text-base font-medium"
                >
                  Buscar
                </button>
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-base font-medium"
                    title="Limpiar búsqueda"
                  >
                    ✕
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2 rounded-md text-base font-medium ${
                    showFilters 
                      ? 'bg-accent text-accent-foreground' 
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  title="Filtros avanzados"
                >
                  🔍 Filtros
                </button>
              </div>
            </form>

            {/* Status Filter */}
            <div className="flex gap-2">
              {['ALL', 'DRAFT', 'SENT', 'PAID', 'OVERDUE', 'CANCELLED'].map((status) => (
                <button
                  key={status}
                  onClick={() => handleStatusFilter(status)}
                  className={`px-3 py-2 rounded-md text-sm font-medium ${
                    statusFilter === status
                      ? 'bg-accent text-accent-foreground'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  {status === 'ALL' ? 'Todas' : getStatusText(status)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="bg-card rounded-lg shadow-sm border border-border p-4 sm:p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-card-foreground">Filtros Avanzados</h3>
              <button
                onClick={clearFilters}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Limpiar todos
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Fecha Desde */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.fechaDesde}
                  onChange={(e) => handleFilterChange('fechaDesde', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Fecha Hasta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.fechaHasta}
                  onChange={(e) => handleFilterChange('fechaHasta', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Importe Mínimo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importe Mínimo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.importeMinimo}
                  onChange={(e) => handleFilterChange('importeMinimo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              {/* Importe Máximo */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Importe Máximo (€)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={filters.importeMaximo}
                  onChange={(e) => handleFilterChange('importeMaximo', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="999999.99"
                />
              </div>

              {/* Forma de Pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma de Pago
                </label>
                <select
                  value={filters.formaPago}
                  onChange={(e) => handleFilterChange('formaPago', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas las formas</option>
                  <option value="Transferencia bancaria">Transferencia bancaria</option>
                  <option value="Efectivo">Efectivo</option>
                  <option value="Tarjeta de crédito">Tarjeta de crédito</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>


              {/* Lugar de Emisión */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Lugar de Emisión
                </label>
                <input
                  type="text"
                  value={filters.lugarEmision}
                  onChange={(e) => handleFilterChange('lugarEmision', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Madrid, Barcelona..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                onClick={clearFilters}
                className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 text-sm font-medium"
              >
                Limpiar
              </button>
              <button
                onClick={applyFilters}
                className="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/90 text-sm font-medium"
              >
                Aplicar Filtros
              </button>
            </div>
          </div>
        )}

        {/* Search Results Info */}
        {(searchTerm || Object.values(filters).some(filter => filter !== '')) && (
          <div className="bg-blue-50 border border-blue-200 text-blue-800 px-4 py-3 rounded mb-4">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <span className="font-medium">
                {totalResults} resultado{totalResults !== 1 ? 's' : ''} encontrado{totalResults !== 1 ? 's' : ''}
                {searchTerm && ` para "${searchTerm}"`}
                {Object.values(filters).some(filter => filter !== '') && ' con filtros aplicados'}
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
        <div className="bg-white rounded-lg shadow-sm border">
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
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
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
                      <tr key={invoice.id} className="hover:bg-gray-50">
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
                              onClick={() => handleViewInvoice(invoice.id)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleEditInvoice(invoice.id)}
                              className="text-green-600 hover:text-green-900"
                            >
                              Editar
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Anterior
                    </button>
                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Siguiente
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Página <span className="font-medium">{currentPage}</span> de{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Anterior
                        </button>
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Siguiente
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

      </div>
      </div>
    </LayoutWithSidebar>
  )
}

