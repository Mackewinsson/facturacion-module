'use client'
import { useState, useEffect } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { MockEntityService, Entidad } from '@/lib/mock-data'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'
import EntityModal from '@/components/EntityModal'
import AddClientModal from '@/components/AddClientModal'

export default function EntidadesPage() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { isAuthenticated } = useAuthStore()
  const [entities, setEntities] = useState<Entidad[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [totalResults, setTotalResults] = useState(0)
  const [tipoEntidadFilter, setTipoEntidadFilter] = useState<'ALL' | 'cliente' | 'proveedor' | 'vendedor'>('ALL')
  const [columnFilters, setColumnFilters] = useState({
    nif: '',
    nombre: '',
    telefono: ''
  })
  const [selectedEntity, setSelectedEntity] = useState<Entidad | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)

  useEffect(() => {
    // Authentication disabled for development
    // if (!isAuthenticated) {
    //   router.push('/login')
    //   return
    // }
    loadEntities()
  }, [isAuthenticated, router, columnFilters, tipoEntidadFilter])

  // Initialize tipoEntidadFilter from URL or localStorage
  useEffect(() => {
    const urlTipo = searchParams.get('tipo')
    const validTipos = ['ALL', 'cliente', 'proveedor', 'vendedor']
    if (urlTipo && validTipos.includes(urlTipo)) {
      setTipoEntidadFilter(urlTipo as 'ALL' | 'cliente' | 'proveedor' | 'vendedor')
      return
    }
    const saved = typeof window !== 'undefined' ? localStorage.getItem('entidades.tipoFilter') : null
    if (saved && validTipos.includes(saved)) {
      setTipoEntidadFilter(saved as 'ALL' | 'cliente' | 'proveedor' | 'vendedor')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Persist tipoEntidadFilter to URL and localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('entidades.tipoFilter', tipoEntidadFilter)
      } catch {}
    }
    // Sync query param without losing other params
    const params = new URLSearchParams(searchParams.toString())
    if (tipoEntidadFilter === 'ALL') {
      params.delete('tipo')
    } else {
      params.set('tipo', tipoEntidadFilter)
    }
    const queryString = params.toString()
    const href = queryString ? `${pathname}?${queryString}` : pathname
    router.replace(href)
  }, [tipoEntidadFilter, pathname, router, searchParams])

  const loadEntities = async () => {
    try {
      setLoading(true)
      const data = await MockEntityService.getEntities({
        page: 1,
        limit: 1000, // Load all entities
        columnFilters: columnFilters,
        tipoEntidadFilter: tipoEntidadFilter
      })

      setEntities(data.entities)
      setTotalResults(data.total)
    } catch (err) {
      setError('Error al cargar las entidades')
      console.error('Error loading entities:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEntity = () => {
    setIsAddModalOpen(true)
  }

  const handleViewEntity = (id: number) => {
    router.push(`/entidades/editar/${id}`)
  }

  const handleRowClick = (entity: Entidad) => {
    setSelectedEntity(entity)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedEntity(null)
  }

  const handleModalView = (id: number) => {
    handleCloseModal()
    handleViewEntity(id)
  }

  const handleModalEdit = (id: number) => {
    handleCloseModal()
    router.push(`/entidades/editar/${id}`)
  }

  const handleModalDelete = async (id: number) => {
    if (confirm('¿Estás seguro de que quieres eliminar esta entidad?')) {
      try {
        await MockEntityService.deleteEntity(id)
        handleCloseModal()
        loadEntities() // Reload the list
      } catch (err) {
        console.error('Error deleting entity:', err)
        alert('Error al eliminar la entidad')
      }
    }
  }

  const handleEntityAdded = async (entityData: any) => {
    try {
      await MockEntityService.createEntity(entityData)
      setIsAddModalOpen(false)
      loadEntities() // Reload the list
    } catch (err) {
      console.error('Error creating entity:', err)
      alert('Error al crear la entidad')
    }
  }

  const handleTipoEntidadFilterChange = (value: 'ALL' | 'cliente' | 'proveedor' | 'vendedor') => {
    setTipoEntidadFilter(value)
  }

  const handleColumnFilterChange = (columnName: string, value: string) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnName]: value
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES')
  }

  // Authentication disabled for development
  // if (!isAuthenticated) {
  //   return null
  // }

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-gray-500">Cargando entidades...</div>
        </div>
      </LayoutWithSidebar>
    )
  }

  return (
    <LayoutWithSidebar>
      <div className="bg-background">
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 mb-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            {/* Left Side - Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleCreateEntity}
                className="flex items-center gap-2 px-3 py-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-md text-sm font-medium"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Nueva Entidad
              </button>

              {/* Dropdown: Filtrar por tipo de entidad */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Tipo</span>
                <select
                  value={tipoEntidadFilter}
                  onChange={e => handleTipoEntidadFilterChange(e.target.value as 'ALL' | 'cliente' | 'proveedor' | 'vendedor')}
                  className="rounded-md border border-input-border bg-input px-3 py-1 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="ALL">Todas</option>
                  <option value="cliente">Clientes</option>
                  <option value="proveedor">Proveedores</option>
                  <option value="vendedor">Vendedores</option>
                </select>
              </div>
            </div>

            {/* Right Side - Results Count */}
            <div className="text-sm text-muted-foreground">
              {totalResults} entidades encontradas
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
            {error}
          </div>
        )}

        <div className="bg-card rounded-lg shadow-sm border border-border">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-muted">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  <th className="px-6 py-3">
                    <input
                      type="text"
                      placeholder="Filtrar NIF..."
                      value={columnFilters.nif}
                      onChange={e => handleColumnFilterChange('nif', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs"
                    />
                    <div className="mt-1">NIF</div>
                  </th>
                  <th className="px-6 py-3">
                    <input
                      type="text"
                      placeholder="Filtrar Razón Social..."
                      value={columnFilters.nombre}
                      onChange={e => handleColumnFilterChange('nombre', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs"
                    />
                    <div className="mt-1">Razón Social</div>
                  </th>
                  <th className="px-6 py-3">
                    <input
                      type="text"
                      placeholder="Filtrar Teléfono..."
                      value={columnFilters.telefono}
                      onChange={e => handleColumnFilterChange('telefono', e.target.value)}
                      className="w-full bg-transparent border-none outline-none text-xs"
                    />
                    <div className="mt-1">Teléfono</div>
                  </th>
                  <th className="px-6 py-3">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-card divide-y divide-border">
                {entities.map((entity) => (
                  <tr
                    key={entity.id}
                    onClick={() => handleRowClick(entity)}
                    className="hover:bg-muted/50 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {entity.NIF}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {entity.razonSocial}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      {entity.telefono || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleViewEntity(entity.id)
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                        >
                          Ver
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Entity Modal */}
      <EntityModal
        entity={selectedEntity}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onView={handleModalView}
        onEdit={handleModalEdit}
        onDelete={handleModalDelete}
        onEntityUpdated={loadEntities}
      />

      {/* Add Entity Modal */}
      <AddClientModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onClientAdded={handleEntityAdded}
        isEntityModal={true}
      />
    </LayoutWithSidebar>
  )
}
