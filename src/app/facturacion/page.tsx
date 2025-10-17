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
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
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
    fechaDesde: '2025-08-25',
    fechaHasta: '2025-09-24'
  })

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    loadInvoices()
  }, [isAuthenticated, router, currentPage, columnFilters, dateRange])

  const loadInvoices = async () => {
    try {
      setLoading(true)
      const data = await MockInvoiceService.getInvoices({
        page: currentPage,
        limit: 10,
        columnFilters: columnFilters,
        filters: {
          fechaDesde: dateRange.fechaDesde,
          fechaHasta: dateRange.fechaHasta
        }
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



  const handleCreateInvoice = () => {
    router.push('/facturacion/nueva')
  }

  const handleEditInvoice = (id: number) => {
    router.push(`/facturacion/editar/${id}`)
  }

  const handleViewInvoice = (id: number) => {
    router.push(`/facturacion/ver/${id}`)
  }

  const handleColumnFilterChange = (columnName: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: value
    }))
    setCurrentPage(1)
  }

  const handleDateRangeChange = (field: 'fechaDesde' | 'fechaHasta', value: string) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }))
    setCurrentPage(1)
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


        {/* Toolbar */}
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left Side - Action Buttons */}
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
              
              <button
                onClick={handleCreateInvoice}
                className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nuevo
              </button>
              
              <button className="flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-md text-sm font-medium">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Salir
              </button>
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
        {(Object.values(columnFilters).some(filter => filter !== '') || dateRange.fechaDesde !== '2025-08-25' || dateRange.fechaHasta !== '2025-09-24') && (
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

