'use client'
import { useState } from 'react'
import { Cliente, TipoCliente } from '@/lib/mock-data'

interface AddClientModalProps {
  isOpen: boolean
  onClose: () => void
  onClientAdded: (client: Cliente) => void
  suggestedName?: string
}

export default function AddClientModal({ isOpen, onClose, onClientAdded, suggestedName = '' }: AddClientModalProps) {
  const [formData, setFormData] = useState({
    tipo: 'particular' as TipoCliente,
    nombreORazonSocial: suggestedName,
    NIF: '',
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
        tipo: 'particular',
        nombreORazonSocial: '',
        NIF: '',
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

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Agregar Nuevo Cliente</h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.length > 0 && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-900 rounded">
              <ul className="list-disc list-inside">
                {errors.map((error, index) => (
                  <li key={index} className="text-sm font-medium">{error}</li>
                ))}
              </ul>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Tipo de Cliente *
                </label>
                <select
                  value={formData.tipo}
                  onChange={(e) => handleInputChange('tipo', e.target.value as TipoCliente)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="particular">Particular</option>
                  <option value="empresario/profesional">Empresario/Profesional</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  Nombre o Razón Social *
                </label>
                <input
                  type="text"
                  value={formData.nombreORazonSocial}
                  onChange={(e) => handleInputChange('nombreORazonSocial', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="Nombre completo o razón social"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  NIF {formData.tipo === 'empresario/profesional' && '*'}
                </label>
                <input
                  type="text"
                  value={formData.NIF}
                  onChange={(e) => handleInputChange('NIF', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                  placeholder="12345678A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-1">
                  País *
                </label>
                <input
                  type="text"
                  value={formData.pais}
                  onChange={(e) => handleInputChange('pais', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-900 mb-1">
                Domicilio {formData.tipo === 'empresario/profesional' && '*'}
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <input
                  type="text"
                  value={formData.domicilio.calle}
                  onChange={(e) => handleInputChange('domicilio.calle', e.target.value)}
                  placeholder="Calle"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.domicilio.codigoPostal}
                  onChange={(e) => handleInputChange('domicilio.codigoPostal', e.target.value)}
                  placeholder="Código Postal"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.domicilio.municipio}
                  onChange={(e) => handleInputChange('domicilio.municipio', e.target.value)}
                  placeholder="Municipio"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.domicilio.provincia}
                  onChange={(e) => handleInputChange('domicilio.provincia', e.target.value)}
                  placeholder="Provincia"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <input
                  type="text"
                  value={formData.domicilio.pais}
                  onChange={(e) => handleInputChange('domicilio.pais', e.target.value)}
                  placeholder="País"
                  className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-900 bg-gray-200 rounded-md hover:bg-gray-300 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium"
              >
                Agregar Cliente
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
