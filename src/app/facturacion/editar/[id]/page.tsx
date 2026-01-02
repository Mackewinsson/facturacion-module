'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { Invoice } from '@/lib/mock-data'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'
import SpanishInvoiceForm from '@/components/SpanishInvoiceForm'

export default function EditarFacturaPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
  const { isAuthenticated, token } = useAuthStore()
  const [invoiceData, setInvoiceData] = useState<Partial<Invoice> | null>(null)
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

  // Determine if it's a received invoice
  const isReceivedInvoice = invoiceData.tipoFactura === 'recibida'

  return (
    <LayoutWithSidebar>
      <div className="bg-background">
        <SpanishInvoiceForm
          initialData={invoiceData}
          invoiceId={parseInt(invoiceId, 10)}
          hideISP
          hideRecargoEquivalencia
          allowedVATRates={[21]}
          isReceivedInvoice={isReceivedInvoice}
        />
      </div>
    </LayoutWithSidebar>
  )
}
