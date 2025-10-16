'use client'
import { useState } from 'react'
import { Cliente, TipoCliente } from '@/lib/mock-data'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: (client: Cliente) => void
  suggestedName?: string
}

type ContactType = 'empresa' | 'persona'
type TabType = 'basico' | 'cuentas' | 'preferencias' | 'contabilidad'

export default function AddClientModal({ isOpen, onClose, onClientAdded, suggestedName = '' }: AddClientModalProps) {
  const [contactType, setContactType] = useState<ContactType>('empresa')
  const [activeTab, setActiveTab] = useState<TabType>('basico')
  const [formData, setFormData] = useState({
    tipo: 'empresario/profesional' as TipoCliente,
    nombreORazonSocial: suggestedName,
    NIF: '',
    email: '',
    telefono: '',
    movil: '',
    website: '',
    nombreComercial: '',
    identificacionVAT: '',
    tags: '',
    tipoContacto: 'Sin especificar',
    domicilio: {
      calle: '',
      codigoPostal: '',
      municipio: '',
      provincia: '',
      pais: 'España'
    },
    pais: 'España'
  })

  const [errors, setErrors] = useState<string[]>([])

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => {
      const newData = { ...prev }
      const keys = field.split('.')
      
      if (keys.length === 1) {
        newData[keys[0] as keyof typeof newData] = value
      } else if (keys.length === 2) {
        if (!newData[keys[0] as keyof typeof newData]) {
          newData[keys[0] as keyof typeof newData] = {} as any
        }
        (newData[keys[0] as keyof typeof newData] as any)[keys[1]] = value
      } else if (keys.length === 3) {
        if (!newData[keys[0] as keyof typeof newData]) {
          newData[keys[0] as keyof typeof newData] = {} as any
        }
        if (!(newData[keys[0] as keyof typeof newData] as any)[keys[1]]) {
          (newData[keys[0] as keyof typeof newData] as any)[keys[1]] = {}
        }
        (newData[keys[0] as keyof typeof newData] as any)[keys[1]][keys[2]] = value
      }
      
      return newData
    })
  }

  const handleContactTypeChange = (type: ContactType) => {
    setContactType(type)
    setFormData(prev => ({
      ...prev,
      tipo: type === 'empresa' ? 'empresario/profesional' : 'particular'
    }))
  }

  const validateForm = () => {
    const newErrors: string[] = []
    
    if (!formData.nombreORazonSocial.trim()) {
      newErrors.push('El nombre o razón social es obligatorio')
    }
    
    if (formData.tipo === 'empresario/profesional' && !formData.NIF.trim()) {
      newErrors.push('El NIF es obligatorio para empresarios/profesionales')
    }
    
    if (formData.tipo === 'empresario/profesional' && !formData.domicilio.calle.trim()) {
      newErrors.push('La dirección es obligatoria para empresarios/profesionales')
    }
    
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (validateForm()) {
      onClientAdded(formData)
      onClose()
      // Reset form
      setFormData({
        tipo: 'empresario/profesional',
        nombreORazonSocial: '',
        NIF: '',
        email: '',
        telefono: '',
        movil: '',
        website: '',
        nombreComercial: '',
        identificacionVAT: '',
        tags: '',
        tipoContacto: 'Sin especificar',
        domicilio: {
          calle: '',
          codigoPostal: '',
          municipio: '',
          provincia: '',
          pais: 'España'
        },
        pais: 'España'
      })
      setErrors([])
    }
  }

  const handleClose = () => {
    onClose()
    setErrors([])
  }

  const tabs = [
    { id: 'basico', label: 'Básico' },
    { id: 'cuentas', label: 'Cuentas' },
    { id: 'preferencias', label: 'Preferencias' },
    { id: 'contabilidad', label: 'Contabilidad' }
  ]

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Nuevo contacto</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contact Type Toggle */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Este contacto es...</label>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleContactTypeChange('empresa')}
                className={`px-4 py-2 rounded-md font-medium ${
                  contactType === 'empresa'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Empresa
              </button>
              <button
                type="button"
                onClick={() => handleContactTypeChange('persona')}
                className={`px-4 py-2 rounded-md font-medium ${
                  contactType === 'persona'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Persona
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          {/* <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div> */}

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-900 rounded">
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm font-medium">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {activeTab === 'basico' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                    <input
                      type="text"
                      value={formData.nombreORazonSocial}
                      onChange={(e) => handleInputChange('nombreORazonSocial', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Nombre"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
                    <input
                      type="text"
                      value={formData.domicilio.calle}
                      onChange={(e) => handleInputChange('domicilio.calle', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Dirección"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Población</label>
                      <input
                        type="text"
                        value={formData.domicilio.municipio}
                        onChange={(e) => handleInputChange('domicilio.municipio', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Población"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Código postal</label>
                      <input
                        type="text"
                        value={formData.domicilio.codigoPostal}
                        onChange={(e) => handleInputChange('domicilio.codigoPostal', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Código postal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Provincia</label>
                    <input
                      type="text"
                      value={formData.domicilio.provincia}
                      onChange={(e) => handleInputChange('domicilio.provincia', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Provincia"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">País</label>
                    <select
                      value={formData.domicilio.pais}
                      onChange={(e) => handleInputChange('domicilio.pais', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="España">España</option>
                      <option value="Francia">Francia</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Italia">Italia</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nombre comercial</label>
                    <input
                      type="text"
                      value={formData.nombreComercial}
                      onChange={(e) => handleInputChange('nombreComercial', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Nombre comercial"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Identificación VAT</label>
                    <input
                      type="text"
                      value={formData.identificacionVAT}
                      onChange={(e) => handleInputChange('identificacionVAT', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Identificación VAT"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Asignar usuarios</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Usuarios"
                    />
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIF del contacto</label>
                    <input
                      type="text"
                      value={formData.NIF}
                      onChange={(e) => handleInputChange('NIF', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="NIF del contacto"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Email"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
                      <input
                        type="tel"
                        value={formData.telefono}
                        onChange={(e) => handleInputChange('telefono', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Teléfono"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Móvil</label>
                      <input
                        type="tel"
                        value={formData.movil}
                        onChange={(e) => handleInputChange('movil', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                        placeholder="Móvil"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
                    <input
                      type="url"
                      value={formData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Website"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      value={formData.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                      placeholder="Tags"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de contacto</label>
                    <select
                      value={formData.tipoContacto}
                      onChange={(e) => handleInputChange('tipoContacto', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    >
                      <option value="Sin especificar">Sin especificar</option>
                      <option value="Cliente">Cliente</option>
                      <option value="Proveedor">Proveedor</option>
                      <option value="Cliente y Proveedor">Cliente y Proveedor</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* {activeTab === 'cuentas' && (
              <div className="text-center py-8 text-gray-500">
                <p>Contenido de la pestaña Cuentas</p>
              </div>
            )}

            {activeTab === 'preferencias' && (
              <div className="text-center py-8 text-gray-500">
                <p>Contenido de la pestaña Preferencias</p>
              </div>
            )}

            {activeTab === 'contabilidad' && (
              <div className="text-center py-8 text-gray-500">
                <p>Contenido de la pestaña Contabilidad</p>
              </div>
            )} */}

            <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Crear
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
