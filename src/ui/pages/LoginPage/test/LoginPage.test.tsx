import { describe, test, vi, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoginPage } from '../LoginPage'
import { MemoryRouter } from 'react-router-dom'

// Estado mutable que el mock lee en cada test
const mockFormState = { errors: {}, isSubmitting: false }
const mockToastState: { value: { message: string; type: 'success' | 'error' } | null } = { value: null }

vi.mock('../useLoginPage', () => ({
  useLoginPage: () => ({
    sessionMessage: null,
    closeSessionMessage: vi.fn(),
    toast: mockToastState.value,
    closeToast: vi.fn(),
    showToast: vi.fn(),
    form: {
      register: () => ({}),
      handleSubmit: (fn: unknown) => fn,
      formState: mockFormState,
    },
    onSubmit: vi.fn(),
  }),
}))

const renderLoginPage = () => render(
  <MemoryRouter>
    <LoginPage />
  </MemoryRouter>
)


beforeEach(() => {
  mockFormState.isSubmitting = false;
  mockFormState.errors = {};
  mockToastState.value = null;
})

describe('LoginPage', () => {

  test('should render email and password inputs', () => {
    renderLoginPage();

    expect(screen.getByLabelText('Correo Corporativo')).toBeTruthy();
    expect(screen.getByLabelText('Contraseña')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Iniciar Sesión' })).toBeTruthy();
  })

  test('should show error toast when password is incorrect', () => {
    mockToastState.value = { message: 'Contraseña incorrecta', type: 'error' };
    renderLoginPage();

    expect(screen.getByText('Contraseña incorrecta')).toBeTruthy();
  })

  test('should show "Entrando..." when form is submitting', () => {
    mockFormState.isSubmitting = true;
    renderLoginPage();

    expect(screen.getByRole('button', { name: 'Entrando...' })).toBeTruthy();
  })
})
