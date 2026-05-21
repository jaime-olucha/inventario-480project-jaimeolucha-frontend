import ProjectMenuBar, { type ProjectTab } from "@/ui/components/organisms/menuItem/ProjectMenuItem";
import { useNavigate, useParams } from "react-router-dom";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useEffect, useState } from "react";
import { ROUTES } from "@/ui/routes/routes";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { FolderX, Trash2, UserCheck } from "lucide-react";
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
import { useToast } from "@/ui/hooks/useToast";
import { useEntityActions } from "@/ui/hooks/useEntityActions";
import { DetailPageHeader } from "@/ui/components/molecules/detailPageHeader/DetailPageHeader";

export const ProjectDetailPage = () => {

  const { id } = useParams<{ id: EntityId }>();
  const navigate = useNavigate();
  const { project: projectRepo } = useRepositories();
  const [targetProject, setTargetProject] = useState<ProjectDetail>();
  const { toast, showToast, closeToast } = useToast();
  const {
    modalActive,
    loadingPatch,
    openModal,
    closeModal,
    handleDelete,
    handleToggleActive,

  } = useEntityActions({
    entityId: id,
    isActive: targetProject?.isActive,
    patchActive: (projectId, nextValue) => projectRepo.patchActive(projectId, nextValue),
    deleteEntity: (projectId) => projectRepo.deleteProject(projectId),
    onActiveChanged: (nextValue) => {
      setTargetProject((prev) => prev ? { ...prev, isActive: nextValue } : prev);
    },

    onDeleted: () => {
      setTimeout(() => navigate(ROUTES.USER.LIST), 1500);
    },

    showToast,
    messages: {
      activateSuccess: "Activado correctamente",
      deactivateSuccess: "Inactivado correctamente",
      toggleError: () => "No se pudo completar la acción. Inténtalo de nuevo.",
      deleteSuccess: "Empleado eliminado correctamente",
      deleteError: (error) => getErrorMessage(error, "No se pudo eliminar el proyecto."),
    },
  });
  const [activeTab, setActiveTab] = useState<ProjectTab>('info');

  const canEdit = targetProject?.permissions.canEdit ?? false;
  const canDelete = targetProject?.permissions.canDelete ?? false;

  useEffect(() => {
    if (!id) return;
    projectRepo.getById(id).then(setTargetProject);
  }, [id, projectRepo]);

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
          onCancel={closeModal}
        />
      )}

      <DetailPageHeader
        title="Detalle del Proyecto"
        subtitle="Información completa del proyecto"
        onBack={() => navigate(ROUTES.PROJECTS.LIST)}
        actions={(canEdit || canDelete) && (
          <>
            {canEdit && (
              targetProject?.isActive ? (
                <button className="btn-action btn-inactivar" onClick={() => openModal("inactivar")}>
                  <FolderX size={15} /> Inactivar
                </button>
              ) : (
                <button className="btn-action btn-activar" onClick={() => openModal("activar")}>
                  <UserCheck size={15} /> Activar
                </button>
              )
            )}
            {canDelete && (
              <button className="btn-action btn-eliminar" onClick={() => openModal("eliminar")}>
                <Trash2 size={15} /> Eliminar
              </button>
            )}
          </>
        )}
      />
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
