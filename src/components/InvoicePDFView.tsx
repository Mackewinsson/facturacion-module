'use client'
import { useEffect, useState, useRef } from 'react'
import { InvoiceFromDb } from '@/lib/invoice-db-service'
import { generateInvoicePDF } from '@/lib/pdf/invoice-pdf-generator'

interface InvoicePDFViewProps {
  invoice: InvoiceFromDb | null
}

export default function InvoicePDFView({ invoice }: InvoicePDFViewProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  useEffect(() => {
    if (!invoice) {
      setPdfUrl(null)
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    let url: string | null = null

    try {
      // Validate invoice data structure
      const missingFields: string[] = []
      if (!invoice.numero || invoice.numero.trim() === '') {
        missingFields.push('número')
      }
      if (!invoice.fecha || invoice.fecha.trim() === '') {
        missingFields.push('fecha')
      }
      if (!invoice.clienteNombre || invoice.clienteNombre.trim() === '') {
        missingFields.push('cliente')
      }
      
      if (missingFields.length > 0) {
        throw new Error(`Datos de factura incompletos: faltan ${missingFields.join(', ')}`)
      }

      // Generate PDF blob
      const pdfBlob = generateInvoicePDF(invoice)
      
      // Validate blob was created
      if (!pdfBlob || pdfBlob.size === 0) {
        throw new Error('El PDF generado está vacío')
      }
      
      // Create object URL from blob
      url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
      setLoading(false)
    } catch (err) {
      console.error('Error generating PDF:', err)
      console.error('Invoice data:', invoice)
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido'
      setError(`Error al generar el PDF de la factura: ${errorMessage}`)
      setLoading(false)
    }

    // Cleanup: revoke object URL when component unmounts or invoice changes
    return () => {
      if (url) {
        URL.revokeObjectURL(url)
      }
    }
  }, [invoice])

  const handlePrint = () => {
    try {
      const iframeWindow = iframeRef.current?.contentWindow
      if (iframeWindow?.print) {
        iframeWindow.print()
        return
      }
    } catch (err) {
      // In some environments (tests / strict browser settings), print can throw.
      console.error('Error printing PDF from iframe:', err)
    }

    // Fallback: open PDF in new window and print
    if (pdfUrl) {
      const printWindow = window.open(pdfUrl, '_blank')
      if (printWindow) {
        printWindow.onload = () => {
          try {
            printWindow.print()
          } catch (err) {
            console.error('Error printing PDF from new window:', err)
          }
        }
      } else if (window.print) {
        // Last resort: print current window
        window.print()
      }
    } else if (window.print) {
      window.print()
    }
  }

  const handleDownload = () => {
    if (!pdfUrl || !invoice) return

    const link = document.createElement('a')
    link.href = pdfUrl
    link.download = `factura-${invoice.numero}.pdf`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay factura para mostrar</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generando PDF...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setError(null)
              setLoading(true)
              // Retry generation
              try {
                const pdfBlob = generateInvoicePDF(invoice)
                const url = URL.createObjectURL(pdfBlob)
                setPdfUrl(url)
                setLoading(false)
              } catch (err) {
                setError('Error al generar el PDF de la factura')
                setLoading(false)
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      {/* Action buttons */}
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Descargar PDF
        </button>
      </div>

      {/* PDF viewer */}
      <div className="flex-1 border border-gray-300 rounded-lg overflow-hidden bg-gray-100 flex flex-col min-h-0">
        {pdfUrl ? (
          <iframe
            ref={iframeRef}
            src={pdfUrl}
            className="w-full h-full border-0"
            title="Vista previa de factura PDF"
            onError={(e) => {
              console.error('Error loading PDF in iframe:', e)
              setError('Error al cargar el PDF en el visor')
            }}
            onLoad={() => {
              console.log('PDF loaded successfully in iframe')
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">No se pudo cargar el PDF</p>
          </div>
        )}
      </div>
    </div>
  )
}

