'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { InvoiceFromDb } from '@/lib/invoice-db-service'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'
import InvoicePDFView from '@/components/InvoicePDFView'

export default function VerFacturaPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = params.id as string
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
  }, [isAuthenticated, router, invoiceId])

  const loadInvoice = async () => {
    try {
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`/api/invoices/${invoiceId}?format=db`, {
        cache: 'no-store',
        headers
      })
      if (response.status === 401) {
        // If user is already logged in, don't redirect - let them continue working
        // The API route handles authentication gracefully in development mode
        if (isAuthenticated) {
          console.warn('401 response but user is authenticated - continuing anyway')
        } else {
          console.warn('401 response but user not authenticated - continuing anyway (dev mode)')
        }
        // Don't redirect - continue with the request
      }
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`
        setError(errorMessage)
        return
      }
      const data = await response.json()
      if (data?.success && data?.data) {
        setInvoice(data.data as InvoiceFromDb)
      } else {
        setError('Factura no encontrada')
      }
    } catch (err) {
      console.error('Error loading invoice:', err)
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }


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
      <div className="bg-background p-4 h-screen flex flex-col overflow-hidden">
        <div className="max-w-7xl mx-auto w-full flex flex-col flex-1 min-h-0">
          <div className="mb-4 flex-shrink-0">
            <button
              onClick={() => router.push('/facturacion')}
              className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Volver a Facturación
            </button>
          </div>

          <div className="flex-1 min-h-0 overflow-hidden">
            <InvoicePDFView invoice={invoice} />
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
