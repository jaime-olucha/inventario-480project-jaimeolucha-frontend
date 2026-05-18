import { Link } from "react-router-dom";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { FolderPlus, User as UserIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { CreateProjectModal } from "./CreateProjectModal";
import { FiltersCard } from "@/ui/components/organisms/filtersCard/FiltersCard";
import { usePagination } from "../../../hooks/usePagination";
import { PaginationControls } from "../../../components/organisms/paginationControls/PaginationControls";
import './ProjectPage.scss';
import { ROUTES } from "@/ui/routes/routes";
import { useFilters } from "@/ui/hooks/useFilters";
import type { CreateProjectRequest } from "@/domain/models/Project/CreateProjectRequest";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { StatusBadge } from "@/ui/components/molecules/statusBadge/StatusBadge";
import { ActionButton } from "@/ui/components/molecules/actionButton/ActionButton";
import type { UserProject } from "@/domain/models/User/UserProject";

const PAGE_LIMIT = 20;

export const ProjectPage = () => {
  const userStore = useUserStore((store) => store.user);
  const { project: projectRepo, user: userRepo } = useRepositories();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showFab, setShowFab] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const { page, limit, isFirst, isLast, setIsLast, goNext, goPrev } = usePagination(PAGE_LIMIT);
  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;
  const { search, setSearch, status, setStatus, filtered } = useFilters(projects);

  useEffect(() => {
    if (!userStore) return;

    if (isAdmin) {
      projectRepo.getAll(page, limit).then(result => {
        setProjects(result);
        setIsLast(result.length < limit);
      });
    } else {
      userRepo.getProjects(userStore.id).then(result => {
        setProjects(result);
        setIsLast(result.length < limit);
      });
    }
  }, [userStore, projectRepo, userRepo, page, limit]);

  useEffect(() => {
    const btn = addBtnRef.current;
    if (!btn) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(btn);
    return () => observer.disconnect();
  }, [isAdmin]);

  const handleCreateProject = async (data: CreateProjectRequest) => {
    await projectRepo.createProject(data);
    const result = await projectRepo.getAll(page, limit);
    setProjects(result);
    setIsLast(result.length < limit);
  };

  return (
    <section className="section-page">
      <div className="section-page_header">
        <div className="header_title">
          <h1>Proyectos</h1>
          <p className="info">Todos los proyectos de la empresa</p>
        </div>

        {userStore?.role === SYSTEM_ROLES.ADMIN && (
          <ActionButton ref={addBtnRef} compact icon={<FolderPlus size={20} />} onClick={() => setIsModalOpen(true)}>
            Nuevo Proyecto
          </ActionButton>
        )}
      </div>

      {isModalOpen && (
        <CreateProjectModal
          onClose={() => setIsModalOpen(false)}
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
              <article className={`card card_project ${!project.isActive ? 'project_disabled' : ''}`}>
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
        <ActionButton className="action-button--fab" icon={<FolderPlus size={20} />} onClick={() => setIsModalOpen(true)}>
          <span className="sr-only">Nuevo Proyecto</span>
        </ActionButton>
      )}
    </section>
  );
};

