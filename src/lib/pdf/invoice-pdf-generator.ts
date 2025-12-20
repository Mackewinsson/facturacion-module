import jsPDF from 'jspdf'
import { InvoiceFromDb } from '@/lib/invoice-db-service'

/**
 * Generates a PDF invoice from invoice data
 * Format follows Spanish invoice standards
 */
export function generateInvoicePDF(invoice: InvoiceFromDb): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - (margin * 2)
  let yPos = margin

  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount)
  }

  // Helper function to format date
  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // Helper function to add text with word wrap
  const addText = (text: string, x: number, y: number, maxWidth?: number, fontSize: number = 10) => {
    doc.setFontSize(fontSize)
    if (maxWidth) {
      const lines = doc.splitTextToSize(text, maxWidth)
      doc.text(lines, x, y)
      return y + (lines.length * (fontSize * 0.4))
    } else {
      doc.text(text, x, y)
      return y + (fontSize * 0.4)
    }
  }

  // Header - FACTURA title
  doc.setFontSize(24)
  doc.setFont('helvetica', 'bold')
  doc.text('FACTURA', margin, yPos)
  yPos += 10

  // Invoice number and date
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  doc.text(`Número: ${invoice.numero}`, margin, yPos)
  doc.text(`Fecha: ${formatDate(invoice.fecha)}`, pageWidth - margin - 50, yPos)
  yPos += 8

  // Line separator
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Emisor section (left side)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('EMISOR', margin, yPos)
  yPos += 6
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  // Note: Emisor data would come from company settings - using placeholder for now
  doc.text('Empresa Emisora', margin, yPos)
  yPos += 5
  doc.text('NIF: [NIF Emisor]', margin, yPos)
  yPos += 5
  doc.text('Dirección: [Dirección Emisor]', margin, yPos)
  yPos += 5
  doc.text('[Código Postal] [Población]', margin, yPos)
  yPos += 5
  doc.text('[Provincia]', margin, yPos)

  // Cliente section (right side)
  const clienteX = pageWidth / 2 + 10
  let clienteY = yPos - 25
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENTE', clienteX, clienteY)
  clienteY += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  clienteY = addText(invoice.clienteNombre, clienteX, clienteY, contentWidth / 2 - 10)
  clienteY += 2
  doc.text(`NIF: ${invoice.clienteNif || '-'}`, clienteX, clienteY)
  clienteY += 5

  if (invoice.direccion) {
    clienteY = addText(invoice.direccion.direccion || '-', clienteX, clienteY, contentWidth / 2 - 10)
    clienteY += 2
    const direccionCompleta = [
      invoice.direccion.codigoPostal || '',
      invoice.direccion.poblacion || '',
      invoice.direccion.provincia || ''
    ].filter(Boolean).join(' ')
    if (direccionCompleta) {
      clienteY = addText(direccionCompleta, clienteX, clienteY, contentWidth / 2 - 10)
    }
  }

  // Set yPos to the lower of the two sections
  yPos = Math.max(yPos, clienteY) + 10

  // Line separator
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Concepto/Descripción section
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('CONCEPTO', margin, yPos)
  yPos += 8

  // Note: Line items are not available in InvoiceFromDb structure
  // Displaying totals breakdown instead
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text('Facturación de servicios/productos', margin, yPos)
  yPos += 10

  // Totals table
  const tableStartY = yPos
  const col1X = margin
  const col2X = pageWidth - margin - 40
  const col3X = pageWidth - margin - 20

  // Table header
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text('Concepto', col1X, yPos)
  doc.text('Base Imponible', col2X, yPos)
  doc.text('IVA', col3X, yPos)
  yPos += 6

  doc.setLineWidth(0.2)
  doc.line(col1X, yPos, pageWidth - margin, yPos)
  yPos += 6

  // Base imponible breakdown
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  if (invoice.bases.bi1 > 0) {
    doc.text('Base 21%', col1X, yPos)
    doc.text(formatCurrency(invoice.bases.bi1), col2X, yPos, { align: 'right' })
    doc.text(formatCurrency(invoice.cuotasIva.ci1), col3X, yPos, { align: 'right' })
    yPos += 5
  }
  if (invoice.bases.bi2 > 0) {
    doc.text('Base 10%', col1X, yPos)
    doc.text(formatCurrency(invoice.bases.bi2), col2X, yPos, { align: 'right' })
    doc.text(formatCurrency(invoice.cuotasIva.ci2), col3X, yPos, { align: 'right' })
    yPos += 5
  }
  if (invoice.bases.bi3 > 0) {
    doc.text('Base 4%', col1X, yPos)
    doc.text(formatCurrency(invoice.bases.bi3), col2X, yPos, { align: 'right' })
    doc.text(formatCurrency(invoice.cuotasIva.ci3), col3X, yPos, { align: 'right' })
    yPos += 5
  }

  yPos += 3
  doc.setLineWidth(0.3)
  doc.line(col1X, yPos, pageWidth - margin, yPos)
  yPos += 6

  // Totals
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.text('TOTAL', col1X, yPos)
  doc.text(formatCurrency(invoice.totales.baseImponible), col2X, yPos, { align: 'right' })
  doc.text(formatCurrency(invoice.totales.iva), col3X, yPos, { align: 'right' })
  yPos += 8

  // Total amount
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  const totalLabel = 'TOTAL FACTURA:'
  const totalText = formatCurrency(invoice.totales.total)
  const totalLabelWidth = doc.getTextWidth(totalLabel)
  doc.text(totalLabel, pageWidth - margin - totalLabelWidth - doc.getTextWidth(totalText) - 5, yPos)
  doc.text(totalText, pageWidth - margin, yPos, { align: 'right' })

  // Footer
  const footerY = pageHeight - 15
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(128, 128, 128)
  doc.text('Esta factura ha sido generada electrónicamente', margin, footerY)
  doc.text(`ID: ${invoice.id}`, pageWidth - margin, footerY, { align: 'right' })

  // Generate blob
  return doc.output('blob')
}

