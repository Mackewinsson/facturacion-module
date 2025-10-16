'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import SpanishInvoiceForm from '@/components/SpanishInvoiceForm'
import { MockInvoiceService, Invoice } from '@/lib/mock-data'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function EditarFacturaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
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
  }, [isAuthenticated, router, params.id])

  const loadInvoice = async () => {
    try {
      const invoice = await MockInvoiceService.getInvoice(parseInt(params.id))
      if (invoice) {
        setInvoiceData(invoice)
      } else {
        setError('Error al cargar la factura')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  // Authentication disabled for development
  // if (!isAuthenticated) {
  //   return null
  // }

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-gray-500">Cargando factura...</div>
        </div>
      </LayoutWithSidebar>
    )
  }

  if (error) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
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

  if (!invoiceData) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-4">Factura no encontrada</div>
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
      <div className="bg-background">
        <SpanishInvoiceForm 
          initialData={invoiceData}
          invoiceId={parseInt(params.id)}
          isEdit={true}
        />
      </div>
    </LayoutWithSidebar>
  )
}
