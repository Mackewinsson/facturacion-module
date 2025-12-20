/**
 * Unit tests for invoice filter logic
 * Tests individual filter functions and edge cases in detail
 */

import { InvoicesRepository } from '../invoices'
import { prisma } from '@/lib/prisma'

// Mock Prisma client
jest.mock('@/lib/prisma', () => ({
  prisma: {
    cFA: {
      findMany: jest.fn(),
      count: jest.fn(),
    },
  },
}))

const mockPrisma = prisma as jest.Mocked<typeof prisma>

describe('InvoicesRepository - Unit Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.cFA.findMany.mockResolvedValue([])
    mockPrisma.cFA.count.mockResolvedValue(0)
  })

  describe('Filter Value Parsing', () => {
    test('numeric filters parse valid numbers correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { total: '1234.56' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeDefined()
      expect(call.where.TOTCFA.gte).toBeCloseTo(1234.56 * 0.99, 2)
      expect(call.where.TOTCFA.lte).toBeCloseTo(1234.56 * 1.01, 2)
    })

    test('numeric filters ignore invalid numbers', async () => {
      await InvoicesRepository.list({
        columnFilters: { total: 'not-a-number' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeUndefined()
    })

    test('numeric filters ignore empty strings', async () => {
      await InvoicesRepository.list({
        columnFilters: { total: '' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeUndefined()
    })

    test('date filter parses valid date strings', async () => {
      await InvoicesRepository.list({
        columnFilters: { fecha: '2024-01-15' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FECCFA).toBeDefined()
      expect(call.where.FECCFA.gte).toBeInstanceOf(Date)
      expect(call.where.FECCFA.lte).toBeInstanceOf(Date)
      
      const startOfDay = new Date('2024-01-15')
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date('2024-01-15')
      endOfDay.setHours(23, 59, 59, 999)
      
      expect(call.where.FECCFA.gte.getTime()).toBe(startOfDay.getTime())
      expect(call.where.FECCFA.lte.getTime()).toBe(endOfDay.getTime())
    })

    test('date filter ignores invalid date strings', async () => {
      await InvoicesRepository.list({
        columnFilters: { fecha: 'invalid-date' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FECCFA).toBeUndefined()
    })

    test('formaPago parses numeric ID correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { formaPago: '5' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FPACFA).toBe(5)
      expect(call.where.CFP).toBeUndefined()
    })

    test('formaPago searches by name when not numeric', async () => {
      await InvoicesRepository.list({
        columnFilters: { formaPago: 'Contado' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FPACFA).toBeUndefined()
      expect(call.where.CFP).toBeDefined()
      expect(call.where.CFP.is.NOMCFP.contains).toBe('Contado')
    })

    test('medioPago parses numeric ID correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { medioPago: '3' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.MPACFA).toBe(3)
    })

    test('medioPago ignores non-numeric values', async () => {
      await InvoicesRepository.list({
        columnFilters: { medioPago: 'invalid' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.MPACFA).toBeUndefined()
    })
  })

  describe('Filter Range Calculations', () => {
    test('baseImponible uses 99% to 101% range', async () => {
      await InvoicesRepository.list({
        columnFilters: { baseImponible: '1000' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.OR).toBeDefined()
      const baseFilter = call.where.OR.find((f: any) => f.BI1CFA)
      expect(baseFilter.BI1CFA.gte).toBe(990)
      expect(baseFilter.BI1CFA.lte).toBe(1010)
    })

    test('iva uses 99% to 101% range', async () => {
      await InvoicesRepository.list({
        columnFilters: { iva: '210' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.OR).toBeDefined()
      const ivaFilter = call.where.OR.find((f: any) => f.CI1CFA)
      expect(ivaFilter.CI1CFA.gte).toBeCloseTo(207.9, 1)
      expect(ivaFilter.CI1CFA.lte).toBeCloseTo(212.1, 1)
    })

    test('total uses 99% to 101% range', async () => {
      await InvoicesRepository.list({
        columnFilters: { total: '1210.50' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA.gte).toBeCloseTo(1210.50 * 0.99, 2)
      expect(call.where.TOTCFA.lte).toBeCloseTo(1210.50 * 1.01, 2)
    })
  })

  describe('Status Filter Mapping', () => {
    test('estado "rectificativa" maps to TOTCFA < 0', async () => {
      await InvoicesRepository.list({
        columnFilters: { estado: 'rectificativa' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeDefined()
      expect(call.where.TOTCFA.lt).toBe(0)
    })

    test('estado "pagada" maps to TOTCFA > 0', async () => {
      await InvoicesRepository.list({
        columnFilters: { estado: 'pagada' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeDefined()
      expect(call.where.TOTCFA.gt).toBe(0)
    })

    test('estado "paid" (English) maps to TOTCFA > 0', async () => {
      await InvoicesRepository.list({
        columnFilters: { estado: 'paid' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeDefined()
      expect(call.where.TOTCFA.gt).toBe(0)
    })

    test('estado is case-insensitive', async () => {
      await InvoicesRepository.list({
        columnFilters: { estado: 'RECTIFICATIVA' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA.lt).toBe(0)
    })

    test('unknown estado values are ignored', async () => {
      await InvoicesRepository.list({
        columnFilters: { estado: 'unknown-status' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeUndefined()
    })
  })

  describe('Filter Combination Logic', () => {
    test('multiple DIR filters combine with AND in single DIR object', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          direccion: 'Main St',
          poblacion: 'Madrid',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.DIR.is).toBeDefined()
      expect(call.where.DIR.is.DIRDIR).toBeDefined()
      expect(call.where.DIR.is.POBDIR).toBeDefined()
      // Both should be in the same DIR.is object (AND logic)
      expect(Object.keys(call.where.DIR.is)).toContain('DIRDIR')
      expect(Object.keys(call.where.DIR.is)).toContain('POBDIR')
    })

    test('date and factura filters combine with AND when both present', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          factura: 'F001',
          fecha: '2024-01-15',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.NUMCFA).toBeDefined()
      expect(call.where.AND).toBeDefined()
      expect(call.where.AND).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            FECCFA: expect.any(Object),
          }),
        ])
      )
    })

    test('date filter uses direct FECCFA when factura not present', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          fecha: '2024-01-15',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FECCFA).toBeDefined()
      expect(call.where.AND).toBeUndefined()
    })

    test('search OR combines with numeric filters using AND', async () => {
      await InvoicesRepository.list({
        search: 'test',
        columnFilters: { baseImponible: '1000' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.AND).toBeDefined()
      expect(call.where.AND.length).toBe(2)
      expect(call.where.AND[0].OR).toBeDefined() // Search OR
      expect(call.where.AND[1].OR).toBeDefined() // Base filters OR
    })
  })

  describe('Empty and Null Handling', () => {
    test('empty string filters are ignored', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          factura: '',
          nif: '',
          cliente: '',
          direccion: '',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.NUMCFA).toBeUndefined()
      expect(call.where.ENT).toBeUndefined()
      expect(call.where.DIR).toBeUndefined()
    })

    test('undefined filter values are ignored', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          factura: undefined as any,
          nif: undefined as any,
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.NUMCFA).toBeUndefined()
      expect(call.where.ENT).toBeUndefined()
    })

    test('whitespace-only filters are not ignored (treated as valid)', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          factura: '   ',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      // Whitespace is treated as a valid filter value
      expect(call.where.NUMCFA).toBeDefined()
      expect(call.where.NUMCFA.contains).toBe('   ')
    })
  })

  describe('Date Range Filter Logic', () => {
    test('fechaDesde creates gte filter', async () => {
      await InvoicesRepository.list({
        filters: {
          fechaDesde: '2024-01-01',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FECCFA).toBeDefined()
      expect(call.where.FECCFA.gte).toBeInstanceOf(Date)
      expect(call.where.FECCFA.lte).toBeUndefined()
    })

    test('fechaHasta creates lte filter', async () => {
      await InvoicesRepository.list({
        filters: {
          fechaHasta: '2024-12-31',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FECCFA).toBeDefined()
      expect(call.where.FECCFA.lte).toBeInstanceOf(Date)
      expect(call.where.FECCFA.gte).toBeUndefined()
    })

    test('fechaDesde and fechaHasta combine correctly', async () => {
      await InvoicesRepository.list({
        filters: {
          fechaDesde: '2024-01-01',
          fechaHasta: '2024-12-31',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FECCFA).toBeDefined()
      expect(call.where.FECCFA.gte).toBeInstanceOf(Date)
      expect(call.where.FECCFA.lte).toBeInstanceOf(Date)
    })

    test('invalid fechaDesde is ignored', async () => {
      await InvoicesRepository.list({
        filters: {
          fechaDesde: 'invalid-date',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      // Invalid date creates empty object, but no gte/lte properties
      if (call.where.FECCFA) {
        expect(call.where.FECCFA.gte).toBeUndefined()
        expect(call.where.FECCFA.lte).toBeUndefined()
      }
    })
  })

  describe('Tipo Factura Filter', () => {
    test('tipoFactura "emitida" sets FRECFA to false', async () => {
      await InvoicesRepository.list({
        filters: {
          tipoFactura: 'emitida',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FRECFA).toBe(false)
    })

    test('tipoFactura "recibida" sets FRECFA to true', async () => {
      await InvoicesRepository.list({
        filters: {
          tipoFactura: 'recibida',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FRECFA).toBe(true)
    })
  })

  describe('Importe Filters', () => {
    test('importeMinimo creates gte filter on TOTCFA', async () => {
      await InvoicesRepository.list({
        filters: {
          importeMinimo: '1000',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeDefined()
      expect(call.where.TOTCFA.gte).toBe(1000)
      expect(call.where.TOTCFA.lte).toBeUndefined()
    })

    test('importeMaximo creates lte filter on TOTCFA', async () => {
      await InvoicesRepository.list({
        filters: {
          importeMaximo: '5000',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeDefined()
      expect(call.where.TOTCFA.lte).toBe(5000)
      expect(call.where.TOTCFA.gte).toBeUndefined()
    })

    test('importeMinimo and importeMaximo combine correctly', async () => {
      await InvoicesRepository.list({
        filters: {
          importeMinimo: '1000',
          importeMaximo: '5000',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.TOTCFA).toBeDefined()
      expect(call.where.TOTCFA.gte).toBe(1000)
      expect(call.where.TOTCFA.lte).toBe(5000)
    })

    test('invalid importeMinimo is ignored', async () => {
      await InvoicesRepository.list({
        filters: {
          importeMinimo: 'not-a-number',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      // Invalid number creates empty object, but no gte/lte properties
      if (call.where.TOTCFA) {
        expect(call.where.TOTCFA.gte).toBeUndefined()
        expect(call.where.TOTCFA.lte).toBeUndefined()
      }
    })
  })

  describe('Pagination', () => {
    test('default page is 1', async () => {
      await InvoicesRepository.list({})

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.skip).toBe(0) // (page - 1) * limit = (1 - 1) * 10 = 0
      expect(call.take).toBe(10)
    })

    test('custom page and limit work correctly', async () => {
      await InvoicesRepository.list({
        page: 3,
        limit: 20,
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.skip).toBe(40) // (3 - 1) * 20 = 40
      expect(call.take).toBe(20)
    })

    test('count uses same where clause', async () => {
      await InvoicesRepository.list({
        columnFilters: { factura: 'F001' },
      })

      expect(mockPrisma.cFA.count).toHaveBeenCalledWith({
        where: expect.objectContaining({
          NUMCFA: { contains: 'F001' },
        }),
      })
    })
  })

  describe('Search Functionality', () => {
    test('search creates OR conditions for NUMCFA, NIFENT, NCOENT', async () => {
      await InvoicesRepository.list({
        search: 'test',
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.OR).toBeDefined()
      expect(call.where.OR.length).toBe(3)
      expect(call.where.OR[0].NUMCFA).toBeDefined()
      expect(call.where.OR[1].ENT.is.NIFENT).toBeDefined()
      expect(call.where.OR[2].ENT.is.NCOENT).toBeDefined()
    })

    test('search and column filters can coexist', async () => {
      await InvoicesRepository.list({
        search: 'test',
        columnFilters: { factura: 'F001' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.OR).toBeDefined() // Search OR
      expect(call.where.NUMCFA).toBeDefined() // Column filter
    })
  })
})

