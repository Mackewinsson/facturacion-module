import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/auth'

interface CompanyResponse {
  success: boolean
  data: {
    name: string
  }
  error?: string
}

/**
 * Hook personalizado para obtener el nombre de la empresa
 * @returns {string} El nombre de la empresa o 'Empresa' como fallback
 */
export function useCompanyName(): string {
  const [companyName, setCompanyName] = useState<string>('Empresa')
  const token = useAuthStore((state) => state.token)

  useEffect(() => {
    const fetchCompanyName = async () => {
      if (!token) return // Don't fetch if not authenticated
      try {
        const response = await fetch('/api/company', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data: CompanyResponse = await response.json()
        
        if (data.success && data.data?.name) {
          setCompanyName(data.data.name)
        } else {
          console.warn('No se pudo obtener el nombre de la empresa:', data.error)
        }
      } catch (error) {
        console.error('Error al obtener el nombre de la empresa:', error)
        // Mantener el fallback 'Empresa'
      }
    }

    fetchCompanyName()
  }, [token])

  return companyName
}
