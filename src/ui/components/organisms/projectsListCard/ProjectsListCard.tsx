import { Link } from "react-router-dom";
import { FolderKanban } from "lucide-react";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { ROUTES } from "@/ui/routes/routes";
import { useProjectsPreview } from "@/ui/hooks/useProjectsPreview";

interface BaseProject {
  id: EntityId;
  name: string;
  description?: string | null;
  isActive: boolean;
}

interface ProjectsListCardProps<T extends BaseProject> {
  projects: T[];
  description: string;
  emptyText: string;
  renderActiveBadge: (project: T) => React.ReactNode;
}

export function ProjectsListCard<T extends BaseProject>({
  projects,
  description,
  emptyText,
  renderActiveBadge,
}: ProjectsListCardProps<T>) {
  const {
    activeProjects,
    inactiveProjects,
    visibleActive,
    visibleInactive,
    showAllActive,
    setShowAllActive,
    showAllInactive,
    setShowAllInactive,
    limit,
  } = useProjectsPreview(projects);

  return (
    <article className="card projects-card">
      <div className="projects-card_top">
        <FolderKanban size={18} className="iconSvg" />
        <div>
          <h2 className="card_header">Proyectos</h2>
          <p className="info">{description}</p>
        </div>
      </div>

      {projects.length === 0 && (
        <p className="no-projects">{emptyText}</p>
      )}

      {activeProjects.length > 0 && (
        <div className="projects-group">
          <h3 className="group-label group-label--active">
            Proyectos Activos ({activeProjects.length})
          </h3>
          <ul className="projects-list">
            {visibleActive.map((project) => (
              <li key={project.id} className="project-item">
                <Link to={ROUTES.PROJECTS.BY_ID(project.id)} className="project-item_inner">
                  <div>
                    <p className="project-name">{project.name}</p>
                    <p className="info project-desc">{project.description}</p>
                  </div>
                  {renderActiveBadge(project)}
                </Link>
              </li>
            ))}
          </ul>
          {activeProjects.length > limit && (
            <button className="btn-toggle" onClick={() => setShowAllActive((v) => !v)}>
              {showAllActive ? "Ver menos" : `Ver más (${activeProjects.length - limit} más)`}
            </button>
          )}
        </div>
      )}

      {inactiveProjects.length > 0 && (
        <div className="projects-group">
          <h3 className="group-label group-label--inactive">
            Proyectos Finalizados ({inactiveProjects.length})
          </h3>
          <ul className="projects-list">
            {visibleInactive.map((project) => (
              <li key={project.id} className="project-item project-item--inactive">
                <div className="project-item_inner">
                  <div>
                    <p className="project-name">{project.name}</p>
                    <p className="info project-desc">{project.description}</p>
                  </div>
                  <span className="project-badge project-badge--inactive">Inactivo</span>
                </div>
              </li>
            ))}
          </ul>
          {inactiveProjects.length > limit && (
            <button className="btn-toggle" onClick={() => setShowAllInactive((v) => !v)}>
              {showAllInactive ? "Ver menos" : `Ver más (${inactiveProjects.length - limit} más)`}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
