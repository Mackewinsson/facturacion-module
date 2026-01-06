import { render, screen, fireEvent, waitFor } from '@testing-library/react'

const pushMock = jest.fn()
const refreshMock = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: pushMock,
    refresh: refreshMock
  })
}))

jest.mock('@/store/auth', () => ({
  useAuthStore: (selector: any) => selector({ token: 'test-token', logout: jest.fn() })
}))

// Avoid importing jsPDF (ESM) through InvoicePreviewModal in Jest.
jest.mock('../InvoicePreviewModal', () => ({
  __esModule: true,
  default: () => null
}))

const SpanishInvoiceForm = require('../SpanishInvoiceForm').default

describe('SpanishInvoiceForm → ClientSearch → Ver ficha', () => {
  beforeEach(() => {
    pushMock.mockReset()
    refreshMock.mockReset()
    ;(global as any).fetch = jest.fn(async (url: string) => {
      if (typeof url === 'string' && url.startsWith('/api/entities/nif/')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            success: true,
            data: {
              id: 123,
              NIF: 'B12345678',
              razonSocial: 'Empresa ABC S.L.',
              nombreComercial: '',
              fechaAlta: '2024-01-01T00:00:00.000Z',
              createdAt: '2024-01-01T00:00:00.000Z',
              updatedAt: '2024-01-01T00:00:00.000Z',
              // minimal required shape
              cliente: true,
              proveedor: false,
              vendedor: false,
              operarioTaller: false,
              aseguradora: false,
              financiera: false,
              agenciaTransporte: false,
              banco: false,
              rentacar: false,
              personaFisica: false,
              tipoIdentificador: 'NIF/CIF-IVA',
              paisOrigen: '1',
              extranjero: false,
              operadorIntracomunitario: false,
              importacionExportacion: false,
              regimenCanario: false,
              monedaEntidad: 'Euro',
              telefono: '',
              email: '',
              domicilio: {
                calle: 'Calle Mayor 1',
                codigoPostal: '28001',
                municipio: 'Madrid',
                provincia: 'Madrid',
                pais: 'España'
              },
              direcciones: [],
              tipoEntidad: 'cliente',
              tipo: 'empresario/profesional',
              nombreORazonSocial: 'Empresa ABC S.L.',
              pais: 'España'
            }
          })
        }
      }
      return { ok: false, status: 404, statusText: 'Not Found', json: async () => ({}) }
    })
  })

  test('select client, click "Ver datos de la entidad" opens EntityModal and renders entity', async () => {
    render(<SpanishInvoiceForm />)

    // Open dropdown
    fireEvent.click(screen.getByRole('button', { name: /Seleccionar cliente/i }))

    // Type and search
    const searchInput = screen.getByPlaceholderText(/Buscar por nombre, NIF o ciudad/i)
    fireEvent.change(searchInput, { target: { value: 'Empresa' } })
    fireEvent.keyDown(searchInput, { key: 'Enter' })

    // Select client (from ClientSearch MOCK_CLIENTS)
    fireEvent.click(await screen.findByText('Empresa ABC S.L.'))

    // Close modal that opens automatically on select
    await waitFor(() => {
      expect(screen.getByText('Entidad')).toBeInTheDocument()
    })
    // Close the modal via its footer button (stable accessible label)
    fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))

    // Now use the explicit "view entity" button (eye icon)
    const viewButton = await screen.findByTitle('Ver datos de la entidad')
    fireEvent.click(viewButton)

    await waitFor(() => {
      expect(screen.getByText('Entidad')).toBeInTheDocument()
      // Should render NIF field label
      expect(screen.getByText('NIF')).toBeInTheDocument()
    })
  })
})


