import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import AddClientModal from '../AddClientModal'

describe('AddClientModal - Empresa/Persona toggle', () => {
  test('click Persona switches mode and submit includes personaFisica=true', async () => {
    const onClientAdded = jest.fn()
    const onClose = jest.fn()

    render(
      <AddClientModal
        isOpen={true}
        onClose={onClose}
        onClientAdded={onClientAdded}
      />
    )

    fireEvent.click(screen.getByRole('button', { name: 'Persona' }))

    // Persona fields should be visible
    expect(screen.getByPlaceholderText('Nombre')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('Primer apellido')).toBeInTheDocument()

    // Fill required fields for persona
    fireEvent.change(screen.getByPlaceholderText('NIF'), { target: { value: '12345678A' } })
    fireEvent.change(screen.getByPlaceholderText('Nombre'), { target: { value: 'Juan' } })
    fireEvent.change(screen.getByPlaceholderText('Primer apellido'), { target: { value: 'López' } })

    fireEvent.click(screen.getByRole('button', { name: 'Crear' }))

    await waitFor(() => {
      expect(onClientAdded).toHaveBeenCalledTimes(1)
    })

    const payload = onClientAdded.mock.calls[0][0]
    expect(payload).toEqual(
      expect.objectContaining({
        personaFisica: true,
        tipo: 'particular',
        NIF: '12345678A',
        nombre: 'Juan',
        apellido1: 'López'
      })
    )
  })
})


