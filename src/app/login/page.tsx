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
      setError('Por favor selecciona un usuario')
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
        const data = await response.json()
        const { user, token } = data
        if (!user || !token) {
          setError('Respuesta de login inválida')
          return
        }
        login(user, token)
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
    <div className="min-h-screen bg-gray-50 px-4 py-8 flex items-center justify-center">
      <div className="max-w-md w-full space-y-6 rounded-2xl bg-white p-6 shadow-sm sm:space-y-8 sm:p-8">
        <div>
          <h2 className="mt-2 text-center text-2xl font-extrabold text-gray-900 sm:mt-6 sm:text-3xl">
            Iniciar Sesión
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Selecciona tu usuario y contraseña
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="user" className="sr-only">
                Usuario
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
                  {loadingUsers ? 'Cargando usuarios...' : 'Selecciona un usuario'}
                </option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.displayName || `Usuario ${user.id}`}
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
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}