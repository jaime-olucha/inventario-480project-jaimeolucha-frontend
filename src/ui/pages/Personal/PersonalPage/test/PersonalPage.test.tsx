import { describe, test, vi, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { PersonalPage } from '../PersonalPage'

const mockPersonalState = {
  activeProjectCounts: { '1': 2 },
  isFirst: true,
  isLast: false,
  page: 1,
  users: [
    {
      id: '1',
      name: 'Laura',
      surname: 'García',
      email: 'laura@empresa.com',
      role: 'ROLE_ADMIN',
      isActive: true,
    },
  ],
}

vi.mock('../usePersonalPage', () => ({
  usePersonalPage: () => ({
    ...mockPersonalState,
    goNext: vi.fn(),
    goPrev: vi.fn(),
    handleCreateUser: vi.fn(),
  }),
}))

vi.mock('@/ui/hooks/useFab', () => ({
  useFab: () => ({ btnRef: vi.fn(), showFab: false }),
}))

const renderPersonalPage = () => render(
  <MemoryRouter>
    <PersonalPage />
  </MemoryRouter>
)

beforeEach(() => {
  mockPersonalState.activeProjectCounts = { '1': 2 }
  mockPersonalState.users = [
    {
      id: '1',
      name: 'Laura',
      surname: 'García',
      email: 'laura@empresa.com',
      role: 'ROLE_ADMIN',
      isActive: true,
    },
  ]
})

describe('PersonalPage', () => {
  test('should render page header and create button', () => {
    renderPersonalPage();

    expect(screen.getByText('Personal')).toBeTruthy();
    expect(screen.getByText('Gestiona el personal de la empresa')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nuevo Personal' })).toBeTruthy();
  })

  test('should render user information', () => {
    renderPersonalPage();

    expect(screen.getByText(/Laura García/)).toBeTruthy();
    expect(screen.getByText('laura@empresa.com')).toBeTruthy();
  })

  test('should render pagination controls', () => {
    renderPersonalPage();

    expect(screen.getByText('Página 1')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Anterior/ })).toBeTruthy();
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeTruthy();
  })
})
