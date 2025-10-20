'use client'
import { useState } from 'react'
import { Entidad, MockEntityService } from '@/lib/mock-data'
import BaseModal from './BaseModal'
import ModalToolbarButton from './ModalToolbarButton'

interface EntityModalProps {
  entity: Entidad | null
  isOpen: boolean
  onClose: () => void
  onView?: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
  onEntityUpdated?: () => void
}

export default function EntityModal({
  entity,
  isOpen,
  onClose,
  onView,
  onEdit,
  onDelete,
  onEntityUpdated
}: EntityModalProps) {
  if (!isOpen || !entity) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const getTipoEntidadLabel = (tipo: string) => {
    switch (tipo) {
      case 'cliente': return 'Cliente'
      case 'proveedor': return 'Proveedor'
      case 'vendedor': return 'Vendedor'
      default: return tipo
    }
  }

  const getTipoClienteLabel = (tipo: string) => {
    switch (tipo) {
      case 'particular': return 'Particular'
      case 'empresario/profesional': return 'Empresario/Profesional'
      default: return tipo
    }
  }

  const toolbar = (
    <>
      <ModalToolbarButton
        onClick={() => onView?.(entity.id)}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        }
        label="Ver"
        variant="primary"
      />
      
      <ModalToolbarButton
        onClick={() => onEdit?.(entity.id)}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        }
        label="Editar"
      />

      <ModalToolbarButton
        onClick={() => onDelete?.(entity.id)}
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        }
        label="Eliminar"
        variant="danger"
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
      title={entity.nombreORazonSocial}
      subtitle={`${getTipoEntidadLabel(entity.tipoEntidad)} • ${entity.NIF || 'Sin NIF'}`}
      toolbar={toolbar}
      footer={footer}
      maxWidth="4xl"
    >

      {/* Top Section - Entity Details */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Entidad</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {getTipoEntidadLabel(entity.tipoEntidad)}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Cliente</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {getTipoClienteLabel(entity.tipo)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {entity.NIF || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {entity.telefono || 'No especificado'}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {entity.email || 'No especificado'}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">País</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {entity.pais}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Creación</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {formatDate(entity.createdAt)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Última Actualización</label>
                <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                  {formatDate(entity.updatedAt)}
                </div>
              </div>
            </div>
          </div>

          {/* Address Section */}
          {entity.domicilio && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Dirección</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Calle</label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {entity.domicilio.calle}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Código Postal</label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {entity.domicilio.codigoPostal}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Municipio</label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {entity.domicilio.municipio}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provincia</label>
                  <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                    {entity.domicilio.provincia}
                  </div>
                </div>
              </div>
            </div>
          )}
    </BaseModal>
  )
}
