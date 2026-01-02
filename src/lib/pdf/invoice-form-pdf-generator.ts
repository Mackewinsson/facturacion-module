import jsPDF from 'jspdf'
import { Invoice, LineaFactura } from '@/lib/mock-data'

/**
 * Generates a PDF preview from invoice form data
 * Format matches the Niauto/SuzukiCenter invoice design
 */
export function generateInvoiceFormPDF(formData: Partial<Invoice>): Blob {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 15
  let yPos = margin

  // Helper function to format currency (Spanish format: 282,56 €)
  const formatCurrency = (amount: number | undefined): string => {
    if (!amount) return '0,00 €'
    const formatted = new Intl.NumberFormat('es-ES', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
    return `${formatted} €`
  }

  // Helper function to format date
  const formatDate = (dateString: string | undefined): string => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    })
  }

  // Header Section
  // Company logo placeholder on the left
  const emisor = formData.emisor
  const companyName = emisor?.nombreORazonSocial || 'Empresa'
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  doc.text(companyName, margin, yPos)
  
  // Company logo placeholder on the right (same company name)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const companyNameWidth = doc.getTextWidth(companyName)
  doc.text(companyName, pageWidth - margin - companyNameWidth, yPos)
  yPos += 5

  // Horizontal line separator
  doc.setLineWidth(0.5)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 8

  // Invoice Details Box (two columns)
  const boxStartY = yPos
  const boxHeight = 35
  const boxEndY = boxStartY + boxHeight
  const col1X = margin + 2
  const col2X = pageWidth / 2 + 5
  const lineHeight = 5

  // Draw box border
  doc.setLineWidth(0.3)
  doc.rect(margin, boxStartY, pageWidth - (margin * 2), boxHeight)

  // Left Column
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  let col1Y = boxStartY + 5

  // Factura (format: F1104936 (G1138201) or similar)
  const invoiceNumber = formData.numero || ''
  const serie = formData.serie || ''
  const invoiceDisplay = invoiceNumber 
    ? (serie ? `${serie}${invoiceNumber}` : invoiceNumber)
    : 'Pendiente'
  doc.text(`Factura:`, col1X, col1Y)
  doc.setFont('helvetica', 'bold')
  doc.text(invoiceDisplay, col1X + 18, col1Y)
  col1Y += lineHeight

  // Fecha
  doc.setFont('helvetica', 'normal')
  doc.text(`Fecha:`, col1X, col1Y)
  doc.text(formatDate(formData.fechaExpedicion), col1X + 18, col1Y)
  col1Y += lineHeight

  // Tipo
  const tipoText = formData.tipoFactura === 'recibida' 
    ? 'Compra Rec (Proveedor)' 
    : 'Venta Rec (Cliente)'
  doc.text(`Tipo:`, col1X, col1Y)
  doc.text(tipoText, col1X + 18, col1Y)
  col1Y += lineHeight

  // Vendedor (using a default or empty)
  doc.text(`Vendedor:`, col1X, col1Y)
  doc.text('-', col1X + 18, col1Y)
  col1Y += lineHeight

  // N.I.F. Cliente
  doc.text(`N.I.F. Cliente:`, col1X, col1Y)
  doc.text(formData.cliente?.NIF || '-', col1X + 18, col1Y)
  col1Y += lineHeight

  // Teléfono (not available in Cliente interface, using placeholder)
  doc.text(`Teléfono:`, col1X, col1Y)
  doc.text('-', col1X + 18, col1Y)

  // Right Column
  let col2Y = boxStartY + 5

  // Cliente
  doc.text(`Cliente:`, col2X, col2Y)
  const clienteNombre = formData.cliente?.nombreORazonSocial || 'MOSTRADOR'
  doc.text(clienteNombre + ',', col2X + 18, col2Y)
  col2Y += lineHeight

  // Dirección
  doc.text(`Dirección:`, col2X, col2Y)
  const direccion = formData.cliente?.domicilio?.calle || '-'
  doc.text(direccion, col2X + 18, col2Y)
  col2Y += lineHeight

  // Población
  doc.text(`Población:`, col2X, col2Y)
  const poblacion = formData.cliente?.domicilio?.municipio || '-'
  doc.text(poblacion, col2X + 18, col2Y)
  col2Y += lineHeight

  // Provincia
  doc.text(`Provincia:`, col2X, col2Y)
  const provincia = formData.cliente?.domicilio?.provincia || 'MALAGA'
  doc.text(provincia.toUpperCase(), col2X + 18, col2Y)
  col2Y += lineHeight

  // C.P.
  doc.text(`C.P:`, col2X, col2Y)
  const cp = formData.cliente?.domicilio?.codigoPostal || '29000'
  doc.text(cp, col2X + 18, col2Y)

  yPos = boxEndY + 8

  // "Factura" title (large, bold, underlined)
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text('Factura', margin, yPos)
  
  // "Page 1 of 1" in top right
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  const pageText = 'Page 1 of 1'
  doc.text(pageText, pageWidth - margin - doc.getTextWidth(pageText), yPos - 2)
  
  // Underline "Factura"
  const facturaWidth = doc.getTextWidth('Factura')
  doc.setLineWidth(0.5)
  doc.line(margin, yPos + 1, margin + facturaWidth, yPos + 1)
  
  yPos += 10

  // Table Header
  doc.setFontSize(8)
  doc.setFont('helvetica', 'bold')
  
  const colRef = margin
  const colArticulo = margin + 25
  const colPrecio = margin + 100
  const colDto = margin + 125
  const colCant = margin + 140
  const colImporte = pageWidth - margin - 20

  doc.text('Referencia', colRef, yPos)
  doc.text('Artículo', colArticulo, yPos)
  doc.text('Precio', colPrecio, yPos)
  doc.text('Dto', colDto, yPos)
  doc.text('Cant', colCant, yPos)
  doc.text('Importe', colImporte, yPos, { align: 'right' })
  
  yPos += 4
  doc.setLineWidth(0.2)
  doc.line(margin, yPos, pageWidth - margin, yPos)
  yPos += 5

  // Table Rows
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  
  const lineas = formData.lineas || []
  if (lineas.length > 0) {
    lineas.forEach((linea: LineaFactura, index: number) => {
      // Referencia (using line ID or index)
      const referencia = linea.id ? String(linea.id) : `${index + 1}`
      doc.text(referencia, colRef, yPos)
      
      // Artículo (description)
      const articulo = linea.descripcion || 'Sin descripción'
      const maxArticuloWidth = colPrecio - colArticulo - 2
      const articuloLines = doc.splitTextToSize(articulo, maxArticuloWidth)
      doc.text(articuloLines[0], colArticulo, yPos)
      
      // Precio
      doc.text(formatCurrency(linea.precioUnitario), colPrecio, yPos)
      
      // Dto (discount percentage)
      const descuento = linea.descuentoPct || 0
      doc.text(`${descuento}%`, colDto, yPos)
      
      // Cant (quantity)
      doc.text(String(linea.cantidad || 1), colCant, yPos)
      
      // Importe (total line amount)
      doc.text(formatCurrency(linea.totalLinea), colImporte, yPos, { align: 'right' })
      
      yPos += 6
      
      // If description is too long, add continuation lines
      if (articuloLines.length > 1) {
        for (let i = 1; i < articuloLines.length; i++) {
          doc.text(articuloLines[i], colArticulo, yPos)
          yPos += 4
        }
      }
      
      // Add detailed description if exists
      if (linea.descripcionDetallada) {
        doc.setFontSize(7)
        doc.setTextColor(100, 100, 100)
        const detalleLines = doc.splitTextToSize(linea.descripcionDetallada, maxArticuloWidth)
        detalleLines.forEach((line: string) => {
          doc.text(line, colArticulo + 2, yPos)
          yPos += 4
        })
        doc.setTextColor(0, 0, 0)
        doc.setFontSize(8)
      }
    })
  } else {
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(128, 128, 128)
    doc.text('Sin líneas de factura', colArticulo, yPos)
    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')
    yPos += 8
  }

  yPos += 8

  // Totals section (if needed, can be added below)
  const totales = formData.totales
  if (totales && totales.totalFactura) {
    doc.setLineWidth(0.3)
    doc.line(margin, yPos, pageWidth - margin, yPos)
    yPos += 8

    const totalColLabel = pageWidth - margin - 50
    const totalColValue = pageWidth - margin

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    
    if (totales.baseImponibleTotal) {
      doc.text('Base Imponible:', totalColLabel, yPos)
      doc.text(formatCurrency(totales.baseImponibleTotal), totalColValue, yPos, { align: 'right' })
      yPos += 6
    }
    
    if (totales.cuotaIVATotal) {
      doc.text('Cuota IVA:', totalColLabel, yPos)
      doc.text(formatCurrency(totales.cuotaIVATotal), totalColValue, yPos, { align: 'right' })
      yPos += 6
    }
    
    if (totales.cuotaRETotal && totales.cuotaRETotal > 0) {
      doc.text('Recargo Equiv.:', totalColLabel, yPos)
      doc.text(formatCurrency(totales.cuotaRETotal), totalColValue, yPos, { align: 'right' })
      yPos += 6
    }
    
    yPos += 4
    doc.setLineWidth(0.5)
    doc.line(totalColLabel - 5, yPos, pageWidth - margin, yPos)
    yPos += 8

    // Total amount
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text('TOTAL:', totalColLabel, yPos)
    doc.text(formatCurrency(totales.totalFactura), totalColValue, yPos, { align: 'right' })
  }

  // Footer (only if preview)
  if (formData.status !== 'APPROVED') {
    const footerY = pageHeight - 10
    doc.setFontSize(7)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(128, 128, 128)
    doc.text('Vista previa - Documento no válido hasta ser guardado', margin, footerY)
  }

  // Generate blob
  return doc.output('blob')
}
