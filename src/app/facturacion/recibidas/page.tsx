'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function FacturasRecibidasPage() {
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
        <div className="px-4 py-6 lg:px-8">
          <div className="w-full">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h1 className="text-2xl font-semibold text-card-foreground">
                  Facturas Recibidas
                </h1>
                <p className="text-sm text-muted-foreground">
                  Gestiona las facturas recibidas de proveedores.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => router.push('/facturacion/recibidas/nueva')}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90"
                >
                  Nueva Factura Recibida
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center py-12">
                <div className="text-muted-foreground">
                  <svg className="mx-auto h-12 w-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-card-foreground mb-2">
                    No hay facturas recibidas
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comienza registrando tu primera factura recibida.
                  </p>
                  <button
                    onClick={() => router.push('/facturacion/recibidas/nueva')}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm hover:bg-accent/90"
                  >
                    Crear Factura Recibida
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
