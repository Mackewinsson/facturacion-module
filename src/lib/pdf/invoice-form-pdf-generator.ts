import jsPDF from 'jspdf'
import { Invoice, LineaFactura } from '@/lib/mock-data'

/**
 * Generates a PDF preview from invoice form data
 * Used for "Vista previa" before saving the invoice
 */
export function generateInvoiceFormPDF(formData: Partial<Invoice>): Blob {
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
  const formatCurrency = (amount: number | undefined): string => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0)
  }

  // Helper function to format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-'
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
  
  // BORRADOR watermark if not approved
  if (formData.status !== 'APPROVED') {
    doc.setFontSize(12)
    doc.setTextColor(255, 0, 0)
    doc.text('VISTA PREVIA', pageWidth - margin - 35, yPos)
    doc.setTextColor(0, 0, 0)
  }
  yPos += 10

  // Invoice number and date
  doc.setFontSize(12)
  doc.setFont('helvetica', 'normal')
  const invoiceNumber = `${formData.serie || ''}${formData.numero || ''}`
  doc.text(`Número: ${invoiceNumber || 'Pendiente'}`, margin, yPos)
  doc.text(`Fecha: ${formatDate(formData.fechaExpedicion)}`, pageWidth - margin - 50, yPos)
  yPos += 8

  // Line separator
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Store starting Y for both sections
  const sectionStartY = yPos

  // Emisor section (left side)
  const emisor = formData.emisor
  let emisorY = sectionStartY
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('EMISOR', margin, emisorY)
  emisorY += 6
  
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(emisor?.nombreORazonSocial || 'Empresa Emisora', margin, emisorY)
  emisorY += 5
  doc.text(`NIF: ${emisor?.NIF || '-'}`, margin, emisorY)
  emisorY += 5
  if (emisor?.domicilio) {
    doc.text(`${emisor.domicilio.calle || ''}`, margin, emisorY)
    emisorY += 5
    doc.text(`${emisor.domicilio.codigoPostal || ''} ${emisor.domicilio.municipio || ''}`, margin, emisorY)
    emisorY += 5
    doc.text(`${emisor.domicilio.provincia || ''}`, margin, emisorY)
    emisorY += 5
  }

  // Cliente section (right side) - starts at same Y as emisor
  const cliente = formData.cliente
  const clienteX = pageWidth / 2 + 10
  let clienteY = sectionStartY
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('CLIENTE', clienteX, clienteY)
  clienteY += 6

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.text(cliente?.nombreORazonSocial || 'Cliente', clienteX, clienteY)
  clienteY += 5
  doc.text(`NIF: ${cliente?.NIF || '-'}`, clienteX, clienteY)
  clienteY += 5

  if (cliente?.domicilio) {
    doc.text(cliente.domicilio.calle || '-', clienteX, clienteY)
    clienteY += 5
    const direccionCompleta = [
      cliente.domicilio.codigoPostal || '',
      cliente.domicilio.municipio || '',
      cliente.domicilio.provincia || ''
    ].filter(Boolean).join(' ')
    if (direccionCompleta) {
      doc.text(direccionCompleta, clienteX, clienteY)
      clienteY += 5
    }
  }

  // Set yPos to the lower of the two sections
  yPos = Math.max(emisorY, clienteY) + 5

  // Line separator
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Invoice lines section
  const lineas = formData.lineas || []
  if (lineas.length > 0) {
    // Table header
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    
    const colConcepto = margin
    const colCantidad = margin + 80
    const colPrecio = margin + 100
    const colIVA = margin + 125
    const colTotal = pageWidth - margin - 20
    
    doc.text('Concepto', colConcepto, yPos)
    doc.text('Cant.', colCantidad, yPos)
    doc.text('Precio', colPrecio, yPos)
    doc.text('IVA', colIVA, yPos)
    doc.text('Total', colTotal, yPos)
    yPos += 4
    
    doc.setLineWidth(0.2)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 5
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    
    lineas.forEach((linea: LineaFactura) => {
      const descripcion = linea.descripcion || 'Sin descripción'
      doc.text(descripcion.substring(0, 40), colConcepto, yPos)
      doc.text(String(linea.cantidad || 0), colCantidad, yPos)
      doc.text(formatCurrency(linea.precioUnitario), colPrecio, yPos)
      doc.text(`${linea.tipoIVA || 21}%`, colIVA, yPos)
      doc.text(formatCurrency(linea.totalLinea), colTotal, yPos, { align: 'right' })
      yPos += 6
      
      // Add detailed description if exists
      if (linea.descripcionDetallada) {
        doc.setFontSize(7)
        doc.setTextColor(100, 100, 100)
        doc.text(linea.descripcionDetallada.substring(0, 60), colConcepto + 5, yPos)
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(8)
        yPos += 4
      }
    })
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(128, 128, 128)
    doc.text('Sin líneas de factura', margin, yPos)
    doc.setTextColor(0, 0, 0)
    yPos += 8
  }

  yPos += 5
  doc.setLineWidth(0.3)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 10

  // Totals section
  const totales = formData.totales
  const totalColLabel = pageWidth - margin - 80
  const totalColValue = pageWidth - margin

  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  
  doc.text('Base Imponible:', totalColLabel, yPos)
  doc.text(formatCurrency(totales?.baseImponibleTotal), totalColValue, yPos, { align: 'right' })
  yPos += 6
  
  doc.text('Cuota IVA:', totalColLabel, yPos)
  doc.text(formatCurrency(totales?.cuotaIVATotal), totalColValue, yPos, { align: 'right' })
  yPos += 6
  
  if (totales?.cuotaRETotal && totales.cuotaRETotal > 0) {
    doc.text('Recargo Equiv.:', totalColLabel, yPos)
    doc.text(formatCurrency(totales.cuotaRETotal), totalColValue, yPos, { align: 'right' })
    yPos += 6
  }
  
  // Retention if applicable
  if (formData.aplicarRetencion && formData.importeRetencion) {
    doc.text(`Retención (${formData.porcentajeRetencion || 0}%):`, totalColLabel, yPos)
    doc.text(`-${formatCurrency(formData.importeRetencion)}`, totalColValue, yPos, { align: 'right' })
    yPos += 6
  }
  
  yPos += 4
  doc.setLineWidth(0.5)
  doc.line(totalColLabel - 5, yPos, pageWidth - margin, yPos)
  yPos += 8

  // Total amount
  doc.setFontSize(12)
  doc.setFont('helvetica', 'bold')
  doc.text('TOTAL FACTURA:', totalColLabel, yPos)
  doc.text(formatCurrency(totales?.totalFactura), totalColValue, yPos, { align: 'right' })

  // Payment info
  if (formData.formaPago) {
    yPos += 15
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.text(`Forma de pago: ${formData.formaPago}`, margin, yPos)
  }

  // Notes
  if (formData.notas) {
    yPos += 10
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text('Notas:', margin, yPos)
    yPos += 5
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    const notesLines = doc.splitTextToSize(formData.notas, contentWidth)
    doc.text(notesLines, margin, yPos)
  }

  // Footer
  const footerY = pageHeight - 15
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(128, 128, 128)
  doc.text('Vista previa - Documento no válido hasta ser guardado', margin, footerY)
  doc.text(new Date().toLocaleString('es-ES'), pageWidth - margin, footerY, { align: 'right' })

  // Generate blob
  return doc.output('blob')
}

