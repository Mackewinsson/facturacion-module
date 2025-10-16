'use client'
import { useState, useEffect, useRef } from 'react'
import { Cliente } from '@/lib/mock-data'

interface ClientSearchProps {
  onClientSelect: (client: Cliente) => void
  selectedClient?: Cliente | null
  placeholder?: string
  onAddNewClient?: (suggestedName?: string) => void
}

export default function ClientSearch({ onClientSelect, selectedClient, placeholder = "Buscar cliente...", onAddNewClient }: ClientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [clients, setClients] = useState<Cliente[]>([])
  const [filteredClients, setFilteredClients] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Mock client data - in a real app, this would come from an API
  const mockClients: Cliente[] = [
    {
      tipo: 'particular',
      nombreORazonSocial: 'Juan Pérez García',
      NIF: '12345678A',
      domicilio: {
        calle: 'Calle Mayor 123',
        codigoPostal: '28001',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Empresa ABC S.L.',
      NIF: 'B12345678',
      domicilio: {
        calle: 'Avenida de la Paz 45',
        codigoPostal: '08001',
        municipio: 'Barcelona',
        provincia: 'Barcelona',
        pais: 'España'
      },
      pais: 'España'
    },
    {
      tipo: 'particular',
      nombreORazonSocial: 'María López Fernández',
      NIF: '87654321B',
      domicilio: {
        calle: 'Plaza España 67',
        codigoPostal: '41001',
        municipio: 'Sevilla',
        provincia: 'Sevilla',
        pais: 'España'
      },
      pais: 'España'
    },
    {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Taller Mecánico García S.L.',
      NIF: 'B12345678',
      domicilio: {
        calle: 'Calle de la Industria 45',
        codigoPostal: '28045',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    },
    {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Proveedor de Repuestos S.A.',
      NIF: 'A11223344',
      domicilio: {
        calle: 'Carrer de la Tecnologia 89',
        codigoPostal: '08025',
        municipio: 'Barcelona',
        provincia: 'Barcelona',
        pais: 'España'
      },
      pais: 'España'
    },
    {
      tipo: 'empresario/profesional',
      nombreORazonSocial: 'Empresa de Pruebas S.A.',
      NIF: 'A12345678',
      domicilio: {
        calle: 'Avenida de las Pruebas 456',
        codigoPostal: '28080',
        municipio: 'Madrid',
        provincia: 'Madrid',
        pais: 'España'
      },
      pais: 'España'
    }
  ]

  useEffect(() => {
    setClients(mockClients)
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredClients([])
      return
    }

    const filtered = clients.filter(client => 
      client.nombreORazonSocial.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.NIF && client.NIF.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.domicilio?.municipio && client.domicilio.municipio.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    setFilteredClients(filtered)
  }, [searchTerm, clients])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleClientSelect = (client: Cliente) => {
    onClientSelect(client)
    setSearchTerm(client.nombreORazonSocial)
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    setIsOpen(value.trim() !== '')
    
    // If user clears the search, clear the selected client
    if (value.trim() === '') {
      onClientSelect(null as any)
    }
  }

  const clearSelection = () => {
    setSearchTerm('')
    setIsOpen(false)
    onClientSelect(null as any)
  }

  return (
    <div className="relative" ref={searchRef}>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(searchTerm.trim() !== '')}
          placeholder={placeholder}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10 text-black bg-white"
        />
        {selectedClient && (
          <button
            type="button"
            onClick={clearSelection}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        )}
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          🔍
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <div className="px-4 py-3">
              <div className="text-black text-sm mb-3">
                {searchTerm.trim() === '' ? 'Escribe para buscar clientes...' : 'No se encontraron clientes'}
              </div>
              {searchTerm.trim() !== '' && onAddNewClient && (
                <button
                  onClick={() => {
                    onAddNewClient?.(searchTerm)
                    setIsOpen(false)
                  }}
                  className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Agregar "{searchTerm}" como nuevo cliente
                </button>
              )}
            </div>
          ) : (
            <>
              {filteredClients.map((client, index) => (
                <div
                  key={index}
                  onClick={() => handleClientSelect(client)}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-black">
                        {client.nombreORazonSocial}
                      </div>
                      <div className="text-sm text-gray-700">
                        {client.NIF && `NIF: ${client.NIF}`}
                      </div>
                      {client.domicilio && (
                        <div className="text-sm text-gray-700">
                          {client.domicilio.municipio}, {client.domicilio.provincia}
                        </div>
                      )}
                    </div>
                    <div className="ml-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        client.tipo === 'particular' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {client.tipo === 'particular' ? 'Particular' : 'Empresa'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              {onAddNewClient && (
                <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                  <button
                    onClick={() => {
                      onAddNewClient?.()
                      setIsOpen(false)
                    }}
                    className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium flex items-center justify-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Agregar nuevo cliente
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
