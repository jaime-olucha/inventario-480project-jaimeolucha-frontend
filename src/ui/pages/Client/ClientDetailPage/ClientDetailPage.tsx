import { Trash2, UserCheck, UserX } from "lucide-react";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { DetailPageHeader } from "@/ui/components/molecules/detailPageHeader/DetailPageHeader";
import { ClientInfoCard } from "@/ui/components/organisms/clientInfoCard/ClientInfoCard";
import { ProjectsListCard } from "@/ui/components/organisms/projectsListCard/ProjectsListCard";
import { useClientDetailPage } from "./useClientDetailPage";
import "./ClientDetailPage.scss";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";

export const ClientDetailPage = () => {
  const {
    id, targetClient, projects, isAdmin,
    toast, closeToast,
    modalActive, loadingPatch,
    openModal, closeModal,
    handleToggleActive, handleDelete,
    onClientLoaded, handleBack,
  } = useClientDetailPage();

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
          onCancel={closeModal}
        />
      )}

      <DetailPageHeader
        title="Detalle de Cliente"
        subtitle="Información completa, contactos y proyectos del cliente"
        onBack={handleBack}
        actions={isAdmin && (
          <>
            {targetClient?.isActive ? (
              <button className="btn-action btn-inactivar" onClick={() => openModal("inactivar")}>
                <UserX size={15} /> Inactivar
              </button>
            ) : (
              <button className="btn-action btn-activar" onClick={() => openModal("activar")}>
                <UserCheck size={15} /> Activar
              </button>
            )}
            <button className="btn-action btn-eliminar" onClick={() => openModal("eliminar")}>
              <Trash2 size={15} /> Eliminar
            </button>
          </>
        )}
      />

      <section className="client-detail-page_section">
        {id && (
          <ClientInfoCard
            clientId={id}
            onClientLoaded={onClientLoaded}
          />
        )}

        <ProjectsListCard
          projects={projects}
          description="Proyectos asociados a este cliente"
          emptyText="No hay proyectos asociados"
          renderActiveBadge={(project) => <span className="project-badge">{project.teamMembers} miembros</span>}
        />
      </section>
    </main>
  );
};
