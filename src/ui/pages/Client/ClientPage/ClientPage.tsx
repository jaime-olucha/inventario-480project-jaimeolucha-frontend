import { Link } from "react-router-dom";
import { Building2, Plus } from "lucide-react";
import { FilterSelect } from "@/ui/components/organisms/filterSelect/FilterSelect";
import { FiltersCard } from "@/ui/components/organisms/filtersCard/FiltersCard";
import { PaginationControls } from "@/ui/components/molecules/paginationControls/PaginationControls";
import { ProjectsCounter } from "@/ui/components/molecules/projectsCounter/ProjectsCounter";
import { StatusBadge } from "@/ui/components/atoms/statusBadge/StatusBadge";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { SectionHeader } from "@/ui/components/molecules/sectionHeader/SectionHeader";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { CreateClientModal } from "./CreateClientModal";
import { ROUTES } from "@/ui/routes/routes";
import { useClientPage } from "./useClientPage";
import "./ClientPage.scss";

export const ClientPage = () => {
  const {
    clients, sectors, activeProjectCounts, filtered,
    selectedSectorId, setSelectedSectorId,
    toast, closeToast,
    isModalOpen, openModal, closeModal,
    page, isFirst, isLast, goNext, goPrev,
    search, setSearch, status, setStatus,
    btnRef, showFab,
    handleCreateClient,
  } = useClientPage();

  return (
    <section className="section-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <SectionHeader
        title="Clientes"
        description="Gestiona los clientes de la empresa"
        action={
          <ActionButton ref={btnRef} compact icon={<Plus size={20} />} onClick={openModal}>
            Nuevo Cliente
          </ActionButton>
        }
      />

      {isModalOpen && (
        <CreateClientModal
          onClose={closeModal}
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
              { value: "all", label: "Todos los sectores" },
              ...sectors.map((sector) => ({ value: String(sector.id), label: sector.name })),
            ]}
            onChange={setSelectedSectorId}
          />
        }
      />

      <ul className="client-list">
        {filtered.map((client) => (
          <li className="li-map" key={client.id}>
            <Link to={ROUTES.CLIENTS.BY_ID(client.id)}>
              <article className={`card card_client ${!client.isActive ? "client_disabled" : ""}`}>
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
        <ActionButton className="action-button--fab" icon={<Plus size={20} />} onClick={openModal}>
          <span className="sr-only">Nuevo Cliente</span>
        </ActionButton>
      )}
    </section>
  );
};
