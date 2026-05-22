import { FolderX, Trash2, UserCheck } from "lucide-react";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { DetailPageHeader } from "@/ui/components/molecules/detailPageHeader/DetailPageHeader";
import { ProjectInfo } from "@/ui/components/organisms/projectInfo/ProjectInfo";
import { ProjectTeam } from "@/ui/components/organisms/projectTeam/ProjectTeam";
import { ProjectClients } from "@/ui/components/organisms/projectClients/ProjectClients";
import { ProjectDevelopment } from "@/ui/components/organisms/projectDevelopments/ProjectDevelopment";
import { ProjectHours } from "@/ui/components/organisms/projectHours/ProjectHours";
import ProjectMenuBar from "@/ui/components/organisms/menuItem/ProjectMenuItem";
import { useProjectDetailPage } from "./useProjectDetailPage";
import "./ProjectDetailPage.scss";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";

export const ProjectDetailPage = () => {
  const {
    targetProject, activeTab, setActiveTab,
    canEdit, canDelete,
    toast, closeToast,
    modalActive, loadingPatch,
    openModal, closeModal,
    handleToggleActive, handleDelete,
    handleBack,
  } = useProjectDetailPage();

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
        onBack={handleBack}
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
        {activeTab === "info" && <ProjectInfo isActive={targetProject?.isActive} />}
        {activeTab === "equipo" && <ProjectTeam />}
        {activeTab === "cliente" && <ProjectClients />}
        {activeTab === "desarrollo" && <ProjectDevelopment canEdit={canEdit} />}
        {activeTab === "horas" && <ProjectHours />}
      </div>
    </section>
  );
};
