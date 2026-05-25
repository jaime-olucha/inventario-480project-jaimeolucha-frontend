import { describe, test, vi, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ProjectPage } from '../ProjectPage'

const mockProjectState = {
  projects: [
    {
      id: 'project-1',
      name: 'Proyecto Alpha',
      description: 'Proyecto de inventario',
      clientName: 'Acme Corp',
      teamMembers: 3,
      isActive: true,
    },
  ],
  filtered: [
    {
      id: 'project-1',
      name: 'Proyecto Alpha',
      description: 'Proyecto de inventario',
      clientName: 'Acme Corp',
      teamMembers: 3,
      isActive: true,
    },
  ],
  isAdmin: true,
  isModalOpen: false,
  page: 1,
  isFirst: true,
  isLast: false,
  search: '',
  status: 'all',
  showFab: false,
}

vi.mock('../useProjectPage', () => ({
  useProjectPage: () => ({
    ...mockProjectState,
    openModal: vi.fn(),
    closeModal: vi.fn(),
    goNext: vi.fn(),
    goPrev: vi.fn(),
    setSearch: vi.fn(),
    setStatus: vi.fn(),
    btnRef: vi.fn(),
    handleCreateProject: vi.fn(),
  }),
}))

const renderProjectPage = () => render(
  <MemoryRouter>
    <ProjectPage />
  </MemoryRouter>
)

beforeEach(() => {
  mockProjectState.isAdmin = true;
  mockProjectState.filtered = [
    {
      id: 'project-1',
      name: 'Proyecto Alpha',
      description: 'Proyecto de inventario',
      clientName: 'Acme Corp',
      teamMembers: 3,
      isActive: true,
    },
  ];
  mockProjectState.projects = mockProjectState.filtered;
})

describe('ProjectPage', () => {
  test('should render page header and admin create button', () => {
    renderProjectPage();

    expect(screen.getByText('Proyectos')).toBeTruthy();
    expect(screen.getByText('Todos los proyectos de la empresa')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nuevo Proyecto' })).toBeTruthy();
  })

  test('should render project information', () => {
    renderProjectPage();

    expect(screen.getByText('Proyecto Alpha')).toBeTruthy();
    expect(screen.getByText('Proyecto de inventario')).toBeTruthy();
    expect(screen.getByText('Acme Corp')).toBeTruthy();
  })

  test('should hide create button when user is not admin', () => {
    mockProjectState.isAdmin = false;
    renderProjectPage();

    expect(screen.queryByRole('button', { name: 'Nuevo Proyecto' })).toBeNull();
  })
})
