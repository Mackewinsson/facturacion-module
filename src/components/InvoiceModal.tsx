'use client'
import { InvoiceFromDb } from '@/lib/invoice-db-service'
import BaseModal from './BaseModal'
import ModalToolbarButton from './ModalToolbarButton'

interface InvoiceModalProps {
  invoice: InvoiceFromDb | null
  isOpen: boolean
  onClose: () => void
  onPrint?: (id: number) => void
  onView?: (id: number) => void
}

export default function InvoiceModal({
  invoice,
  isOpen,
  onClose,
  onPrint,
  onView
}: InvoiceModalProps) {
  if (!isOpen || !invoice) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  const toolbar = (
    <>
      <ModalToolbarButton
        onClick={() => onPrint?.(invoice.id)}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
        }
        label="Imprimir"
      />
      
      <ModalToolbarButton
        onClick={() => onView?.(invoice.id)}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
        label="Ver"
      />
    </>
  )

  const footer = (
    <button
      onClick={onClose}
      className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
    >
      Cerrar
    </button>
  )

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Factura"
      subtitle={`${invoice.numero} - ${invoice.clienteNombre}`}
      toolbar={toolbar}
      footer={footer}
      maxWidth="6xl"
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Número</p>
              <p className="text-lg font-semibold text-gray-900">{invoice.numero}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p className="text-lg font-semibold text-gray-900">{formatDate(invoice.fecha)}</p>
            </div>
          </div>

          <div>
            <p className="text-sm text-gray-500">Cliente</p>
            <p className="text-lg font-semibold text-gray-900">{invoice.clienteNombre}</p>
            <p className="text-sm text-gray-600">NIF: {invoice.clienteNif || '-'}</p>
          </div>

          <div>
            <p className="text-sm text-gray-500">Dirección</p>
            <p className="text-base text-gray-900">
              {invoice.direccion?.direccion || '-'}
            </p>
            <p className="text-sm text-gray-600">
              {invoice.direccion?.poblacion || ''}{invoice.direccion?.provincia ? `, ${invoice.direccion?.provincia}` : ''}
            </p>
            <p className="text-sm text-gray-600">
              {invoice.direccion?.codigoPostal || ''}
            </p>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Totales</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-500">Base Imponible</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.totales.baseImponible)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">IVA</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.totales.iva)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total</p>
              <p className="text-lg font-semibold text-gray-900">{formatCurrency(invoice.totales.total)}</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  )
}
