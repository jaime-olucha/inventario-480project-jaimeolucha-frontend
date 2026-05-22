import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { toInputDate } from "@/infrastructure/helpers/formatDate";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import type { ProjectDetail } from "@/domain/models/Project/ProjectDetail";
import type { Client } from "@/domain/models/Client/Client";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { UpdateProjectRequest } from "@/domain/models/Project/UpdateProjectRequest";

export type EditForm = Omit<UpdateProjectRequest, "isActive">;

export interface UseProjectInfoReturn extends UseToastReturn {
  project: ProjectDetail | undefined;
  clients: Client[];
  loading: boolean;
  editing: boolean;
  saving: boolean;
  isAdmin: boolean;
  canEdit: boolean;
  currentIsActive: boolean | undefined;
  form: UseFormReturn<EditForm>;
  startEdit: () => void;
  cancelEdit: () => void;
  onSubmit: (data: EditForm) => Promise<void>;
}

interface ProjectInfoProps {
  isActive?: boolean;
}

export const useProjectInfo = ({ isActive: isActiveProp }: ProjectInfoProps): UseProjectInfoReturn => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo, client: clientRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);

  const [project, setProject] = useState<ProjectDetail>();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const { toast, showToast, closeToast } = useToast();
  const form = useForm<EditForm>();

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;
  const canEdit = project?.permissions.canEdit ?? false;
  const currentIsActive = isActiveProp !== undefined ? isActiveProp : project?.isActive;

  useEffect(() => {
    if (!id) return;
    const clientsPromise = isAdmin ? clientRepo.getAll(1, 100) : Promise.resolve([]);
    Promise.all([projectRepo.getById(id), clientsPromise])
      .then(([proj, cls]) => {
        setProject(proj);
        setClients(cls as Client[]);
      })
      .finally(() => setLoading(false));
  }, [id, isAdmin, projectRepo, clientRepo]);

  const startEdit = () => {
    if (!project) return;
    form.reset({
      name: project.name,
      description: project.description ?? "",
      startDate: toInputDate(project.startDate),
      clientId: project.clientId,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const onSubmit = async (data: EditForm) => {
    if (!id || !project) return;
    setSaving(true);
    try {
      await projectRepo.putUser(id, {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        isActive: project.isActive,
        clientId: data.clientId,
      });
      const selectedClient = clients.find((client) => client.id === data.clientId);
      setProject((prev) =>
        prev
          ? {
              ...prev,
              name: data.name,
              description: data.description,
              startDate: new Date(data.startDate),
              clientId: data.clientId,
              clientName: selectedClient?.name ?? prev.clientName,
            }
          : prev
      );
      setEditing(false);
      showToast("Proyecto actualizado correctamente.", "success");
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo guardar el proyecto."));
    } finally {
      setSaving(false);
    }
  };

  return {
    project,
    clients,
    loading,
    editing,
    saving,
    isAdmin,
    canEdit,
    currentIsActive,
    form,
    startEdit,
    cancelEdit,
    onSubmit,
    toast,
    showToast,
    closeToast,
  };
};
