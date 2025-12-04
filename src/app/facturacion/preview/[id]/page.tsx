'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { InvoiceFromDb } from '@/lib/invoice-db-service'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function InvoicePreviewPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = parseInt(params.id as string)

  const [invoice, setInvoice] = useState<InvoiceFromDb | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadInvoice()
  }, [invoiceId])

  const loadInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}`, { cache: 'no-store' })
      const data = await response.json()
      if (data?.success && data?.data) {
        setInvoice(data.data as InvoiceFromDb)
      }
    } catch (error) {
      console.error('Error loading invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(amount)

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES')

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Cargando factura...</div>
        </div>
      </LayoutWithSidebar>
    )
  }

  if (!invoice) {
    return (
      <LayoutWithSidebar>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-red-600">Factura no encontrada</div>
        </div>
      </LayoutWithSidebar>
    )
  }

  return (
    <LayoutWithSidebar>
      <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg">
        <div className="mb-4">
          <button
            onClick={() => router.push('/facturacion')}
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            ← Volver
          </button>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FACTURA</h1>
            <div className="text-sm text-gray-600 mt-2">
              <div>Número: {invoice.numero}</div>
              <div>Fecha: {invoice.fecha ? formatDate(invoice.fecha) : '-'}</div>
            </div>
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Datos del Cliente</h2>
          <div className="grid grid-cols-2 gap-8">
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
    </LayoutWithSidebar>
  )
}
