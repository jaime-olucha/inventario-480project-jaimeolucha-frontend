import { describe, test, vi, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from '../DashboardPage'

const mockDashboardState = {
  user: {
    id: '1',
    name: 'Jaime',
    surname: 'Olucha',
    email: 'jaime@empresa.com',
    role: 'ROLE_ADMIN',
    isActive: true,
  },
  roleBadge: 'Admin',
  projects: [
    {
      id: 'project-1',
      name: 'Proyecto Alpha',
      description: 'Proyecto de inventario',
      teamMembers: 3,
      isActive: true,
    },
  ],
  weeklyHours: [
    { day: 'Lun', total: 2, entries: [{ projectId: 'project-1', projectName: 'Proyecto Alpha', hours: 2 }] },
  ],
  maxHours: 2,
  totalHours: 2,
  projectColorMap: new Map([['project-1', '#00b341']]),
  errors: {},
  isSubmittingHours: false,
  toast: null as { message: string; type: 'success' | 'error' } | null,
}

vi.mock('../useDashboardPage', () => ({
  useDashboardPage: () => ({
    ...mockDashboardState,
    handleSubmitHours: vi.fn((event) => event?.preventDefault?.()),
    register: vi.fn(() => ({})),
    closeToast: vi.fn(),
    showToast: vi.fn(),
  }),
}))

const renderDashboardPage = () => render(
  <MemoryRouter>
    <DashboardPage />
  </MemoryRouter>
)

beforeEach(() => {
  mockDashboardState.projects = [
    {
      id: 'project-1',
      name: 'Proyecto Alpha',
      description: 'Proyecto de inventario',
      teamMembers: 3,
      isActive: true,
    },
  ]
  mockDashboardState.weeklyHours = [
    { day: 'Lun', total: 2, entries: [{ projectId: 'project-1', projectName: 'Proyecto Alpha', hours: 2 }] },
  ]
  mockDashboardState.totalHours = 2;
  mockDashboardState.toast = null;
  mockDashboardState.isSubmittingHours = false;
})

describe('DashboardPage', () => {
  test('should render user profile information', () => {
    renderDashboardPage();

    expect(screen.getByText('¡Bienvenid@, Jaime!')).toBeTruthy();
    expect(screen.getByText('Tu Perfil')).toBeTruthy();
    expect(screen.getByText('jaime@empresa.com')).toBeTruthy();
  })

  test('should render assigned projects and hours form', () => {
    renderDashboardPage();

    expect(screen.getAllByText('Proyecto Alpha').length).toBeGreaterThan(0);
    expect(screen.getByLabelText('Proyecto')).toBeTruthy();
    expect(screen.getByRole('button', { name: /Imputar/ })).toBeTruthy();
  })

  test('should show empty projects message', () => {
    mockDashboardState.projects = [];
    renderDashboardPage();

    expect(screen.getAllByText('No tienes proyectos asignados').length).toBeGreaterThan(0);
  })
})
