'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import SpanishInvoiceForm from '@/components/SpanishInvoiceForm'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function NuevaFacturaPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  if (!isAuthenticated) {
    return null
  }

  return (
    <LayoutWithSidebar>
      <div className="min-h-screen bg-gray-50">
        <SpanishInvoiceForm />
      </div>
    </LayoutWithSidebar>
  )
}
