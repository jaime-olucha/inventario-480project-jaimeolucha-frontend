import { describe, test, vi, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { ClientPage } from '../ClientPage'

const mockClientState = {
  clients: [
    { id: '1', name: 'Acme Corp', sectorId: '10', sectorName: 'Tecnología', isActive: true },
  ],
  sectors: [
    { id: '10', name: 'Tecnología' },
  ],
  activeProjectCounts: { '1': 4 },
  filtered: [
    { id: '1', name: 'Acme Corp', sectorId: '10', sectorName: 'Tecnología', isActive: true },
  ],
  selectedSectorId: 'all',
  toast: null as { message: string; type: 'success' | 'error' } | null,
  isModalOpen: false,
  page: 1,
  isFirst: true,
  isLast: false,
  search: '',
  status: 'all',
  showFab: false,
}

vi.mock('../useClientPage', () => ({
  useClientPage: () => ({
    ...mockClientState,
    setSelectedSectorId: vi.fn(),
    closeToast: vi.fn(),
    showToast: vi.fn(),
    openModal: vi.fn(),
    closeModal: vi.fn(),
    goNext: vi.fn(),
    goPrev: vi.fn(),
    setSearch: vi.fn(),
    setStatus: vi.fn(),
    btnRef: vi.fn(),
    handleCreateClient: vi.fn(),
  }),
}))

const renderClientPage = () => render(
  <MemoryRouter>
    <ClientPage />
  </MemoryRouter>
)

beforeEach(() => {
  mockClientState.clients = [
    { id: '1', name: 'Acme Corp', sectorId: '10', sectorName: 'Tecnología', isActive: true },
  ];
  mockClientState.filtered = [
    { id: '1', name: 'Acme Corp', sectorId: '10', sectorName: 'Tecnología', isActive: true },
  ];
  mockClientState.toast = null;
  mockClientState.isModalOpen = false;
})

describe('ClientPage', () => {
  test('should render page header and create button', () => {
    renderClientPage();

    expect(screen.getByText('Clientes')).toBeTruthy();
    expect(screen.getByText('Gestiona los clientes de la empresa')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Nuevo Cliente' })).toBeTruthy();
  })

  test('should render client information', () => {
    renderClientPage();

    expect(screen.getByText('Acme Corp')).toBeTruthy();
    expect(screen.getByText('Tecnología')).toBeTruthy();
  })

  test('should show toast message when toast exists', () => {
    mockClientState.toast = { message: 'Cliente creado correctamente', type: 'success' };
    renderClientPage();

    expect(screen.getByText('Cliente creado correctamente')).toBeTruthy();
  })
})
