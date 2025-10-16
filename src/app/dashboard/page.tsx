'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { useCompanyName } from '@/hooks/useCompanyName'

export default function Dashboard() {
  const router = useRouter()
  const { user, isAuthenticated, logout } = useAuthStore()
  const companyName = useCompanyName()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-black">Dashboard - {companyName}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Bienvenido, {user?.name || `Usuario ${user?.userId}`}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Órdenes de Trabajo Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📋</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Vehículos</h3>
                  <p className="text-sm text-gray-500">Buscar vehículos por matrícula o número de orden</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/orders')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Ver Órdenes
                </button>
              </div>
            </div>

            {/* Facturación Card */}
            <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">🧾</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Facturación</h3>
                  <p className="text-sm text-gray-500">Crear y gestionar facturas</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  onClick={() => router.push('/facturacion')}
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Ver Facturas
                </button>
              </div>
            </div>


            {/* Clientes Card - Commented out for now */}
            {/* <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Clientes</h3>
                  <p className="text-sm text-gray-500">Gestionar clientes</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div> */}

            {/* Reportes Card - Commented out for now */}
            {/* <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📊</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Reportes</h3>
                  <p className="text-sm text-gray-500">Ver estadísticas</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div> */}

            {/* Inventario Card - Commented out for now */}
            {/* <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">📦</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Inventario</h3>
                  <p className="text-sm text-gray-500">Gestionar stock</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div> */}

            {/* Configuración Card - Commented out for now */}
            {/* <div className="bg-white rounded-lg shadow-sm border p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">⚙️</span>
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Configuración</h3>
                  <p className="text-sm text-gray-500">Ajustes del sistema</p>
                </div>
              </div>
              <div className="mt-4">
                <button
                  disabled
                  className="w-full bg-gray-300 text-gray-500 px-4 py-2 rounded-md text-sm font-medium cursor-not-allowed"
                >
                  Próximamente
                </button>
              </div>
            </div> */}

          </div>

          {/* Quick Stats - Commented out for now */}
          {/* <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Resumen Rápido</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">16</div>
                <div className="text-sm text-gray-500">Órdenes Totales</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">4</div>
                <div className="text-sm text-gray-500">Pendientes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">3</div>
                <div className="text-sm text-gray-500">En Proceso</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">9</div>
                <div className="text-sm text-gray-500">Completadas</div>
              </div>
            </div>
          </div> */}
        </div>
      </main>
    </div>
  )
}