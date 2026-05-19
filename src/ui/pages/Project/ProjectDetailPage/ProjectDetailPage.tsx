import ProjectMenuBar, { type ProjectTab } from "@/ui/components/organisms/menuItem/ProjectMenuItem";
import { useNavigate, useParams } from "react-router-dom";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useCallback, useEffect, useState } from "react";
import { ROUTES } from "@/ui/routes/routes";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { ArrowLeft, FolderX, Trash2, UserCheck } from "lucide-react";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import './ProjectDetailPage.scss';
import '@/ui/components/organisms/confirmModal/ConfirmModal.scss';
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import type { ProjectDetail } from "@/domain/models/Project/ProjectDetail";
import { ProjectInfo } from "@/ui/components/organisms/projectInfo/ProjectInfo";
import { ProjectTeam } from "@/ui/components/organisms/projectTeam/ProjectTeam";
import { ProjectClients } from "@/ui/components/organisms/projectClients/ProjectClients";
import { ProjectDevelopment } from "@/ui/components/organisms/projectDevelopments/ProjectDevelopment";
import { ProjectHours } from "@/ui/components/organisms/projectHours/ProjectHours";

export const ProjectDetailPage = () => {

  const { id } = useParams<{ id: EntityId }>();
  const navigate = useNavigate();
  const { project: projectRepo } = useRepositories();
  const [targetProject, setTargetProject] = useState<ProjectDetail>();
  const [modalActive, setModalActive] = useState<"inactivar" | "activar" | "eliminar" | null>(null);
  const [loadingPatch, setLoadingPatch] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [activeTab, setActiveTab] = useState<ProjectTab>('info');

  const canEdit = targetProject?.permissions.canEdit ?? false;
  const canDelete = targetProject?.permissions.canDelete ?? false;

  useEffect(() => {
    if (!id) return;
    projectRepo.getById(id).then(setTargetProject);
  }, [id, projectRepo]);

  const closeToast = useCallback(() => setToast(null), []);


  const handleToggleActive = async () => {
    if (!id || !projectRepo) return;
    const nextValue = !targetProject?.isActive;
    setLoadingPatch(true);
    try {
      await projectRepo.patchActive(id, nextValue);
      setTargetProject((prev) => prev ? { ...prev, isActive: nextValue } : prev);
      setToast({
        message: nextValue ? "Activado correctamente" : "Inactivado correctamente",
        type: "success"
      });

    } catch (err) {
      setToast({
        message: "No se pudo completar la acción. Inténtalo de nuevo.",
        type: "error"
      });

      console.log(err)

    } finally {
      setLoadingPatch(false);
      setModalActive(null);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    setLoadingPatch(true);

    try {
      await projectRepo.deleteProject(id);

      setToast({
        message: "Empleado eliminado correctamente",
        type: "success"
      });
      setTimeout(() => navigate(ROUTES.USER.LIST), 1500);
    } catch (err) {
      setToast({
        message: getErrorMessage(err, "No se pudo eliminar el proyecto."),
        type: "error"
      });
      console.log(err);

    } finally {
      setLoadingPatch(false);
      setModalActive(null);
    }
  };

  return (
    <section className="project-detail-page">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {modalActive && (
        <ConfirmModal
          title={
            modalActive === "inactivar" ? "Inactivar Proyecto"
              : modalActive === "activar" ? "Activar Proyecto"
                : "Eliminar Proyecto"
          }
          message={
            modalActive === "inactivar"
              ? "¿Estás seguro de que deseas inactivar este proyecto? Los datos no se eliminarán."
              : modalActive === "activar"
                ? "¿Estás seguro de que deseas activar a este proyecto?"
                : "¿Estás seguro de que deseas eliminar a este proyecto? Esta acción no se puede deshacer."
          }
          loading={loadingPatch}
          onConfirm={modalActive === "eliminar" ? handleDelete : handleToggleActive}
          onCancel={() => setModalActive(null)}
        />
      )}

      <div className="project-detail-page_header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(ROUTES.PROJECTS.LIST)} aria-label="Volver">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Detalle del Proyecto</h1>
            <p className="info">Información completa del proyecto</p>
          </div>
        </div>

        {(canEdit || canDelete) && (
          <div className="header-actions">
            {canEdit && (
              targetProject?.isActive ? (
                <button className="btn-action btn-inactivar" onClick={() => setModalActive("inactivar")}>
                  <FolderX size={15} /> Inactivar
                </button>
              ) : (
                <button className="btn-action btn-activar" onClick={() => setModalActive("activar")}>
                  <UserCheck size={15} /> Activar
                </button>
              )
            )}
            {canDelete && (
              <button className="btn-action btn-eliminar" onClick={() => setModalActive("eliminar")}>
                <Trash2 size={15} /> Eliminar
              </button>
            )}
          </div>
        )}
      </div>
      <ProjectMenuBar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="project-detail-page_content">
        {activeTab === 'info' && <ProjectInfo isActive={targetProject?.isActive} />}
        {activeTab === 'equipo' && <ProjectTeam />}
        {activeTab === 'cliente' && <ProjectClients />}
        {activeTab === 'desarrollo' && <ProjectDevelopment canEdit={canEdit} />}
        {activeTab === 'horas' && <ProjectHours />}
      </div>

    </section>
  );
};
