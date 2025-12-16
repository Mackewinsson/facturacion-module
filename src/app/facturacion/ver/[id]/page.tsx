'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { InvoiceFromDb } from '@/lib/invoice-db-service'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function VerFacturaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated, token } = useAuthStore()
  const [invoice, setInvoice] = useState<InvoiceFromDb | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Authentication disabled for development
    // if (!isAuthenticated) {
    //   router.push('/login')
    //   return
    // }
    loadInvoice()
  }, [isAuthenticated, router, params.id])

  const loadInvoice = async () => {
    try {
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`/api/invoices/${params.id}`, {
        cache: 'no-store',
        headers
      })
      if (!response.ok) {
        setError('Error al cargar la factura')
        return
      }
      const data = await response.json()
      if (data?.success && data?.data) {
        setInvoice(data.data as InvoiceFromDb)
      } else {
        setError('Factura no encontrada')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES')
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

  const handlePrint = () => window.print()
  const handleEdit = () => router.push(`/facturacion/editar/${params.id}`)

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-muted-foreground">Cargando factura...</div>
        </div>
      </LayoutWithSidebar>
    )
  }

  if (error || !invoice) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error || 'Factura no encontrada'}</div>
            <button
              onClick={() => router.push('/facturacion')}
              className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-md"
            >
              Volver a Facturación
            </button>
          </div>
        </div>
      </LayoutWithSidebar>
    )
  }

  return (
    <LayoutWithSidebar>
      <div className="bg-background p-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex justify-between items-center">
            <button
              onClick={() => router.push('/facturacion')}
              className="text-blue-600 hover:text-blue-800"
            >
              ← Volver a Facturación
            </button>
            <div className="flex gap-2">
              <button
                onClick={handleEdit}
                className="bg-success hover:bg-success/90 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Editar
              </button>
              <button
                onClick={handlePrint}
                className="bg-accent hover:bg-accent/90 text-accent-foreground px-4 py-2 rounded-md text-sm font-medium"
              >
                Imprimir
              </button>
            </div>
          </div>

          <div className="bg-card rounded-lg shadow-sm border border-border p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">FACTURA</h1>
                <p className="text-lg text-gray-600">#{invoice.numero}</p>
                <p className="text-sm text-gray-600">Fecha: {invoice.fecha ? formatDate(invoice.fecha) : '-'}</p>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-4">Datos del Cliente</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="text-sm text-gray-600">Cliente:</div>
                  <div className="font-medium">{invoice.clienteNombre}</div>
                  <div className="text-sm text-gray-600">NIF: {invoice.clienteNif || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Dirección:</div>
                  <div>{invoice.direccion?.direccion || '-'}</div>
                  <div>{invoice.direccion?.codigoPostal || ''} {invoice.direccion?.poblacion || ''}</div>
                  <div>{invoice.direccion?.provincia || ''}</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Resumen de Totales</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Base Imponible</p>
                  <p className="text-xl font-semibold">{formatCurrency(invoice.totales.baseImponible)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">IVA</p>
                  <p className="text-xl font-semibold">{formatCurrency(invoice.totales.iva)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total</p>
                  <p className="text-xl font-semibold">{formatCurrency(invoice.totales.total)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
