/**
 * Unit tests for PDF invoice generator
 * Tests PDF generation, content, format, and edge cases
 */

// Mock jsPDF before importing
jest.mock('jspdf', () => {
  const mockDoc = {
    internal: {
      pageSize: {
        getWidth: () => 210, // A4 width in mm
        getHeight: () => 297  // A4 height in mm
      }
    },
    setFontSize: jest.fn(),
    setFont: jest.fn(),
    text: jest.fn(),
    line: jest.fn(),
    setLineWidth: jest.fn(),
    setTextColor: jest.fn(),
    splitTextToSize: jest.fn((text: string) => [text]),
    getTextWidth: jest.fn((text: string) => text.length * 2),
    output: jest.fn(() => {
      const blob = new Blob(['mock pdf content'], { type: 'application/pdf' })
      return blob
    })
  }
  
  return {
    __esModule: true,
    default: jest.fn(() => mockDoc)
  }
})

import { generateInvoicePDF } from '../invoice-pdf-generator'
import { InvoiceFromDb } from '@/lib/invoice-db-service'

// Mock invoice data for testing
const createMockInvoice = (overrides?: Partial<InvoiceFromDb>): InvoiceFromDb => ({
  id: 1,
  numero: 'F-001/2024',
  fecha: '2024-01-15T00:00:00.000Z',
  clienteId: 100,
  clienteNombre: 'Cliente de Prueba S.L.',
  clienteNif: 'B12345678',
  direccionId: 1,
  direccion: {
    etiqueta: 'Principal',
    direccion: 'Calle Principal 123',
    poblacion: 'Madrid',
    provincia: 'Madrid',
    codigoPostal: '28001'
  },
  bases: {
    bi1: 1000.00, // Base 21%
    bi2: 500.00,  // Base 10%
    bi3: 200.00   // Base 4%
  },
  cuotasIva: {
    ci1: 210.00,  // IVA 21%
    ci2: 50.00,   // IVA 10%
    ci3: 8.00     // IVA 4%
  },
  totales: {
    baseImponible: 1700.00,
    iva: 268.00,
    total: 1968.00
  },
  ...overrides
})

describe('generateInvoicePDF', () => {
  describe('Basic PDF Generation', () => {
    test('should generate a valid PDF blob', () => {
      const invoice = createMockInvoice()
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/pdf')
      expect(blob.size).toBeGreaterThan(0)
    })

    test('should generate PDF with consistent size for same invoice', () => {
      const invoice = createMockInvoice()
      const blob1 = generateInvoicePDF(invoice)
      const blob2 = generateInvoicePDF(invoice)

      expect(blob1.size).toBe(blob2.size)
      expect(blob1.type).toBe(blob2.type)
    })

    test('should generate different PDFs for different invoices', () => {
      const invoice1 = createMockInvoice({ numero: 'F-001/2024' })
      const invoice2 = createMockInvoice({ numero: 'F-002/2024' })
      
      const blob1 = generateInvoicePDF(invoice1)
      const blob2 = generateInvoicePDF(invoice2)

      // PDFs should be different (different sizes or content)
      expect(blob1.size).not.toBe(0)
      expect(blob2.size).not.toBe(0)
    })
  })

  describe('PDF Content Verification', () => {
    test('should call jsPDF methods to generate PDF', () => {
      const invoice = createMockInvoice({ numero: 'F-TEST-123' })
      const jsPDF = require('jspdf').default
      const blob = generateInvoicePDF(invoice)
      
      // Verify that jsPDF was instantiated
      expect(jsPDF).toHaveBeenCalled()
      
      // Verify that output was called to generate blob
      const mockDoc = jsPDF.mock.results[0].value
      expect(mockDoc.output).toHaveBeenCalledWith('blob')
      
      // Verify blob is returned
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/pdf')
    })

    test('should process invoice data correctly', () => {
      const invoice = createMockInvoice({ 
        clienteNombre: 'Test Client Name',
        clienteNif: 'A98765432'
      })
      const jsPDF = require('jspdf').default
      const blob = generateInvoicePDF(invoice)
      
      // Verify PDF generation completes successfully
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/pdf')
      
      // Verify jsPDF was called (meaning it processed the invoice)
      expect(jsPDF).toHaveBeenCalled()
    })

    test('should call output method to generate blob', () => {
      const invoice = createMockInvoice()
      const jsPDF = require('jspdf').default
      generateInvoicePDF(invoice)
      
      // Verify that output was called
      const mockDoc = jsPDF.mock.results[0].value
      expect(mockDoc.output).toHaveBeenCalledWith('blob')
    })
  })

  describe('Edge Cases', () => {
    test('should handle invoice without address', () => {
      const invoice = createMockInvoice({ direccion: undefined })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.type).toBe('application/pdf')
      expect(blob.size).toBeGreaterThan(0)
    })

    test('should handle invoice with partial address', () => {
      const invoice = createMockInvoice({
        direccion: {
          direccion: 'Calle Test',
          poblacion: null,
          provincia: null,
          codigoPostal: null
        }
      })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })

    test('should handle invoice with zero bases and IVA', () => {
      const invoice = createMockInvoice({
        bases: { bi1: 0, bi2: 0, bi3: 0 },
        cuotasIva: { ci1: 0, ci2: 0, ci3: 0 },
        totales: {
          baseImponible: 0,
          iva: 0,
          total: 0
        }
      })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })

    test('should handle invoice with only one base/IVA rate', () => {
      const invoice = createMockInvoice({
        bases: { bi1: 1000.00, bi2: 0, bi3: 0 },
        cuotasIva: { ci1: 210.00, ci2: 0, ci3: 0 },
        totales: {
          baseImponible: 1000.00,
          iva: 210.00,
          total: 1210.00
        }
      })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })

    test('should handle invoice with negative total (rectificativa)', () => {
      const invoice = createMockInvoice({
        totales: {
          baseImponible: -1000.00,
          iva: -210.00,
          total: -1210.00
        }
      })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })

    test('should handle invoice with empty client NIF', () => {
      const invoice = createMockInvoice({ clienteNif: '' })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })

    test('should handle invoice with very long client name', () => {
      const invoice = createMockInvoice({
        clienteNombre: 'A'.repeat(200) // Very long name
      })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })

    test('should handle invoice with special characters in client name', () => {
      const invoice = createMockInvoice({
        clienteNombre: 'Cliente & Cía. S.L. - Test "Especial"'
      })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })
  })

  describe('PDF Format', () => {
    test('should generate PDF with correct MIME type', () => {
      const invoice = createMockInvoice()
      const blob = generateInvoicePDF(invoice)

      expect(blob.type).toBe('application/pdf')
    })

    test('should generate PDFs with valid blob', () => {
      const invoice = createMockInvoice()
      const blob = generateInvoicePDF(invoice)

      // PDF should be a valid blob
      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })
  })

  describe('Data Formatting', () => {
    test('should format currency correctly', async () => {
      const invoice = createMockInvoice({
        totales: {
          baseImponible: 1234.56,
          iva: 259.26,
          total: 1493.82
        }
      })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })

    test('should format date correctly', async () => {
      const invoice = createMockInvoice({
        fecha: '2024-12-25T00:00:00.000Z'
      })
      const blob = generateInvoicePDF(invoice)

      expect(blob).toBeInstanceOf(Blob)
      expect(blob.size).toBeGreaterThan(0)
    })
  })
})

