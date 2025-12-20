/**
 * Smoke tests for invoice filters
 * Verifies that all column filters work correctly
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

describe('InvoicesRepository - Filter Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPrisma.cFA.findMany.mockResolvedValue([])
    mockPrisma.cFA.count.mockResolvedValue(0)
  })

  describe('Basic Column Filters', () => {
    test('factura filter applies correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { factura: 'F001' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            NUMCFA: { contains: 'F001' },
          }),
        })
      )
    })

    test('nif filter applies correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { nif: '12345678A' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ENT: { is: { NIFENT: { contains: '12345678A' } } },
          }),
        })
      )
    })

    test('cliente filter applies correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { cliente: 'Test Client' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            ENT: { is: { NCOENT: { contains: 'Test Client' } } },
          }),
        })
      )
    })

    test('direccion filter applies correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { direccion: 'Main Street' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            DIR: {
              is: expect.objectContaining({
                DIRDIR: { contains: 'Main Street' },
              }),
            },
          }),
        })
      )
    })

    test('poblacion filter applies correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { poblacion: 'Madrid' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            DIR: {
              is: expect.objectContaining({
                POBDIR: { contains: 'Madrid' },
              }),
            },
          }),
        })
      )
    })

    test('provincia filter applies correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { provincia: 'Madrid' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            DIR: {
              is: expect.objectContaining({
                PRO: { is: { NOMPRO: { contains: 'Madrid' } } },
              }),
            },
          }),
        })
      )
    })

    test('codigoPostal filter applies correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { codigoPostal: '28001' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            DIR: {
              is: expect.objectContaining({
                CPODIR: { contains: '28001' },
              }),
            },
          }),
        })
      )
    })

    test('formaPago filter with number applies correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { formaPago: '1' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            FPACFA: 1,
          }),
        })
      )
    })

    test('formaPago filter with name searches CFP table', async () => {
      await InvoicesRepository.list({
        columnFilters: { formaPago: 'Contado' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            CFP: { is: { NOMCFP: { contains: 'Contado' } } },
          }),
        })
      )
    })

    test('medioPago filter applies correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { medioPago: '2' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            MPACFA: 2,
          }),
        })
      )
    })

    test('baseImponible filter applies range correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { baseImponible: '1000' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.OR).toBeDefined()
      expect(call.where.OR).toEqual(
        expect.arrayContaining([
          { BI1CFA: { gte: 990, lte: 1010 } },
          { BI2CFA: { gte: 990, lte: 1010 } },
          { BI3CFA: { gte: 990, lte: 1010 } },
          { BIPCFA: { gte: 990, lte: 1010 } },
        ])
      )
    })

    test('iva filter applies range correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { iva: '210' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.OR).toBeDefined()
      expect(call.where.OR).toEqual(
        expect.arrayContaining([
          { CI1CFA: { gte: 207.9, lte: 212.1 } },
          { CI2CFA: { gte: 207.9, lte: 212.1 } },
          { CI3CFA: { gte: 207.9, lte: 212.1 } },
          { CIPCFA: { gte: 207.9, lte: 212.1 } },
        ])
      )
    })

    test('total filter applies range correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { total: '1210' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            TOTCFA: { gte: 1197.9, lte: 1222.1 },
          }),
        })
      )
    })

    test('fecha filter parses date correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { fecha: '2024-01-15' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FECCFA).toBeDefined()
      expect(call.where.FECCFA.gte).toBeInstanceOf(Date)
      expect(call.where.FECCFA.lte).toBeInstanceOf(Date)
    })

    test('estado filter maps rectificativa correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { estado: 'rectificativa' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            TOTCFA: { lt: 0 },
          }),
        })
      )
    })

    test('estado filter maps pagada correctly', async () => {
      await InvoicesRepository.list({
        columnFilters: { estado: 'pagada' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            TOTCFA: { gt: 0 },
          }),
        })
      )
    })
  })

  describe('Filter Combinations', () => {
    test('multiple DIR filters combine with AND', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          direccion: 'Main St',
          poblacion: 'Madrid',
          provincia: 'Madrid',
          codigoPostal: '28001',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.DIR.is).toEqual({
        DIRDIR: { contains: 'Main St' },
        POBDIR: { contains: 'Madrid' },
        PRO: { is: { NOMPRO: { contains: 'Madrid' } } },
        CPODIR: { contains: '28001' },
      })
    })

    test('date filter combines with factura filter using AND', async () => {
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

    test('search OR combines with numeric filters using AND', async () => {
      await InvoicesRepository.list({
        search: 'test',
        columnFilters: { baseImponible: '1000' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.AND).toBeDefined()
      expect(call.where.AND).toEqual(
        expect.arrayContaining([
          { OR: expect.any(Array) },
          { OR: expect.any(Array) },
        ])
      )
    })
  })

  describe('Edge Cases', () => {
    test('empty string filters are ignored', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          factura: '',
          nif: '',
          cliente: '',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.NUMCFA).toBeUndefined()
      expect(call.where.ENT).toBeUndefined()
    })

    test('invalid date strings are ignored', async () => {
      await InvoicesRepository.list({
        columnFilters: { fecha: 'invalid-date' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.FECCFA).toBeUndefined()
    })

    test('non-numeric values in numeric filters are ignored', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          baseImponible: 'not-a-number',
          iva: 'invalid',
          total: 'abc',
        },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.OR).toBeUndefined()
      expect(call.where.TOTCFA).toBeUndefined()
    })

    test('non-numeric medioPago is ignored', async () => {
      await InvoicesRepository.list({
        columnFilters: { medioPago: 'invalid' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      expect(call.where.MPACFA).toBeUndefined()
    })

    test('special characters in text filters work', async () => {
      await InvoicesRepository.list({
        columnFilters: { factura: 'F-001/2024' },
      })

      expect(mockPrisma.cFA.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            NUMCFA: { contains: 'F-001/2024' },
          }),
        })
      )
    })
  })

  describe('SQL Server Compatibility', () => {
    test('queries do not use mode insensitive (SQL Server compatibility)', async () => {
      await InvoicesRepository.list({
        columnFilters: { factura: 'F001' },
      })

      const call = mockPrisma.cFA.findMany.mock.calls[0][0]
      // SQL Server doesn't support mode: 'insensitive'
      // This test verifies queries work without it
      expect(call.where.NUMCFA).toEqual({
        contains: 'F001',
      })
      expect(call.where.NUMCFA.mode).toBeUndefined()
    })
  })

  describe('Error Handling', () => {
    test('database errors are handled gracefully', async () => {
      mockPrisma.cFA.findMany.mockRejectedValue(new Error('Database connection failed'))

      await expect(
        InvoicesRepository.list({
          columnFilters: { factura: 'F001' },
        })
      ).rejects.toThrow()
    })

    test('invalid filter values do not crash query', async () => {
      await InvoicesRepository.list({
        columnFilters: {
          fecha: 'not-a-date',
          baseImponible: 'not-a-number',
          formaPago: 'invalid',
        },
      })

      // Should not throw, filters should be ignored
      expect(mockPrisma.cFA.findMany).toHaveBeenCalled()
    })
  })
})

