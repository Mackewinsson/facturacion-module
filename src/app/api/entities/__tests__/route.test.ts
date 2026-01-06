/**
 * @jest-environment node
 */
import { GET } from '../route'

jest.mock('@/lib/auth-utils', () => ({
  requireAuth: jest.fn(async () => undefined),
  createUnauthorizedResponse: jest.fn((message: string) => ({
    status: 401,
    json: async () => ({ success: false, error: message })
  }))
}))

const listMock = jest.fn()
jest.mock('@/lib/repositories/entities', () => ({
  EntitiesRepository: {
    list: (...args: any[]) => listMock(...args)
  }
}))

describe('GET /api/entities', () => {
  beforeEach(() => {
    listMock.mockReset()
  })

  test('uses full string for nombre filter and returns substring matches case-insensitively (e.g. "LO")', async () => {
    // Minimal fake request object: route only needs .url and is passed into requireAuth (mocked).
    const request = { url: 'http://localhost/api/entities?nombre=LO' } as any

    const dataset = [
      { id: 1, razonSocial: 'LOPEZ E HIJOS' },
      { id: 2, razonSocial: 'Alonso Motor' },
      { id: 3, razonSocial: 'Garcia' }
    ]

    listMock.mockImplementation(async (params: any) => {
      expect(params?.columnFilters?.nombre).toBe('LO')
      const q = String(params.columnFilters.nombre).toLowerCase()
      const entities = dataset.filter(e => e.razonSocial.toLowerCase().includes(q))
      return { entities, total: entities.length, page: 1, limit: 1000, pages: 1 }
    })

    const response = await GET(request)
    // NextResponse has a .json() method returning the response body
    const body = await (response as any).json()

    expect(body.success).toBe(true)
    const names = (body.entities || []).map((e: any) => e.razonSocial)
    expect(names).toEqual(expect.arrayContaining(['LOPEZ E HIJOS', 'Alonso Motor']))
    expect(names).not.toEqual(expect.arrayContaining(['Garcia']))
  })
})


