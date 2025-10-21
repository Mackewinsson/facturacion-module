'use client'
import { useState } from 'react'
import { Invoice } from '@/lib/mock-data'
import BaseModal from './BaseModal'
import ModalToolbarButton from './ModalToolbarButton'

interface InvoiceModalProps {
  invoice: Invoice | null
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800'
      case 'SENT': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'OVERDUE': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'Borrador'
      case 'SENT': return 'Enviada'
      case 'PAID': return 'Pagada'
      case 'OVERDUE': return 'Vencida'
      case 'CANCELLED': return 'Cancelada'
      default: return status
    }
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
      subtitle={`${invoice.serie}${invoice.numero} - ${invoice.cliente.nombreORazonSocial}`}
      toolbar={toolbar}
      footer={footer}
      maxWidth="6xl"
    >

      {/* Top Section - Invoice Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dpto. Administración
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50">
                  <option>Administración</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Imputación
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={invoice.lineas[0]?.descripcion || ''}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    readOnly
                  />
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Serie
                  </label>
                  <input
                    type="text"
                    value={invoice.serie || ''}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número
                  </label>
                  <input
                    type="text"
                    value={invoice.numero}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    readOnly
                  />
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="exportacion"
                  className="mr-2"
                  checked={invoice.cliente.pais !== 'España'}
                  readOnly
                />
                <label htmlFor="exportacion" className="text-sm text-gray-700">
                  Exportación/Importación
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notas
                </label>
                <textarea
                  value={invoice.notas || ''}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  readOnly
                />
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  de fecha
                </label>
                <input
                  type="text"
                  value={formatDate(invoice.fechaExpedicion)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={invoice.cliente.nombreORazonSocial}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
                    readOnly
                  />
                  <button className="p-2 text-gray-500 hover:text-gray-700">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección
                </label>
                <input
                  type="text"
                  value={invoice.cliente.domicilio?.calle || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Forma pago
                </label>
                <input
                  type="text"
                  value={invoice.formaPago || ''}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado
                </label>
                <span className={`px-3 py-2 rounded-full text-sm font-medium ${getStatusColor(invoice.status)}`}>
                  {getStatusText(invoice.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Concept Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Concepto</h3>
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Descripción
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cantidad
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Precio Unit.
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      IVA
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {invoice.lineas.map((linea, index) => (
                    <tr key={linea.id || index}>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {linea.descripcion}
                        {linea.exenta && (
                          <div className="text-xs text-blue-600 mt-1">Exenta</div>
                        )}
                        {linea.inversionSujetoPasivo && (
                          <div className="text-xs text-green-600 mt-1">ISP</div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {linea.cantidad}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {formatCurrency(linea.precioUnitario)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-gray-900">
                        {linea.exenta ? 'Exenta' : 
                         linea.inversionSujetoPasivo ? 'ISP' : 
                         `${linea.tipoIVA}%`}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-gray-900">
                        {formatCurrency(linea.totalLinea)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Details Section */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Detalles Financieros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cta.Ingr.
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value="7540 000 0004"
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                    readOnly
                  />
                  <button className="p-1 text-green-600 hover:text-green-800">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                  <button className="p-1 text-orange-600 hover:text-orange-800">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base
                </label>
                <input
                  type="text"
                  value={formatCurrency(invoice.totales.baseImponibleTotal)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IVA
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formatCurrency(invoice.totales.cuotaIVATotal)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                    readOnly
                  />
                  <select className="px-2 py-2 border border-gray-300 rounded-md bg-white text-sm">
                    <option>21%</option>
                    <option>10%</option>
                    <option>4%</option>
                    <option>0%</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cuota IVA
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={formatCurrency(invoice.totales.cuotaIVATotal)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-white"
                    readOnly
                  />
                  <select className="px-2 py-2 border border-gray-300 rounded-md bg-white text-sm">
                    <option>5%</option>
                    <option>0%</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="retencion"
                  className="mr-2"
                  checked={!!invoice.totales.importeRetencionIRPF}
                  readOnly
                />
                <label htmlFor="retencion" className="text-sm text-gray-700">
                  Aplicar retención
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cta. Ret.
                </label>
                <input
                  type="text"
                  value=""
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  readOnly
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Base
                </label>
                <input
                  type="text"
                  value={formatCurrency(invoice.totales.baseImponibleTotal)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white"
                  readOnly
                />
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <div className="text-right">
                <div className="text-sm text-gray-600 mb-1">Total factura</div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(invoice.totales.totalFactura)}
                </div>
              </div>
            </div>
          </div>
    </BaseModal>
  )
}
