'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { Cliente } from '@/lib/mock-data'

interface ClientSearchProps {
  onClientSelect: (client: Cliente | null) => void
  selectedClient?: Cliente | null
  placeholder?: string
  onAddNewClient?: (suggestedName?: string) => void
}

const dropdownBaseClasses =
  'absolute z-50 mt-1 w-full overflow-hidden rounded-xl border border-border bg-card shadow-xl'

const MOCK_CLIENTS: Cliente[] = [
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

export default function ClientSearch({
  onClientSelect,
  selectedClient,
  placeholder = 'Seleccionar contacto',
  onAddNewClient
}: ClientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const clients = MOCK_CLIENTS

  useEffect(() => {
    if (!isOpen) return
    inputRef.current?.focus()
  }, [isOpen])

  useEffect(() => {
    const closeOnClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', closeOnClickOutside)
    return () => document.removeEventListener('mousedown', closeOnClickOutside)
  }, [])

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) {
      return clients
    }

    const value = searchTerm.trim().toLowerCase()
    return clients.filter(client => {
      const nameMatches = client.nombreORazonSocial.toLowerCase().includes(value)
      const nifMatches = client.NIF?.toLowerCase().includes(value)
      const cityMatches = client.domicilio?.municipio
        ?.toLowerCase()
        .includes(value)
      return Boolean(nameMatches || nifMatches || cityMatches)
    })
  }, [clients, searchTerm])

  const toggleDropdown = () => {
    setIsOpen(prev => {
      const next = !prev
      if (next) {
        setSearchTerm('')
      }
      return next
    })
  }

  const handleClientSelect = (client: Cliente | null) => {
    onClientSelect(client)
    setIsOpen(false)
  }

  const handleAddNewClient = (term: string) => {
    if (!onAddNewClient) return
    onAddNewClient(term)
    setIsOpen(false)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleDropdown}
        className="flex w-full items-center justify-between rounded-lg border border-input-border bg-input px-3 py-2 text-left text-sm text-foreground shadow-sm transition hover:border-border focus:outline-none focus:ring-2 focus:ring-accent"
      >
        <span className={selectedClient ? 'text-foreground' : 'text-muted-foreground'}>
          {selectedClient ? selectedClient.nombreORazonSocial : placeholder}
        </span>
        <span className="ml-2 text-muted-foreground">▾</span>
      </button>

      {isOpen && (
        <div className={dropdownBaseClasses}>
          <div className="border-b border-border bg-muted px-3 py-2">
            <input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={event => setSearchTerm(event.target.value)}
              placeholder="Buscar por nombre, NIF o ciudad..."
              className="w-full rounded-lg border border-input-border bg-input px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
            />
          </div>
          <div className="max-h-64 overflow-y-auto">
            {selectedClient && (
              <button
                type="button"
                onClick={() => handleClientSelect(null)}
                className="flex w-full items-center justify-between px-4 py-3 text-sm text-muted-foreground transition hover:bg-secondary"
              >
                <span>Limpiar selección</span>
                <span className="text-muted-foreground">⌫</span>
              </button>
            )}

            {onAddNewClient && searchTerm.trim().length > 0 && !clients.some(client =>
              client.nombreORazonSocial.toLowerCase() === searchTerm.trim().toLowerCase()
            ) && (
              <button
                type="button"
                onClick={() => handleAddNewClient(searchTerm.trim())}
                className="flex w-full items-center gap-2 px-4 py-3 text-sm font-medium text-blue-600 transition hover:bg-blue-50"
              >
                <span className="text-lg leading-none">＋</span>
                Añadir: {searchTerm.trim()}
              </button>
            )}

            {filteredClients.length === 0 ? (
              <p className="px-4 py-3 text-sm text-muted-foreground">
                {searchTerm.trim()
                  ? 'No se encontraron coincidencias'
                  : 'Empieza a escribir para buscar un contacto'}
              </p>
            ) : (
              filteredClients.map(client => (
                <button
                  key={`${client.nombreORazonSocial}-${client.NIF ?? 'sin-nif'}`}
                  type="button"
                  onClick={() => handleClientSelect(client)}
                  className="flex w-full items-start justify-between gap-3 px-4 py-3 text-left text-sm text-card-foreground transition hover:bg-secondary"
                >
                  <div>
                    <p className="font-medium text-card-foreground">{client.nombreORazonSocial}</p>
                    <p className="text-xs text-muted-foreground">
                      {client.NIF ? `NIF: ${client.NIF}` : 'Sin NIF'}
                    </p>
                    {client.domicilio && (
                      <p className="text-xs text-muted-foreground">
                        {client.domicilio.municipio}, {client.domicilio.provincia}
                      </p>
                    )}
                  </div>
                  <span
                    className={`mt-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                      client.tipo === 'particular'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-green-100 text-green-700'
                    }`}
                  >
                    {client.tipo === 'particular' ? 'Particular' : 'Empresa'}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
