'use client'
import React, { useState, useEffect, useRef } from 'react'
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
  const [isSaving, setIsSaving] = useState(false)
  const [showClienteModal, setShowClienteModal] = useState(false)
  const [showProveedorModal, setShowProveedorModal] = useState(false)
  const [showVendedorModal, setShowVendedorModal] = useState(false)
  const token = useAuthStore((state) => state.token)
  const lastSavedEntityIdRef = useRef<number | null>(null)

  // Update form data when entity changes, but not if we just saved the same entity
  useEffect(() => {
    if (entity) {
      // Only update if it's a different entity or we haven't just saved this one
      if (entity.id !== lastSavedEntityIdRef.current) {
        setFormData(entity)
      }
    }
  }, [entity])

  // Reset edit mode when modal closes
  useEffect(() => {
    if (!isOpen) {
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
    setIsSaving(true)
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
        lastSavedEntityIdRef.current = updatedData.data.id
      }
      setIsEditMode(false)
      setIsSaving(false)
      // Call onEntityUpdated after a short delay to prevent flash
      setTimeout(() => {
        onEntityUpdated?.()
        // Reset the ref after a delay to allow normal updates again
        setTimeout(() => {
          lastSavedEntityIdRef.current = null
        }, 500)
      }, 100)
    } catch (error) {
      setIsSaving(false)
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

  // Compute full name for display
  const getFullName = () => {
    if (formData.personaFisica && formData.nombre && formData.apellido1) {
      return `${formData.nombre} ${formData.apellido1}${formData.apellido2 ? ' ' + formData.apellido2 : ''}`.trim()
    }
    return formData.razonSocial || ''
  }

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Entidad"
      toolbar={toolbar}
      footer={footer}
      maxWidth="4xl"
    >
      <div className="space-y-3">
        {/* Header Section */}
        <div className="grid grid-cols-12 gap-2 items-start">
          {/* NIF */}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-white bg-blue-700 px-2 py-1 mb-1">NIF</label>
            <input
              type="text"
              value={formData.NIF}
              onChange={(e) => handleInputChange('NIF', e.target.value)}
              disabled={!isEditMode}
              className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                isEditMode 
                  ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Nombre / Razón Social Display */}
          <div className="col-span-4">
            <label className="block text-xs font-semibold text-white bg-blue-700 px-2 py-1 mb-1">
              {formData.personaFisica ? 'Nombre' : 'Razón Social'}
            </label>
            <input
              type="text"
              value={getFullName()}
              disabled
              className="w-full px-2 py-1 border border-gray-300 bg-gray-100 text-gray-700 text-sm cursor-not-allowed"
            />
          </div>

          {/* N.comercial */}
          <div className="col-span-3">
            <label className="block text-xs font-semibold text-white bg-blue-700 px-2 py-1 mb-1">N.comercial</label>
            <input
              type="text"
              value={formData.nombreComercial || ''}
              onChange={(e) => handleInputChange('nombreComercial', e.target.value)}
              disabled={!isEditMode}
              className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                isEditMode 
                  ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                  : 'bg-gray-100 text-gray-500 cursor-not-allowed'
              }`}
            />
          </div>

          {/* Metadata Box */}
          <div className="col-span-3 bg-gray-200 px-3 py-2 border border-gray-400">
            <div className="text-xs text-gray-700 mb-1">Modificado por:</div>
            <div className="text-xs font-medium text-gray-900 mb-2">USUARIO6, DEMO</div>
            <div className="text-xs text-gray-700 mb-1">El día:</div>
            <div className="text-xs font-medium text-gray-900">{formatDate(entity.updatedAt)}</div>
          </div>
        </div>

        {/* Persona Física Section */}
        <div className="border border-gray-400 p-2 bg-gray-50">
          <div className="flex items-start gap-3">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.personaFisica}
                onChange={(e) => handleInputChange('personaFisica', e.target.checked)}
                disabled={!isEditMode}
                className={`${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
              />
              <label className={`text-sm font-medium ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>
                Persona física
              </label>
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>

            {/* Name Fields */}
            {formData.personaFisica && (
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Nombre:</label>
                  <input
                    type="text"
                    value={formData.nombre || ''}
                    onChange={(e) => handleInputChange('nombre', e.target.value)}
                    disabled={!isEditMode}
                    className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                      isEditMode 
                        ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apellido 1º:</label>
                  <input
                    type="text"
                    value={formData.apellido1 || ''}
                    onChange={(e) => handleInputChange('apellido1', e.target.value)}
                    disabled={!isEditMode}
                    className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                      isEditMode 
                        ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Apellido 2º:</label>
                  <input
                    type="text"
                    value={formData.apellido2 || ''}
                    onChange={(e) => handleInputChange('apellido2', e.target.value)}
                    disabled={!isEditMode}
                    className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                      isEditMode 
                        ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                        : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                    }`}
                  />
                </div>
              </div>
            )}

            {/* Sexo Radio Buttons */}
            {formData.personaFisica && (
              <div className="flex items-center gap-4">
                <label className="text-xs font-medium text-gray-700">Sexo:</label>
                <div className="flex gap-3">
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="sexo"
                      value="hombre"
                      checked={formData.sexo === 'hombre'}
                      onChange={(e) => handleInputChange('sexo', e.target.value)}
                      disabled={!isEditMode}
                      className={!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                    <span className={!isEditMode ? 'text-gray-500' : 'text-gray-700'}>* Hombre</span>
                  </label>
                  <label className="flex items-center gap-1 text-sm">
                    <input
                      type="radio"
                      name="sexo"
                      value="mujer"
                      checked={formData.sexo === 'mujer'}
                      onChange={(e) => handleInputChange('sexo', e.target.value)}
                      disabled={!isEditMode}
                      className={!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}
                    />
                    <span className={!isEditMode ? 'text-gray-500' : 'text-gray-700'}>Mujer</span>
                  </label>
                </div>
              </div>
            )}

            {/* Verificar datos con Hacienda Button */}
            <button
              type="button"
              disabled={!isEditMode}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              Verificar datos con Hacienda
            </button>
          </div>
        </div>

        {/* Main Form Layout - Three Columns */}
        <div className="grid grid-cols-12 gap-3">
          {/* Left Column - Checkboxes */}
          <div className="col-span-3 space-y-1.5">
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

            {/* Dates */}
            <div className="mt-3 space-y-1.5">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Alta</label>
                <input
                  type="date"
                  value={formData.fechaAlta ? formData.fechaAlta.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('fechaAlta', e.target.value)}
                  disabled={!isEditMode}
                  className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                    isEditMode 
                      ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Baja</label>
                <input
                  type="date"
                  value={formData.fechaBaja ? formData.fechaBaja.split('T')[0] : ''}
                  onChange={(e) => handleInputChange('fechaBaja', e.target.value)}
                  disabled={!isEditMode}
                  placeholder="dd/mm/aaaa"
                  className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                    isEditMode 
                      ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>
          </div>
          {/* Middle Column - Centro/Direccion/Localizacion */}
          <div className="col-span-5">
            <fieldset className="border border-gray-400 p-2">
              <legend className="text-xs font-semibold text-gray-700 px-1">Centro</legend>
              <div className="mb-2">
                <input
                  type="text"
                  value={formData.domicilio?.centro || 'PRINCIPAL'}
                  onChange={(e) => handleInputChange('domicilio', { ...(formData.domicilio || {}), centro: e.target.value })}
                  disabled={!isEditMode}
                  className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                    isEditMode 
                      ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>

              {/* Direccion Subsection */}
              <fieldset className="border border-gray-300 p-1.5 mb-2">
                <legend className="text-xs font-medium text-gray-700 px-1">Dirección</legend>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-3 gap-1.5">
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Calle/Vía</label>
                      <select
                        value={formData.domicilio?.calleVia || 'Calle'}
                        onChange={(e) => handleInputChange('domicilio', { ...(formData.domicilio || {}), calleVia: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                          isEditMode 
                            ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      >
                        <option value="Calle">Calle</option>
                        <option value="Avenida">Avenida</option>
                        <option value="Plaza">Plaza</option>
                        <option value="Paseo">Paseo</option>
                      </select>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-xs text-gray-600 mb-1">Nombre</label>
                      <input
                        type="text"
                        value={formData.domicilio?.nombreCalle || formData.domicilio?.calle || ''}
                        onChange={(e) => handleInputChange('domicilio', { ...(formData.domicilio || {}), nombreCalle: e.target.value, calle: e.target.value })}
                        disabled={!isEditMode}
                        className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                          isEditMode 
                            ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Número</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={formData.domicilio?.numero || ''}
                        onChange={(e) => handleInputChange('domicilio', { ...(formData.domicilio || {}), numero: e.target.value })}
                        disabled={!isEditMode}
                        className={`flex-1 px-2 py-1 border border-gray-300 text-sm ${
                          isEditMode 
                            ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                      <input
                        type="text"
                        value={formData.domicilio?.numeroExtension || ''}
                        onChange={(e) => handleInputChange('domicilio', { ...(formData.domicilio || {}), numeroExtension: e.target.value })}
                        disabled={!isEditMode}
                        placeholder="3A"
                        className={`w-20 px-2 py-1 border border-gray-300 text-sm ${
                          isEditMode 
                            ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                            : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                        }`}
                      />
                    </div>
                  </div>
                </div>
              </fieldset>

              {/* Localizacion Subsection */}
              <fieldset className="border border-gray-300 p-1.5">
                <legend className="text-xs font-medium text-gray-700 px-1">Localización</legend>
                <div className="grid grid-cols-2 gap-1.5">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Cód.postal</label>
                    <input
                      type="text"
                      value={formData.domicilio?.codigoPostal || ''}
                      onChange={(e) => handleInputChange('domicilio', { ...(formData.domicilio || {}), codigoPostal: e.target.value })}
                      disabled={!isEditMode}
                      className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                        isEditMode 
                          ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">País</label>
                    <input
                      type="text"
                      value={formData.domicilio?.pais || 'ESPAÑA'}
                      onChange={(e) => handleInputChange('domicilio', { ...(formData.domicilio || {}), pais: e.target.value })}
                      disabled={!isEditMode}
                      className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                        isEditMode 
                          ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Provincia</label>
                    <select
                      value={formData.domicilio?.provincia || ''}
                      onChange={(e) => handleInputChange('domicilio', { ...(formData.domicilio || {}), provincia: e.target.value })}
                      disabled={!isEditMode}
                      className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                        isEditMode 
                          ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <option value="MALAGA">MALAGA</option>
                      <option value="MADRID">MADRID</option>
                      <option value="BARCELONA">BARCELONA</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Localidad</label>
                    <select
                      value={formData.domicilio?.municipio || ''}
                      onChange={(e) => handleInputChange('domicilio', { ...(formData.domicilio || {}), municipio: e.target.value })}
                      disabled={!isEditMode}
                      className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                        isEditMode 
                          ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                          : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      <option value="MALAGA">MALAGA</option>
                      <option value="MADRID">MADRID</option>
                      <option value="BARCELONA">BARCELONA</option>
                    </select>
                  </div>
                </div>
              </fieldset>
            </fieldset>
          </div>

          {/* Right Column - Moneda and Relaciones */}
          <div className="col-span-4 space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Moneda de la entidad</label>
              <select
                value={formData.monedaEntidad}
                onChange={(e) => handleInputChange('monedaEntidad', e.target.value)}
                disabled={!isEditMode}
                className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                  isEditMode 
                    ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              >
                <option value="Eur">Eur</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
            
            {/* Relaciones */}
            <fieldset className="border border-gray-400 p-2">
              <legend className="text-xs font-semibold text-gray-700 px-1">Relaciones</legend>
              <div className="space-y-1.5">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.proveedor}
                    onChange={(e) => handleInputChange('proveedor', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Proveedor</label>
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
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.agenciaTransporte}
                    onChange={(e) => handleInputChange('agenciaTransporte', e.target.checked)}
                    disabled={!isEditMode}
                    className={`mr-2 ${!isEditMode ? 'opacity-50 cursor-not-allowed' : ''}`}
                  />
                  <label className={`text-sm ${!isEditMode ? 'text-gray-500' : 'text-gray-700'}`}>Agencia de Transport</label>
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
                </div>
              </div>
            </fieldset>
          </div>
        </div>

        {/* Vias de Contacto Section */}
        <fieldset className="border border-gray-400 p-2">
          <legend className="text-xs font-semibold text-gray-700 px-1">Vías de contacto</legend>
          <div className="grid grid-cols-3 gap-3">
            {/* Telefono */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Teléfono</label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value="34"
                  disabled
                  className="w-12 px-2 py-1 border border-gray-300 bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                />
                <input
                  type="text"
                  value={formData.telefono || ''}
                  onChange={(e) => handleInputChange('telefono', e.target.value)}
                  disabled={!isEditMode}
                  className={`flex-1 px-2 py-1 border border-gray-300 text-sm ${
                    isEditMode 
                      ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* Movil */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
                Móvil
              </label>
              <div className="flex gap-1">
                <input
                  type="text"
                  value="34"
                  disabled
                  className="w-12 px-2 py-1 border border-gray-300 bg-gray-100 text-gray-500 text-sm cursor-not-allowed"
                />
                <input
                  type="text"
                  value={formData.telefonoMovil || ''}
                  onChange={(e) => handleInputChange('telefonoMovil', e.target.value)}
                  disabled={!isEditMode}
                  className={`flex-1 px-2 py-1 border border-gray-300 text-sm ${
                    isEditMode 
                      ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                      : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                  }`}
                />
              </div>
            </div>

            {/* E-mail */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                E-mail
              </label>
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditMode}
                className={`w-full px-2 py-1 border border-gray-300 text-sm ${
                  isEditMode 
                    ? 'bg-white text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500' 
                    : 'bg-gray-100 text-gray-500 cursor-not-allowed'
                }`}
              />
            </div>
          </div>
        </fieldset>
      </div>


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
