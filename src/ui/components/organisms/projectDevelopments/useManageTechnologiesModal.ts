import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import type { Technology } from "@/domain/models/Project/Technology";
import type { EntityId } from "@/domain/value-objects/EntityId";

type TechNameForm = { name: string };

export interface UseManageTechnologiesModalReturn extends UseToastReturn {
  technologies: Technology[];
  loading: boolean;
  actionLoading: boolean;
  editingId: EntityId | null;
  techToDelete: Technology | null;
  addForm: UseFormReturn<TechNameForm>;
  editForm: UseFormReturn<TechNameForm>;
  setEditingId: (id: EntityId | null) => void;
  setTechToDelete: (tech: Technology | null) => void;
  startEditing: (tech: Technology) => void;
  handleCreate: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleUpdate: (id: EntityId) => void;
  handleConfirmDelete: () => Promise<void>;
}

interface UseManageTechnologiesModalProps {
  onChanged: () => void;
  onSuccess?: (message: string) => void;
}

export const useManageTechnologiesModal = ({
  onChanged,
  onSuccess,
}: UseManageTechnologiesModalProps): UseManageTechnologiesModalReturn => {
  const { technology: technologyRepo } = useRepositories();

  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState<EntityId | null>(null);
  const [techToDelete, setTechToDelete] = useState<Technology | null>(null);

  const { toast, showToast, closeToast } = useToast();
  const addForm = useForm<TechNameForm>({ defaultValues: { name: "" } });
  const editForm = useForm<TechNameForm>({ defaultValues: { name: "" } });

  const fetchTechnologies = async () => {
    setLoading(true);
    try {
      setTechnologies(await technologyRepo.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTechnologies(); }, []);

  const handleCreate = addForm.handleSubmit(async ({ name }) => {
    setActionLoading(true);
    try {
      await technologyRepo.create(name.trim());
      addForm.reset({ name: "" });
      await fetchTechnologies();
      onChanged();
      onSuccess?.("Tecnología creada correctamente.");
    } catch (error) {
      showToast(getErrorMessage(error, "No se pudo crear la tecnología."));
    } finally {
      setActionLoading(false);
    }
  });

  const handleUpdate = (id: EntityId) => editForm.handleSubmit(async ({ name }) => {
    setActionLoading(true);
    try {
      await technologyRepo.update(id, name.trim());
      setEditingId(null);
      await fetchTechnologies();
      onChanged();
      onSuccess?.("Tecnología actualizada correctamente.");
    } catch (error) {
      showToast(getErrorMessage(error, "No se pudo actualizar la tecnología."));
    } finally {
      setActionLoading(false);
    }
  })();

  const handleConfirmDelete = async () => {
    if (!techToDelete) return;
    setActionLoading(true);
    try {
      await technologyRepo.delete(techToDelete.id);
      setTechToDelete(null);
      await fetchTechnologies();
      onChanged();
      onSuccess?.("Tecnología eliminada correctamente.");
    } catch (error) {
      showToast(getErrorMessage(error, "No se pudo eliminar la tecnología."));
    } finally {
      setActionLoading(false);
    }
  };

  const startEditing = (tech: Technology) => {
    setEditingId(tech.id);
    editForm.reset({ name: tech.name });
  };

  return {
    technologies,
    loading,
    actionLoading,
    editingId,
    techToDelete,
    addForm,
    editForm,
    setEditingId,
    setTechToDelete,
    startEditing,
    handleCreate,
    handleUpdate,
    handleConfirmDelete,
    toast,
    showToast,
    closeToast,
  };
};
