'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { MockInvoiceService, Invoice } from '@/lib/mock-data'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'
import BaseModal from '@/components/BaseModal'
import ModalToolbarButton from '@/components/ModalToolbarButton'

export default function InvoicePreviewPage() {
  const router = useRouter()
  const params = useParams()
  const invoiceId = parseInt(params.id as string)
  
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendingToAEAT, setSendingToAEAT] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false)

  useEffect(() => {
    loadInvoice()
  }, [invoiceId])

  const loadInvoice = async () => {
    try {
      const invoiceData = await MockInvoiceService.getInvoice(invoiceId)
      setInvoice(invoiceData)
    } catch (error) {
      console.error('Error loading invoice:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSendToAEAT = async () => {
    setSendingToAEAT(true)
    try {
      // Simulate AEAT submission
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Update invoice status to submitted
      if (invoice) {
        await MockInvoiceService.updateInvoice(invoiceId, {
          ...invoice,
          estado: 'enviada' as any
        })
      }
      
      setShowSuccessModal(true)
    } catch (error) {
      console.error('Error sending to AEAT:', error)
      alert('Error al enviar a AEAT. Por favor, inténtelo de nuevo.')
    } finally {
      setSendingToAEAT(false)
    }
  }

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false)
    router.push('/facturacion')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

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

  const toolbar = (
    <>
      <ModalToolbarButton
        onClick={() => router.push('/facturacion')}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        }
        label="Volver"
        variant="secondary"
      />
      <ModalToolbarButton
        onClick={handleSendToAEAT}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        }
        label={sendingToAEAT ? "Enviando..." : "Enviar a AEAT"}
        variant="primary"
        disabled={sendingToAEAT}
      />
    </>
  )

  return (
    <LayoutWithSidebar>
      <div className="bg-white p-8 max-w-4xl mx-auto shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">FACTURA</h1>
            <div className="text-sm text-gray-600 mt-2">
              <div>Serie: {invoice.serie || 'A'}</div>
              <div>Número: {invoice.numero}</div>
              <div>Fecha: {formatDate(invoice.fechaExpedicion)}</div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">
              <div>{invoice.emisor.nombreORazonSocial}</div>
              <div>NIF: {invoice.emisor.NIF}</div>
              <div>{invoice.emisor.domicilio.calle}</div>
              <div>{invoice.emisor.domicilio.codigoPostal} {invoice.emisor.domicilio.municipio}</div>
              <div>{invoice.emisor.domicilio.provincia}</div>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Datos del Cliente</h2>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <div className="text-sm text-gray-600">Cliente:</div>
              <div className="font-medium">{invoice.cliente.nombreORazonSocial}</div>
              <div className="text-sm text-gray-600">NIF: {invoice.cliente.NIF}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Dirección:</div>
              <div>{invoice.cliente.domicilio.calle}</div>
              <div>{invoice.cliente.domicilio.codigoPostal} {invoice.cliente.domicilio.municipio}</div>
              <div>{invoice.cliente.domicilio.provincia}</div>
            </div>
          </div>
        </div>

        {/* Invoice Lines */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Líneas de Factura</h2>
          <div className="border border-gray-300 rounded">
            <table className="w-full">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-4 py-2 text-left border-r border-gray-300">Descripción</th>
                  <th className="px-4 py-2 text-center border-r border-gray-300">Cantidad</th>
                  <th className="px-4 py-2 text-right border-r border-gray-300">Precio</th>
                  <th className="px-4 py-2 text-right border-r border-gray-300">% IVA</th>
                  <th className="px-4 py-2 text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.lineas.map((linea, index) => (
                  <tr key={index} className="border-b border-gray-300">
                    <td className="px-4 py-2 border-r border-gray-300">{linea.descripcion}</td>
                    <td className="px-4 py-2 text-center border-r border-gray-300">{linea.cantidad}</td>
                    <td className="px-4 py-2 text-right border-r border-gray-300">{formatCurrency(linea.precioUnitario)}</td>
                    <td className="px-4 py-2 text-right border-r border-gray-300">{linea.tipoIVA}%</td>
                    <td className="px-4 py-2 text-right">{formatCurrency(linea.totalLinea)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totals */}
        <div className="mb-8">
          <div className="flex justify-end">
            <div className="w-80">
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span>Base Imponible:</span>
                <span>{formatCurrency(invoice.totales.baseImponibleTotal)}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-gray-300">
                <span>IVA:</span>
                <span>{formatCurrency(invoice.totales.cuotaIVATotal)}</span>
              </div>
              {invoice.totales.cuotaRETotal > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span>Recargo Equivalencia:</span>
                  <span>{formatCurrency(invoice.totales.cuotaRETotal)}</span>
                </div>
              )}
              {invoice.totales.importeRetencionIRPF && invoice.totales.importeRetencionIRPF > 0 && (
                <div className="flex justify-between py-2 border-b border-gray-300">
                  <span>Retención IRPF:</span>
                  <span>-{formatCurrency(invoice.totales.importeRetencionIRPF)}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-lg font-bold">
                <span>TOTAL:</span>
                <span>{formatCurrency(invoice.totales.totalFactura)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Payment Information */}
        {invoice.formaPago && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Forma de Pago</h2>
            <div className="text-sm">
              <div>Forma de pago: {invoice.formaPago}</div>
              {invoice.medioPago && <div>Medio de pago: {invoice.medioPago}</div>}
            </div>
          </div>
        )}

        {/* Notes */}
        {invoice.notas && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Notas</h2>
            <div className="text-sm">{invoice.notas}</div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-500 mt-12">
          <div>Esta factura ha sido generada electrónicamente y es válida sin firma</div>
        </div>
      </div>

      {/* Success Modal */}
      <BaseModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="¡Envío Exitoso!"
        maxWidth="md"
        footer={
          <ModalToolbarButton
            onClick={handleSuccessModalClose}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
            label="Continuar"
            variant="primary"
          />
        }
      >
        <div className="text-center py-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Factura enviada correctamente
          </h3>
          <p className="text-gray-600 mb-4">
            La factura {invoice.serie || 'A'}-{invoice.numero} ha sido enviada exitosamente a AEAT.
          </p>
          <p className="text-sm text-gray-500">
            Serás redirigido a la lista de facturas.
          </p>
        </div>
      </BaseModal>
    </LayoutWithSidebar>
  )
}
