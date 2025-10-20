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

      {/* Entity Identification Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Left Column */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {entity.NIF}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {entity.razonSocial}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N. Comercial</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {entity.nombreComercial || 'No especificado'}
            </div>
          </div>
          
          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alta</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {formatDate(entity.fechaAlta)}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Baja</label>
              <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
                {entity.fechaBaja ? formatDate(entity.fechaBaja) : 'No especificada'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={entity.personaFisica}
              readOnly
              className="mr-2"
            />
            <label className="text-sm text-gray-700">Persona física</label>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Identificador</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {entity.tipoIdentificador}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">País de origen</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {entity.paisOrigen}
            </div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={entity.extranjero}
                readOnly
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Extranjero/a</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={entity.operadorIntracomunitario}
                readOnly
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Operador intracomunitario</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={entity.importacionExportacion}
                readOnly
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Importación/Exportación</label>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={entity.regimenCanario}
                readOnly
                className="mr-2"
              />
              <label className="text-sm text-gray-700">Régimen Canario</label>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* Modification Details */}
          <div className="bg-gray-50 p-3 rounded-md">
            <div className="text-sm text-gray-600 mb-1">Modificado por:</div>
            <div className="text-sm font-medium">USUARIO6, DEMO</div>
            <div className="text-sm text-gray-600 mb-1 mt-2">El día:</div>
            <div className="text-sm font-medium">{formatDate(entity.updatedAt)}</div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Moneda de la entidad</label>
            <div className="text-sm text-gray-900 bg-gray-50 px-3 py-2 rounded-md">
              {entity.monedaEntidad}
            </div>
          </div>
          
          {/* Relationships */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Relaciones</label>
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entity.proveedor}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Proveedor</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entity.cliente}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Cliente</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entity.vendedor}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Vendedor</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entity.operarioTaller}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Operario de Taller</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entity.aseguradora}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Aseguradora</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entity.financiera}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Financiera</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entity.agenciaTransporte}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Agencia de Transporte</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entity.banco}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Banco</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={entity.rentacar}
                  readOnly
                  className="mr-2"
                />
                <label className="text-sm text-gray-700">Rentacar</label>
              </div>
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
