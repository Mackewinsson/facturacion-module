'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'

interface User {
  id: number
  accessLevel: number
  adminLevel: number
  displayName: string
  entities: Array<{
    id: number
    name: string
  }>
}

export default function Login() {
  const [selectedUserId, setSelectedUserId] = useState<number | ''>('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState<User[]>([])
  const [loadingUsers, setLoadingUsers] = useState(true)
  
  const router = useRouter()
  const login = useAuthStore((state) => state.login)

  // Fetch users from the database
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        console.log('Fetching users...')
        const response = await fetch('/api/users')
        console.log('Response status:', response.status)
        if (response.ok) {
          const userData = await response.json()
          console.log('Users data received:', userData.length, 'users')
          setUsers(userData)
          setLoadingUsers(false)
        } else {
          console.error('Error response:', response.status, response.statusText)
          setError('Error al cargar usuarios')
          setLoadingUsers(false)
        }
      } catch (error) {
        console.error('Fetch error:', error)
        setError('Error al cargar usuarios')
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (!selectedUserId) {
      setError('Por favor selecciona una empresa')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: selectedUserId, password }),
      })

      if (response.ok) {
        const user = await response.json()
        login(user)
        router.push('/facturacion')
      } else {
        const errorData = await response.json()
        setError(errorData.message || 'Error en el login')
      }
    } catch {
      setError('Ocurrió un error. Por favor intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Selecciona tu empresa y contraseña
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="user" className="sr-only">
                Empresa
              </label>
              <select
                id="user"
                name="user"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                value={selectedUserId}
                onChange={(e) => setSelectedUserId(Number(e.target.value) || '')}
                disabled={loadingUsers}
              >
                <option value="">
                  {loadingUsers ? 'Cargando empresas...' : 'Selecciona una empresa'}
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.entities.length > 0 ? user.entities[0].name : `Usuario ${user.id}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Contraseña
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}


          <div>
            <button
              type="submit"
              disabled={loading || loadingUsers}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}