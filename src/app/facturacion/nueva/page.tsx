'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import SpanishInvoiceForm from '@/components/SpanishInvoiceForm'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function NuevaFacturaPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()

  // Authentication disabled for development
  // useEffect(() => {
  //   if (!isAuthenticated) {
  //     router.push('/login')
  //   }
  // }, [isAuthenticated, router])

  // if (!isAuthenticated) {
  //   return null
  // }

  return (
    <LayoutWithSidebar>
      <div className="bg-background">
        <SpanishInvoiceForm hideISP hideRecargoEquivalencia allowedVATRates={[21]} />
      </div>
    </LayoutWithSidebar>
  )
}
