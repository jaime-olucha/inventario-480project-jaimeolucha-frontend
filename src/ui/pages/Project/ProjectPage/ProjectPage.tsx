import { Link } from "react-router-dom";
import { FolderPlus, User as UserIcon } from "lucide-react";
import { CreateProjectModal } from "./CreateProjectModal";
import { FiltersCard } from "@/ui/components/organisms/filtersCard/FiltersCard";
import { PaginationControls } from "@/ui/components/molecules/paginationControls/PaginationControls";
import { StatusBadge } from "@/ui/components/atoms/statusBadge/StatusBadge";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { ROUTES } from "@/ui/routes/routes";
import { useProjectPage } from "./useProjectPage";
import "./ProjectPage.scss";

export const ProjectPage = () => {
  const {
    projects, filtered, isAdmin,
    isModalOpen, openModal, closeModal,
    page, isFirst, isLast, goNext, goPrev,
    search, setSearch, status, setStatus,
    btnRef, showFab,
    handleCreateProject,
  } = useProjectPage();

  return (
    <section className="section-page">
      <div className="section-page_header">
        <div className="header_title">
          <h1>Proyectos</h1>
          <p className="info">Todos los proyectos de la empresa</p>
        </div>

        {isAdmin && (
          <ActionButton ref={btnRef} compact icon={<FolderPlus size={20} />} onClick={openModal}>
            Nuevo Proyecto
          </ActionButton>
        )}
      </div>

      {isModalOpen && (
        <CreateProjectModal
          onClose={closeModal}
          onSubmit={handleCreateProject}
        />
      )}

      <FiltersCard
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        total={projects.length}
        filteredCount={filtered.length}
        entityLabel="proyecto"
        searchLabel="Buscar proyecto"
        searchPlaceholder="Nombre del proyecto..."
      />

      <ul className="project-list">
        {filtered.map((project) => (
          <li className="li-map" key={project.id}>
            <Link to={ROUTES.PROJECTS.BY_ID(project.id)}>
              <article className={`card card_project ${!project.isActive ? "project_disabled" : ""}`}>
                <div className="card-project_info">
                  <h2 className="card-project_label">
                    {project.name}
                    <StatusBadge isActive={project.isActive} />
                  </h2>
                  <p className="project_description info">{project.description}</p>
                  <p className="info info-client">Cliente:</p>
                  <h3>{project.clientName}</h3>
                  <p className="info team-members"><UserIcon className="iconSvg" />{project.teamMembers} Miembros</p>
                </div>
              </article>
            </Link>
          </li>
        ))}
      </ul>

      <PaginationControls page={page} isFirst={isFirst} isLast={isLast} onPrev={goPrev} onNext={goNext} />

      {showFab && (
        <ActionButton className="action-button--fab" icon={<FolderPlus size={20} />} onClick={openModal}>
          <span className="sr-only">Nuevo Proyecto</span>
        </ActionButton>
      )}
    </section>
  );
};
