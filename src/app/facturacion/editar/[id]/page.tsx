'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth'
import { MockInvoiceService, Invoice } from '@/lib/mock-data'
import LayoutWithSidebar from '@/components/LayoutWithSidebar'

export default function VerFacturaPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const [invoiceData, setInvoiceData] = useState<Partial<Invoice> | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    // Authentication disabled for development
    // if (!isAuthenticated) {
    //   router.push('/login')
    //   return
    // }
    loadInvoice()
  }, [isAuthenticated, router, params.id])

  const loadInvoice = async () => {
    try {
      const invoice = await MockInvoiceService.getInvoice(parseInt(params.id))
      if (invoice) {
        setInvoiceData(invoice)
      } else {
        setError('Error al cargar la factura')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Authentication disabled for development
  // if (!isAuthenticated) {
  //   return null
  // }

  if (loading) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-gray-500">Cargando factura...</div>
        </div>
      </LayoutWithSidebar>
    )
  }

  if (error) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-600 mb-4">{error}</div>
            <button
              onClick={() => router.push('/facturacion')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Volver a Facturación
            </button>
          </div>
        </div>
      </LayoutWithSidebar>
    )
  }

  if (!invoiceData) {
    return (
      <LayoutWithSidebar>
        <div className="h-screen bg-background flex items-center justify-center">
          <div className="text-center">
            <div className="text-gray-500 mb-4">Factura no encontrada</div>
            <button
              onClick={() => router.push('/facturacion')}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Volver a Facturación
            </button>
          </div>
        </div>
      </LayoutWithSidebar>
    )
  }

  return (
    <LayoutWithSidebar>
      <div className="bg-background px-4 py-6 lg:px-8">
        <div className="w-full">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border px-6 py-5">
              <div>
                <h1 className="text-2xl font-semibold text-card-foreground">
                  Ver Factura
                </h1>
                <p className="text-sm text-muted-foreground">
                  Vista de solo lectura de la factura.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push('/facturacion')}
                  className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary"
                >
                  Volver
                </button>
              </div>
            </div>

            {/* Invoice Content - Read Only */}
            <div className="space-y-6 px-6 py-6">
              {/* Header Section - Row 1: Dpto, Factura, Fecha */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Dpto.</label>
                  <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                    {invoiceData.departamento || 'Administración'}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">Factura</label>
                  <div className="text-lg font-semibold text-card-foreground">
                    {invoiceData.serie}{invoiceData.numero}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-card-foreground mb-2">de fecha</label>
                  <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                    {invoiceData.fechaExpedicion}
                  </div>
                </div>
              </div>

              {/* Header Section - Row 2: Imputation (Left) and Client (Right) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Imputation & Reference */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Imputación</label>
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {invoiceData.imputacion || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Mantenimiento - Cliente</label>
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {invoiceData.mantenimientoCliente || 'Mantenimiento - Cliente'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Serie X7 Número</label>
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {invoiceData.numero || ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-sm text-muted-foreground">
                      Exportación/Importación: {invoiceData.exportacionImportacion ? 'Sí' : 'No'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Notas</label>
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md min-h-[80px]">
                      {invoiceData.notas || '-'}
                    </div>
                  </div>
                </div>

                {/* Right Column: Client & Payment */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Cliente</label>
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {invoiceData.cliente?.nombreORazonSocial || '-'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Dirección</label>
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {invoiceData.cliente?.domicilio ? 
                        `${invoiceData.cliente.domicilio.calle}, ${invoiceData.cliente.domicilio.municipio}` : 
                        '-'
                      }
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">Forma pago</label>
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {invoiceData.formaPago || 'Contado'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-card-foreground mb-2">M. pago</label>
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                      {invoiceData.medioPago || 'Sin Pagar'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Concept Section */}
              <section>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="text-lg font-semibold text-card-foreground">Concepto</h2>
                  </div>
                  <div className="p-5">
                    <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md min-h-[120px]">
                      {invoiceData.lineas?.[0]?.descripcion || '-'}
                    </div>
                  </div>
                </div>
              </section>

              {/* Totals Section */}
              <section>
                <div className="overflow-hidden rounded-2xl border border-border bg-card">
                  <div className="border-b border-border px-5 py-4">
                    <h2 className="text-lg font-semibold text-card-foreground">Totales y Cálculos</h2>
                  </div>
                  <div className="p-5">
                    <div className="space-y-4">
                      {/* Row 1: Cta.Ingr. and Base */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">Cta.Ingr.</label>
                          <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                            {invoiceData.ctaIngreso || '-'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">Base</label>
                          <div className="text-lg font-semibold text-card-foreground">
                            {formatCurrency(invoiceData.totales?.baseImponibleTotal || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Row 2: IVA and Cuota IVA */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">IVA</label>
                          <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                            {invoiceData.lineas?.[0]?.tipoIVA || 21}% - {formatCurrency(invoiceData.totales?.cuotaIVATotal || 0)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">Cuota IVA</label>
                          <div className="text-lg font-semibold text-card-foreground">
                            {formatCurrency(invoiceData.totales?.cuotaIVATotal || 0)}
                          </div>
                        </div>
                      </div>

                      {/* Row 3: Rec. (Surcharge) */}
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-card-foreground mb-2">Rec.</label>
                          <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                            {invoiceData.lineas?.[0]?.recargoEquivalenciaPct || 5}% - {formatCurrency(invoiceData.totales?.cuotaRETotal || 0)}
                          </div>
                        </div>
                        <div></div>
                      </div>

                      {/* Row 4: Aplicar retención */}
                      <div className="flex items-center gap-2">
                        <div className="text-sm text-muted-foreground">
                          Aplicar retención: {invoiceData.aplicarRetencion ? 'Sí' : 'No'}
                        </div>
                      </div>

                      {/* Row 5: Withholding fields (if applicable) */}
                      {invoiceData.aplicarRetencion && (
                        <div className="grid grid-cols-4 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-card-foreground mb-2">Cta. Ret.</label>
                            <div className="text-sm text-muted-foreground bg-muted px-3 py-2 rounded-md">
                              {invoiceData.ctaRetencion || '0000 000 0000'}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-card-foreground mb-2">Base</label>
                            <div className="text-sm font-medium text-card-foreground">
                              {formatCurrency(invoiceData.baseRetencion || 0)}
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-card-foreground mb-2">%</label>
                            <div className="text-sm font-medium text-card-foreground">
                              {invoiceData.porcentajeRetencion || 0}%
                            </div>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-card-foreground mb-2">Importe</label>
                            <div className="text-sm font-medium text-card-foreground">
                              {formatCurrency(invoiceData.importeRetencion || 0)}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Row 6: Total factura */}
                      <div className="flex justify-between items-center pt-4 border-t border-border">
                        <label className="text-lg font-medium text-card-foreground">Total factura</label>
                        <div className="text-2xl font-bold text-card-foreground">
                          {formatCurrency(invoiceData.totales?.totalFactura || 0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </LayoutWithSidebar>
  )
}
