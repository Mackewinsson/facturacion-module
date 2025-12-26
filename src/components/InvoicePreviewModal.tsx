'use client'
import { useEffect, useState, useRef } from 'react'
import { Invoice } from '@/lib/mock-data'
import { generateInvoiceFormPDF } from '@/lib/pdf/invoice-form-pdf-generator'

interface InvoicePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  formData: Partial<Invoice>
}

export default function InvoicePreviewModal({ isOpen, onClose, formData }: InvoicePreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!isOpen) {
      setPdfUrl(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    let url: string | null = null

    try {
      // Generate PDF blob from form data
      const pdfBlob = generateInvoiceFormPDF(formData)
      
      // Validate blob was created
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('El PDF generado está vacío')
      }
      
      // Create object URL from blob
      url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
      setLoading(false)
    } catch (err) {
      console.error('Error generating PDF preview:', err)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al generar la vista previa: ${errorMessage}`)
      setLoading(false)
    }

    // Cleanup: revoke object URL when modal closes
    return () => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [isOpen, formData])

  const handlePrint = () => {
    if (iframeRef.current?.contentWindow) {
      iframeRef.current.contentWindow.print()
    } else if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print()
        }
      }
    }
  }

  const handleDownload = () => {
    if (!pdfUrl) return

    const invoiceNumber = `${formData.serie || ''}${formData.numero || 'borrador'}`
    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `factura-${invoiceNumber}-preview.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div 
          className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl transform transition-all"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
            <h2 className="text-xl font-semibold text-gray-900">Vista Previa de Factura</h2>
            <div className="flex items-center gap-3">
              <button
                onClick={handlePrint}
                disabled={!pdfUrl}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Imprimir
              </button>
              <button
                onClick={handleDownload}
                disabled={!pdfUrl}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Descargar
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6" style={{ height: '75vh' }}>
            {loading && (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Generando vista previa...</p>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-center justify-center h-full bg-gray-50 rounded-lg">
                <div className="text-center">
                  <div className="text-red-500 mb-4">
                    <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                  <p className="text-red-600 mb-4">{error}</p>
                  <button
                    onClick={() => {
                      setError(null)
                      setLoading(true)
                      try {
                        const pdfBlob = generateInvoiceFormPDF(formData)
                        const url = URL.createObjectURL(pdfBlob)
                        setPdfUrl(url)
                        setLoading(false)
                      } catch (err) {
                        setError('Error al generar la vista previa')
                        setLoading(false)
                      }
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg"
                  >
                    Reintentar
                  </button>
                </div>
              </div>
            )}

            {!loading && !error && pdfUrl && (
              <div className="h-full bg-gray-100 rounded-lg overflow-hidden">
                <iframe
                  ref={iframeRef}
                  src={pdfUrl}
                  className="w-full h-full border-0"
                  title="Vista previa de factura PDF"
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end border-t border-gray-200 px-6 py-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

