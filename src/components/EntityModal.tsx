'use client'
import React, { useState, useEffect } from 'react'
import { Entidad, Direccion } from '@/lib/mock-data'
import BaseModal from './BaseModal'
import ModalToolbarButton from './ModalToolbarButton'
import { useAuthStore } from '@/store/auth'

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
  const [isEditMode, setIsEditMode] = useState(false)
  const [formData, setFormData] = useState(entity || {} as Entidad)
  const [activeTab, setActiveTab] = useState<'general' | 'direcciones' | 'notas'>('general')
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [showProveedorModal, setShowProveedorModal] = useState(false)
  const [showVendedorModal, setShowVendedorModal] = useState(false)
  const token = useAuthStore((state) => state.token)

  // Update form data when entity changes
  useEffect(() => {
    if (entity) {
      setFormData(entity)
    }
  }, [entity])

  // Reset tab and edit mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      setActiveTab('general')
      setIsEditMode(false)
      if (entity) {
        setFormData(entity)
      }
    }
  }, [isOpen, entity])

  if (!isOpen || !entity) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    try {
      const headers: HeadersInit = {
        'Content-Type': 'application/json'
      }
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
      const response = await fetch(`/api/entities/${entity.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData),
        cache: 'no-store'
      })
      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Error al actualizar la entidad')
      }
      const updatedData = await response.json()
      if (updatedData.success && updatedData.data) {
        setFormData(updatedData.data)
      }
      setIsEditMode(false)
      onEntityUpdated?.()
      // You could add a toast notification here for success
    } catch (error) {
      console.error('Error updating entity:', error)
      // You could add a toast notification here for error
      alert(error instanceof Error ? error.message : 'Error al guardar los cambios. Por favor, inténtelo de nuevo.')
    }
  }

  const handleCancel = () => {
    setFormData(entity)
    setIsEditMode(false)
  }

  const handleEdit = () => {
    setIsEditMode(true)
  }

  const handleRelationshipClick = (relationship: string) => {
    if (relationship === 'cliente') {
      setShowClienteModal(true)
    } else if (relationship === 'proveedor') {
      setShowProveedorModal(true)
    } else if (relationship === 'vendedor') {
      setShowVendedorModal(true)
    }
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

  const getRelationshipLabel = (relationship: string) => {
    switch (relationship) {
      case 'proveedor': return 'Proveedor'
      case 'cliente': return 'Cliente'
      case 'vendedor': return 'Vendedor'
      case 'operarioTaller': return 'Operario de Taller'
      case 'aseguradora': return 'Aseguradora'
      case 'financiera': return 'Financiera'
      case 'agenciaTransporte': return 'Agencia de Transporte'
      case 'banco': return 'Banco'
      case 'rentacar': return 'Rentacar'
      default: return relationship
    }
  }

  const toolbar = (
    <>
      {!isEditMode ? (
        <>
          <ModalToolbarButton
            onClick={handleEdit}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            label="Editar"
            variant="primary"
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
      ) : (
        <>
          <ModalToolbarButton
            onClick={handleSave}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            }
            label="Guardar"
            variant="primary"
          />
          <ModalToolbarButton
            onClick={handleCancel}
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            }
            label="Cancelar"
            variant="secondary"
          />
        </>
      )}
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
      title="Ficha de Agenda"
      subtitle={`${entity.razonSocial} - NIF: ${entity.NIF}`}
      toolbar={toolbar}
      footer={footer}
      maxWidth="4xl"
    >

      {/* Entity Identification Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
          <input
            type="text"
            value={formData.NIF}
            onChange={(e) => handleInputChange('NIF', e.target.value)}
            disabled={!isEditMode}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              isEditMode 
                ? 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Razón Social</label>
          <input
            type="text"
            value={formData.razonSocial}
            onChange={(e) => handleInputChange('razonSocial', e.target.value)}
            disabled={!isEditMode}
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              isEditMode 
                ? 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">N. Comercial</label>
          <input
            type="text"
            value={formData.nombreComercial || ''}
            onChange={(e) => handleInputChange('nombreComercial', e.target.value)}
            disabled={!isEditMode}
            placeholder="No especificado"
            className={`w-full px-3 py-2 border rounded-md text-sm ${
              isEditMode 
                ? 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
            }`}
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'general'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Generales
          </button>
          <button
            onClick={() => setActiveTab('direcciones')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'direcciones'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Direcciones
          </button>
          <button
            onClick={() => setActiveTab('notas')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'notas'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Notas
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'general' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Alta</label>
                <input
                  type="date"
                  value={formData.fechaAlta}
                  onChange={(e) => handleInputChange('fechaAlta', e.target.value)}
                  disabled={!isEditMode}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    isEditMode 
                      ? 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                      : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Baja</label>
                <input
                  type="date"
                  value={formData.fechaBaja || ''}
                  onChange={(e) => handleInputChange('fechaBaja', e.target.value)}
                  disabled={!isEditMode}
                  className={`w-full px-3 py-2 border rounded-md text-sm ${
                    isEditMode 
                      ? 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                      : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.personaFisica}
                onChange={(e) => handleInputChange('personaFisica', e.target.checked)}
                disabled={!isEditMode}
                className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Persona física</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo Identificador</label>
              <select
                value={formData.tipoIdentificador}
                onChange={(e) => handleInputChange('tipoIdentificador', e.target.value)}
                disabled={!isEditMode}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  isEditMode 
                    ? 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                    : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              >
                <option value="NIF/CIF-IVA">NIF/CIF-IVA</option>
                <option value="NIE">NIE</option>
                <option value="PASAPORTE">PASAPORTE</option>
                <option value="OTRO">OTRO</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">País de origen</label>
              <select
                value={formData.paisOrigen}
                onChange={(e) => handleInputChange('paisOrigen', e.target.value)}
                disabled={!isEditMode}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  isEditMode 
                    ? 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                    : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              >
                <option value="ESPAÑA">ESPAÑA</option>
                <option value="FRANCIA">FRANCIA</option>
                <option value="PORTUGAL">PORTUGAL</option>
                <option value="ITALIA">ITALIA</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.extranjero}
                  onChange={(e) => handleInputChange('extranjero', e.target.checked)}
                  disabled={!isEditMode}
                  className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Extranjero/a</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.operadorIntracomunitario}
                  onChange={(e) => handleInputChange('operadorIntracomunitario', e.target.checked)}
                  disabled={!isEditMode}
                  className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Operador intracomunitario</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.importacionExportacion}
                  onChange={(e) => handleInputChange('importacionExportacion', e.target.checked)}
                  disabled={!isEditMode}
                  className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Importación/Exportación</label>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.regimenCanario}
                  onChange={(e) => handleInputChange('regimenCanario', e.target.checked)}
                  disabled={!isEditMode}
                  className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Régimen Canario</label>
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
              <select
                value={formData.monedaEntidad}
                onChange={(e) => handleInputChange('monedaEntidad', e.target.value)}
                disabled={!isEditMode}
                className={`w-full px-3 py-2 border rounded-md text-sm ${
                  isEditMode 
                    ? 'border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                    : 'border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              >
                <option value="Eur">Eur</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            
            {/* Relationships */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relaciones</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.proveedor}
                    onChange={(e) => handleInputChange('proveedor', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Proveedor</label>
                  {formData.proveedor && (
                    <button
                      onClick={() => handleRelationshipClick('proveedor')}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Ver información de Proveedor"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.cliente}
                    onChange={(e) => handleInputChange('cliente', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Cliente</label>
                  {formData.cliente && (
                    <button
                      onClick={() => handleRelationshipClick('cliente')}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Ver información de Cliente"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.vendedor}
                    onChange={(e) => handleInputChange('vendedor', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Vendedor</label>
                  {formData.vendedor && (
                    <button
                      onClick={() => handleRelationshipClick('vendedor')}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Ver información de Vendedor"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.operarioTaller}
                    onChange={(e) => handleInputChange('operarioTaller', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Operario de Taller</label>
                  {formData.operarioTaller && (
                    <button
                      onClick={() => handleRelationshipClick('operarioTaller')}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Ver información de Operario de Taller"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.aseguradora}
                    onChange={(e) => handleInputChange('aseguradora', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Aseguradora</label>
                  {formData.aseguradora && (
                    <button
                      onClick={() => handleRelationshipClick('aseguradora')}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Ver información de Aseguradora"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.financiera}
                    onChange={(e) => handleInputChange('financiera', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Financiera</label>
                  {formData.financiera && (
                    <button
                      onClick={() => handleRelationshipClick('financiera')}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Ver información de Financiera"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.agenciaTransporte}
                    onChange={(e) => handleInputChange('agenciaTransporte', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Agencia de Transporte</label>
                  {formData.agenciaTransporte && (
                    <button
                      onClick={() => handleRelationshipClick('agenciaTransporte')}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Ver información de Agencia de Transporte"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.banco}
                    onChange={(e) => handleInputChange('banco', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Banco</label>
                  {formData.banco && (
                    <button
                      onClick={() => handleRelationshipClick('banco')}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Ver información de Banco"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.rentacar}
                    onChange={(e) => handleInputChange('rentacar', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Rentacar</label>
                  {formData.rentacar && (
                    <button
                      onClick={() => handleRelationshipClick('rentacar')}
                      className="ml-2 p-1 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded"
                      title="Ver información de Rentacar"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === 'general' && (
        <>
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
        </>
      )}

      {/* Direcciones Tab Content */}
      {activeTab === 'direcciones' && (
        <div className="space-y-4">
          {/* Addresses Table */}
          <div className="border border-gray-300 rounded">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                    Centro
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                    Dirección
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                    Teléfono
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                    Tlf. Móvil
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-700">
                    Email
                  </th>
                </tr>
              </thead>
              <tbody>
                {entity.direcciones && entity.direcciones.length > 0 ? (
                  entity.direcciones.map((direccion, index) => (
                    <tr key={direccion.id} className={`border-b border-gray-300 ${index === 0 ? 'bg-blue-100' : 'hover:bg-gray-50'}`}>
                      <td className="px-3 py-2 text-sm font-medium text-gray-900 border-r border-gray-300">
                        {direccion.centro}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-300">
                        {direccion.direccion}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-300">
                        {direccion.telefono || '-'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900 border-r border-gray-300">
                        {direccion.telefonoMovil || '-'}
                      </td>
                      <td className="px-3 py-2 text-sm text-gray-900">
                        {direccion.email || '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 py-4 text-center text-sm text-gray-500">
                      No hay direcciones registradas
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Billing Address Section */}
          {entity.direcciones && entity.direcciones.length > 0 && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Dirección de facturación</label>
              <div className="relative">
                <select
                  disabled={!isEditMode}
                  className={`w-full px-3 py-2 border border-gray-300 rounded text-sm appearance-none pr-8 ${
                    isEditMode 
                      ? 'bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500' 
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {entity.direcciones.map((direccion) => (
                    <option key={direccion.id} value={direccion.id}>
                      {direccion.centro}. {direccion.direccion}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notas Tab Content */}
      {activeTab === 'notas' && (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-2">Notas</h3>
            <p className="text-green-700">
              Información adicional y observaciones sobre esta entidad.
            </p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Notas Generales</label>
            <textarea
              disabled
              rows={8}
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm resize-none"
              placeholder="No hay notas registradas para esta entidad..."
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas de Contacto</label>
              <textarea
                disabled
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm resize-none"
                placeholder="Notas específicas sobre el contacto..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Notas Comerciales</label>
              <textarea
                disabled
                rows={4}
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm resize-none"
                placeholder="Notas sobre relaciones comerciales..."
              />
            </div>
          </div>
        </div>
      )}


      {/* Ficha de Cliente Modal */}
      <BaseModal
        isOpen={showClienteModal}
        onClose={() => setShowClienteModal(false)}
        title="Ficha de Cliente"
        subtitle={`${entity.razonSocial} - NIF: ${entity.NIF}`}
        maxWidth="4xl"
      >
        {/* Client Identification Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
            <input
              type="text"
              value={entity.NIF}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N.Comercial o Apellidos</label>
            <input
              type="text"
              value={entity.razonSocial}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={entity.nombreComercial || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
            />
          </div>
        </div>

        {/* Generales Tab Content */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button className="py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
              Generales
            </button>
          </nav>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actividad</label>
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
              >
                <option value="otra">(otra)</option>
                <option value="comercial">Comercial</option>
                <option value="industrial">Industrial</option>
                <option value="servicios">Servicios</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                disabled
                className="mr-2 opacity-50 cursor-not-allowed"
              />
              <label className="text-sm text-gray-500">Activar códigos unidad organizativa</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa transporte</label>
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
              >
                <option value="">Seleccionar...</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fechas - Alta</label>
              <input
                type="date"
                value={entity.fechaAlta}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                disabled
                className="mr-2 opacity-50 cursor-not-allowed"
              />
              <label className="text-sm text-gray-500">Fechas - Baja</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                disabled
                className="mr-2 opacity-50 cursor-not-allowed"
              />
              <label className="text-sm text-gray-500">Es profesional</label>
            </div>
          </div>
        </div>
      </BaseModal>

      {/* Ficha de Proveedor Modal */}
      <BaseModal
        isOpen={showProveedorModal}
        onClose={() => setShowProveedorModal(false)}
        title="Ficha de Proveedor"
        subtitle={`${entity.razonSocial} - NIF: ${entity.NIF}`}
        maxWidth="4xl"
      >
        {/* Provider Identification Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
            <input
              type="text"
              value={entity.NIF}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N.Comercial o Apellidos</label>
            <input
              type="text"
              value={entity.razonSocial}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={entity.nombreComercial || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button className="py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
              Generales
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Condiciones
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              F. Pago
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Notas
            </button>
          </nav>
        </div>

        {/* Generales Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Actividad</label>
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
              >
                <option value="otra">(otra)</option>
                <option value="comercial">Comercial</option>
                <option value="industrial">Industrial</option>
                <option value="servicios">Servicios</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                disabled
                className="mr-2 opacity-50 cursor-not-allowed"
              />
              <label className="text-sm text-gray-500">Activar códigos unidad organizativa</label>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Empresa transporte</label>
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
              >
                <option value="">Seleccionar...</option>
              </select>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fechas - Alta</label>
              <input
                type="date"
                value={entity.fechaAlta}
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                disabled
                className="mr-2 opacity-50 cursor-not-allowed"
              />
              <label className="text-sm text-gray-500">Fechas - Baja</label>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                disabled
                className="mr-2 opacity-50 cursor-not-allowed"
              />
              <label className="text-sm text-gray-500">Es profesional</label>
            </div>
          </div>
        </div>
      </BaseModal>

      {/* Ficha de Vendedor Modal */}
      <BaseModal
        isOpen={showVendedorModal}
        onClose={() => setShowVendedorModal(false)}
        title="Ficha de Vendedor"
        subtitle={`${entity.razonSocial} - NIF: ${entity.NIF}`}
        maxWidth="4xl"
      >
        {/* Vendor Identification Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIF</label>
            <input
              type="text"
              value={entity.NIF}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">N.Comercial o Apellidos</label>
            <input
              type="text"
              value={entity.razonSocial}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
            <input
              type="text"
              value={entity.nombreComercial || ''}
              disabled
              className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
            />
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button className="py-2 px-1 border-b-2 border-blue-500 font-medium text-sm text-blue-600">
              Generales
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Movimientos
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Formación
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Nóminas
            </button>
            <button className="py-2 px-1 border-b-2 border-transparent font-medium text-sm text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Histórico
            </button>
          </nav>
        </div>

        {/* Generales Tab Content */}
        <div className="space-y-6">
          {/* Top Section - Departments, Zones, Dates */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Departments */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Departamentos</label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mr-2 opacity-50 cursor-not-allowed"
                  />
                  <label className="text-sm text-gray-500">Vehículos</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mr-2 opacity-50 cursor-not-allowed"
                  />
                  <label className="text-sm text-gray-500">Taller</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mr-2 opacity-50 cursor-not-allowed"
                  />
                  <label className="text-sm text-gray-500">Recambios</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                    className="mr-2 opacity-50 cursor-not-allowed"
                  />
                  <label className="text-sm text-gray-500">Contabilidad</label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={false}
                    disabled
                    className="mr-2 opacity-50 cursor-not-allowed"
                  />
                  <label className="text-sm text-gray-500">Flota</label>
                </div>
              </div>
            </div>

            {/* Zones */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Zonas</label>
              <select
                disabled
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
              >
                <option value="2">2(INTERIOR)</option>
                <option value="1">1(COSTA)</option>
                <option value="3">3(MONTAÑA)</option>
              </select>
            </div>

            {/* Dates */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Fechas</label>
              <div className="space-y-2">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Alta</label>
                  <input
                    type="date"
                    value="2024-06-10"
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
                  />
                </div>
                <div>
                  <div className="flex items-center mb-1">
                    <input
                      type="checkbox"
                      checked={true}
                      disabled
                      className="mr-2 opacity-50 cursor-not-allowed"
                    />
                    <label className="text-xs text-gray-600">Baja</label>
                  </div>
                  <input
                    type="datetime-local"
                    value="2025-07-31T12:02"
                    disabled
                    className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - General Information */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Vendedor</label>
                <select
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
                >
                  <option value="empleado">Empleado</option>
                  <option value="autonomo">Autónomo</option>
                  <option value="comisionista">Comisionista</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <select
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
                >
                  <option value="">(Ninguno)</option>
                  <option value="ventas">Ventas</option>
                  <option value="taller">Taller</option>
                  <option value="recambios">Recambios</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cargo</label>
                <input
                  type="text"
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Empresa</label>
                <select
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
                >
                  <option value="">(Ninguna)</option>
                  <option value="empresa1">Empresa 1</option>
                  <option value="empresa2">Empresa 2</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Centro</label>
                <select
                  disabled
                  className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
                >
                  <option value="motos">MOTOS</option>
                  <option value="coches">COCHES</option>
                  <option value="taller">TALLER</option>
                </select>
              </div>

              {/* Payroll Section */}
              <div className="border-t pt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">Nóminas</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Medio de pago</label>
                    <input
                      type="text"
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cuenta contable traspaso</label>
                    <input
                      type="text"
                      disabled
                      className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
              <textarea
                disabled
                rows={12}
                className="w-full px-3 py-2 border border-gray-200 bg-gray-100 text-gray-500 cursor-not-allowed rounded-md text-sm resize-none"
                placeholder="Notas sobre el vendedor..."
              />
            </div>
          </div>
        </div>
      </BaseModal>
    </BaseModal>
  )
}
