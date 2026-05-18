import { Link, useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "@/infrastructure/store/user.store";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useEffect, useState, useCallback } from "react";
import { ROUTES } from "@/ui/routes/routes";
import "./ClientDetailPage.scss";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { ArrowLeft, FolderKanban, Trash2, UserCheck, UserX } from "lucide-react";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { ConfirmModal } from "@/ui/components/molecules/confirmModal/ConfirmModal";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ClientInfoCard } from "@/ui/components/clientInfoCard/ClientInfoCard";
import type { Client } from "@/domain/models/Client/Client";
import type { ClientProject } from "@/domain/models/Client/ClientProject";
import "@/ui/components/molecules/confirmModal/ConfirmModal.scss";

export const ClientDetailPage = () => {
  const { id } = useParams<{ id: EntityId }>();
  const navigate = useNavigate();
  const userStore = useUserStore((store) => store.user);
  const { client: clientRepo } = useRepositories();

  const [targetClient, setTargetClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllInactive, setShowAllInactive] = useState(false);
  const [modalActive, setModalActive] = useState<"inactivar" | "activar" | "eliminar" | null>(null);
  const [loadingPatch, setLoadingPatch] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;

  const PROJECTS_PREVIEW_LIMIT = 2;
  const activeProjects = projects.filter((p) => p.isActive);
  const inactiveProjects = projects.filter((p) => !p.isActive);
  const visibleActive = showAllActive ? activeProjects : activeProjects.slice(0, PROJECTS_PREVIEW_LIMIT);
  const visibleInactive = showAllInactive ? inactiveProjects : inactiveProjects.slice(0, PROJECTS_PREVIEW_LIMIT);

  useEffect(() => {
    if (!id) return;
    clientRepo.getProjects(id).then(setProjects);
  }, [id, clientRepo]);

  const closeToast = useCallback(() => setToast(null), []);

  const handleDelete = async () => {
    if (!id) return;
    setLoadingPatch(true);
    try {
      await clientRepo.deleteClient(id);
      setToast({ message: "Cliente eliminado correctamente", type: "success" });
      setTimeout(() => navigate(ROUTES.CLIENTS.LIST), 1500);
    } catch (err) {
      setToast({ message: getErrorMessage(err, "No se pudo eliminar el cliente."), type: "error" });
    } finally {
      setLoadingPatch(false);
      setModalActive(null);
    }
  };

  const handleToggleActive = async () => {
    if (!id || !targetClient) return;
    const nextValue = !targetClient.isActive;
    setLoadingPatch(true);
    try {
      await clientRepo.patchActive(id, nextValue);
      setTargetClient((prev) => prev ? { ...prev, isActive: nextValue } : prev);
      setToast({ message: nextValue ? "Activado correctamente" : "Inactivado correctamente", type: "success" });
    } catch (err) {
      setToast({ message: getErrorMessage(err, "No se pudo cambiar el estado del cliente."), type: "error" });
    } finally {
      setLoadingPatch(false);
      setModalActive(null);
    }
  };

  return (
    <main className="client-detail-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {modalActive && (
        <ConfirmModal
          title={
            modalActive === "inactivar" ? "Inactivar Cliente"
              : modalActive === "activar" ? "Activar Cliente"
                : "Eliminar Cliente"
          }
          message={
            modalActive === "inactivar"
              ? "¿Estás seguro de que deseas inactivar a este cliente? Sus proyectos y contactos se mantendrán."
              : modalActive === "activar"
                ? "¿Estás seguro de que deseas activar a este cliente?"
                : "¿Estás seguro de que deseas eliminar a este cliente? Esta acción no se puede deshacer."
          }
          loading={loadingPatch}
          onConfirm={modalActive === "eliminar" ? handleDelete : handleToggleActive}
          onCancel={() => setModalActive(null)}
        />
      )}

      <div className="client-detail-page_header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(ROUTES.CLIENTS.LIST)} aria-label="Volver">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Detalle de Cliente</h1>
            <p className="info">Información completa, contactos y proyectos del cliente</p>
          </div>
        </div>

        {isAdmin && (
          <div className="header-actions">
            {targetClient?.isActive ? (
              <button className="btn-action btn-inactivar" onClick={() => setModalActive("inactivar")}>
                <UserX size={15} /> Inactivar
              </button>
            ) : (
              <button className="btn-action btn-activar" onClick={() => setModalActive("activar")}>
                <UserCheck size={15} /> Activar
              </button>
            )}
            <button className="btn-action btn-eliminar" onClick={() => setModalActive("eliminar")}>
              <Trash2 size={15} /> Eliminar
            </button>
          </div>
        )}
      </div>

      <section className="client-detail-page_section">
        {id && (
          <ClientInfoCard
            clientId={id}
            isAdmin={isAdmin}
            onToast={(message, type) => setToast({ message, type })}
            onClientLoaded={setTargetClient}
          />
        )}

        <article className="card projects-card">
          <div className="projects-card_top">
            <FolderKanban size={18} className="iconSvg" />
            <div>
              <h2 className="card_header">Proyectos</h2>
              <p className="info">Proyectos asociados a este cliente</p>
            </div>
          </div>

          {projects.length === 0 && (
            <p className="no-projects">No hay proyectos asociados</p>
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
                      <span className="project-badge">{project.teamMembers} miembros</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {activeProjects.length > PROJECTS_PREVIEW_LIMIT && (
                <button className="btn-toggle" onClick={() => setShowAllActive((v) => !v)}>
                  {showAllActive ? "Ver menos" : `Ver más (${activeProjects.length - PROJECTS_PREVIEW_LIMIT} más)`}
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
              {inactiveProjects.length > PROJECTS_PREVIEW_LIMIT && (
                <button className="btn-toggle" onClick={() => setShowAllInactive((v) => !v)}>
                  {showAllInactive ? "Ver menos" : `Ver más (${inactiveProjects.length - PROJECTS_PREVIEW_LIMIT} más)`}
                </button>
              )}
            </div>
          )}
        </article>
      </section>
    </main>
  );
};
