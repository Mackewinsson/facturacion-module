'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { InvoiceFromDb } from '@/lib/invoice-db-service'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function VerFacturaPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
  const { isAuthenticated, token } = useAuthStore()
  const [invoiceData, setInvoiceData] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Authentication disabled for development
    // if (!isAuthenticated) {
    //   router.push('/login')
    //   return
    // }
    loadInvoice()
  }, [isAuthenticated, router, invoiceId])

  const loadInvoice = async () => {
    try {
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`/api/invoices/${invoiceId}`, {
        cache: 'no-store',
        headers
      })
      if (!response.ok) {
        setError('Error al cargar la factura')
        return
      }
      const data = await response.json()
      if (data?.success && data?.data) {
        setInvoiceData(data.data)
      } else {
        setError('Factura no encontrada')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-gray-500">Cargando factura...</div>
        </div>
      </LayoutWithSidebar>
    )
  }

  if (error || !invoiceData) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error || 'Factura no encontrada'}</div>
            <button
              onClick={() => router.push('/facturacion')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
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
      <div className="bg-background px-4 py-6 lg:px-8">
        <div className="w-full">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h1 className="text-2xl font-semibold text-card-foreground">
                  Factura #{invoiceData.numero}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Vista de solo lectura con datos reales de la base de datos.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/facturacion')}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Volver
                </button>
              </div>
            </div>

            <div className="space-y-6 px-6 py-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-muted-foreground">Número</p>
                  <p className="text-lg font-semibold text-card-foreground">{invoiceData.numero}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Fecha</p>
                  <p className="text-lg font-semibold text-card-foreground">
                    {invoiceData.fechaExpedicion ? new Date(invoiceData.fechaExpedicion).toLocaleDateString('es-ES') : '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="text-lg font-semibold text-card-foreground">{invoiceData.cliente?.nombreORazonSocial || '-'}</p>
                  <p className="text-sm text-muted-foreground">NIF: {invoiceData.cliente?.NIF || '-'}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-card-foreground">Dirección</p>
                  <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                    {invoiceData.cliente?.domicilio?.calle || '-'}
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                    {invoiceData.cliente?.domicilio?.municipio || '-'} {invoiceData.cliente?.domicilio?.provincia ? `(${invoiceData.cliente.domicilio.provincia})` : ''}
                  </div>
                  <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                    {invoiceData.cliente?.domicilio?.codigoPostal || '-'}
                  </div>
                </div>

                <div className="bg-muted/50 p-4 rounded-lg border border-border h-full">
                  <h3 className="text-lg font-semibold text-card-foreground mb-3">Totales</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Base Imponible</p>
                      <p className="text-xl font-semibold text-card-foreground">
                        {formatCurrency(invoiceData.totales?.baseImponibleTotal ?? 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">IVA</p>
                      <p className="text-xl font-semibold text-card-foreground">
                        {formatCurrency(invoiceData.totales?.cuotaIVATotal ?? 0)}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total</p>
                      <p className="text-xl font-semibold text-card-foreground">
                        {formatCurrency(invoiceData.totales?.totalFactura ?? 0)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
