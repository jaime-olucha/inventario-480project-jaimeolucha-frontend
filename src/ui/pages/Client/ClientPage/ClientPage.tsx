import { Link } from "react-router-dom";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { Building2, Plus } from "lucide-react";
import { ProjectsCounter } from "@/ui/components/molecules/projectsCounter/ProjectsCounter";
import { useEffect, useRef, useState } from "react";
import { FilterSelect } from "@/ui/components/organisms/filterSelect/FilterSelect";
import type { Sector } from "@/domain/models/Client/Sector";
import { FiltersCard } from "@/ui/components/organisms/filtersCard/FiltersCard";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/molecules/paginationControls/PaginationControls";
import './ClientPage.scss';
import { ROUTES } from "@/ui/routes/routes";
import type { Client } from "@/domain/models/Client/Client";
import { useFilters } from "@/ui/hooks/useFilters";
import type { CreateClientRequest } from "@/domain/models/Client/CreateClientRequest";
import { CreateClientModal } from "./CreateClientModal";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { StatusBadge } from "@/ui/components/atoms/statusBadge/StatusBadge";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";

const PAGE_LIMIT = 20;

export const ClientPage = () => {
  const userStore = useUserStore((store) => store.user);
  const { client: clientRepo, sector: sectorRepo } = useRepositories();
  const [clients, setClients] = useState<Client[]>([]);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeProjectCounts, setActiveProjectCounts] = useState<Record<string, number>>({});
  const [showFab, setShowFab] = useState(false);
  const [selectedSectorId, setSelectedSectorId] = useState<string>('all');
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const addBtnRef = useRef<HTMLButtonElement>(null);
  const { page, limit, isFirst, isLast, setIsLast, goNext, goPrev } = usePagination(PAGE_LIMIT);
  const { search, setSearch, status, setStatus, filtered: baseFiltered } = useFilters(clients);

  const filtered = baseFiltered.filter(client =>
    selectedSectorId === 'all' || client.sectorId === selectedSectorId
  );

  useEffect(() => {
    if (!userStore) return;
    clientRepo.getAll(page, limit).then(result => {
      setClients(result);
      setIsLast(result.length < limit);
    });
    sectorRepo.getAll().then(setSectors);
  }, [clientRepo, sectorRepo, page, limit]);

  useEffect(() => {
    if (clients.length === 0) return;
    clients.forEach(client => {
      clientRepo.getProjects(client.id).then(projects => {
        setActiveProjectCounts(prev => ({
          ...prev,
          [String(client.id)]: projects.filter(p => p.isActive).length,
        }));
      });
    });
  }, [clients]);


  useEffect(() => {
    const btn = addBtnRef.current;
    if (!btn) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { threshold: 0, rootMargin: '-60px 0px 0px 0px' }
    );
    observer.observe(btn);
    return () => observer.disconnect();
  }, []);

  const handleCreateClient = async (data: CreateClientRequest) => {
    try {
      await clientRepo.createClient(data);
      const result = await clientRepo.getAll(page, limit);
      setClients(result);
      setIsLast(result.length < limit);
      setToast({ message: "Cliente creado correctamente", type: "success" });
    } catch (error) {
      setToast({ message: getErrorMessage(error, "No se pudo crear el cliente."), type: "error" });
    }
  };

  return (
    <section className="section-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="section-page_header">
        <div className="header_title">
          <h1>Clientes</h1>
          <p className="info">Gestiona los clientes de la empresa</p>
        </div>
        <ActionButton ref={addBtnRef} compact icon={<Plus size={20} />} onClick={() => setIsModalOpen(true)}>
          Nuevo Cliente
        </ActionButton>
      </div>

      {isModalOpen && (
        <CreateClientModal
          onClose={() => setIsModalOpen(false)}
          onSubmit={handleCreateClient}
        />
      )}

      <FiltersCard
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        total={clients.length}
        filteredCount={filtered.length}
        entityLabel="cliente"
        searchLabel="Buscar Cliente"
        searchPlaceholder="Nombre..."
        extraFilters={
          <FilterSelect
            label="Sector"
            value={selectedSectorId}
            options={[
              { value: 'all', label: 'Todos los sectores' },
              ...sectors.map(s => ({ value: String(s.id), label: s.name }))
            ]}
            onChange={setSelectedSectorId}
          />
        }
      />

      <ul className="client-list">
        {filtered.map((client) => (
          <li className="li-map" key={client.id}>
            <Link to={ROUTES.CLIENTS.BY_ID(client.id)}>
              <article className={`card card_client ${!client.isActive ? 'client_disabled' : ''}`}>
                <div className="logo-client">
                  <Building2 size={32} />
                </div>
                <div className="card-user_info">
                  <h2 className="card-client_label">
                    {client.name}
                    <StatusBadge isActive={client.isActive} onlyInactive />
                  </h2>
                  <p className="info"><strong>Sector: </strong>{client.sectorName}</p>
                </div>
                <ProjectsCounter count={activeProjectCounts[String(client.id)] ?? 0} />
              </article>
            </Link>
          </li>
        ))}
      </ul>

      <PaginationControls page={page} isFirst={isFirst} isLast={isLast} onPrev={goPrev} onNext={goNext} />

      {showFab && (
        <ActionButton className="action-button--fab" icon={<Plus size={20} />} onClick={() => setIsModalOpen(true)}>
          <span className="sr-only">Nuevo Cliente</span>
        </ActionButton>
      )}
    </section>
  );
};

