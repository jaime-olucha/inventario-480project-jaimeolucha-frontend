import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import { useEntityActions, type UseEntityActionsReturn } from "@/ui/hooks/useEntityActions";
import { ROUTES } from "@/ui/routes/routes";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Client } from "@/domain/models/Client/Client";
import type { ClientProject } from "@/domain/models/Client/ClientProject";

export interface UseClientDetailPageReturn extends UseToastReturn, UseEntityActionsReturn {
  id: EntityId | undefined;
  targetClient: Client | null;
  projects: ClientProject[];
  isAdmin: boolean;
  onClientLoaded: (client: Client) => void;
  handleBack: () => void;
}

export const useClientDetailPage = (): UseClientDetailPageReturn => {
  const { id } = useParams<{ id: EntityId }>();
  const navigate = useNavigate();
  const { client: clientRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);

  const [targetClient, setTargetClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);

  const { toast, showToast, closeToast } = useToast();

  const entityActions = useEntityActions({
    entityId: id,
    isActive: targetClient?.isActive,
    patchActive: (clientId, nextValue) => clientRepo.patchActive(clientId, nextValue),
    deleteEntity: (clientId) => clientRepo.deleteClient(clientId),
    onActiveChanged: (nextValue) => {
      setTargetClient((prev) => (prev ? { ...prev, isActive: nextValue } : prev));
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

  return {
    id,
    targetClient,
    projects,
    isAdmin,
    onClientLoaded: setTargetClient,
    handleBack: () => navigate(ROUTES.CLIENTS.LIST),
    toast,
    showToast,
    closeToast,
    ...entityActions,
  };
};
