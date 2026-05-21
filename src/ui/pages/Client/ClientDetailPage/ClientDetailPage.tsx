import { useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "@/infrastructure/store/user.store";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useEffect, useState } from "react";
import { ROUTES } from "@/ui/routes/routes";
import "./ClientDetailPage.scss";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { Trash2, UserCheck, UserX } from "lucide-react";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ClientInfoCard } from "@/ui/components/organisms/clientInfoCard/ClientInfoCard";
import type { Client } from "@/domain/models/Client/Client";
import type { ClientProject } from "@/domain/models/Client/ClientProject";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";
import { useToast } from "@/ui/hooks/useToast";
import { useEntityActions } from "@/ui/hooks/useEntityActions";
import { ProjectsListCard } from "@/ui/components/organisms/projectsListCard/ProjectsListCard";
import { DetailPageHeader } from "@/ui/components/molecules/detailPageHeader/DetailPageHeader";

export const ClientDetailPage = () => {
  const { id } = useParams<{ id: EntityId }>();
  const navigate = useNavigate();
  const userStore = useUserStore((store) => store.user);
  const { client: clientRepo } = useRepositories();

  const [targetClient, setTargetClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const { toast, showToast, closeToast } = useToast();
  const { modalActive, loadingPatch, openModal, closeModal, handleDelete, handleToggleActive, } = useEntityActions({
    entityId: id,
    isActive: targetClient?.isActive,
    patchActive: (clientId, nextValue) => clientRepo.patchActive(clientId, nextValue),
    deleteEntity: (clientId) => clientRepo.deleteClient(clientId),
    onActiveChanged: (nextValue) => {
      setTargetClient((prev) => prev ? { ...prev, isActive: nextValue } : prev);
    },
    onDeleted: () => {
      setTimeout(() => navigate(ROUTES.CLIENTS.LIST), 1500);
    },
    showToast,
    messages: {
      activateSuccess: "Activado correctamente",
      deactivateSuccess: "Inactivado correctamente",
      toggleError: (error) => getErrorMessage(error, "No se pudo cambiar el estado del cliente."),
      deleteSuccess: "Cliente eliminado correctamente",
      deleteError: (error) => getErrorMessage(error, "No se pudo eliminar el cliente."),
    },
  });

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;

  useEffect(() => {
    if (!id) return;
    clientRepo.getProjects(id).then(setProjects);
  }, [id, clientRepo]);

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
        onBack={() => navigate(ROUTES.CLIENTS.LIST)}
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
            isAdmin={isAdmin}
            onToast={showToast}
            onClientLoaded={setTargetClient}
          />
        )}

        <ProjectsListCard
          projects={projects}
          description="Proyectos asociados a este cliente"
          emptyText="No hay proyectos asociados"
          renderActiveBadge={(p) => <span className="project-badge">{p.teamMembers} miembros</span>}
        />
      </section>
    </main>
  );
};
