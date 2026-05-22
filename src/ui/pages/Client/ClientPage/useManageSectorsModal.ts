import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import type { Sector } from "@/domain/models/Client/Sector";
import type { EntityId } from "@/domain/value-objects/EntityId";

type SectorNameForm = { name: string };

export interface UseManageSectorsModalReturn extends UseToastReturn {
  sectors: Sector[];
  loading: boolean;
  actionLoading: boolean;
  editingId: EntityId | null;
  sectorToDelete: Sector | null;
  addForm: UseFormReturn<SectorNameForm>;
  editForm: UseFormReturn<SectorNameForm>;
  setEditingId: (id: EntityId | null) => void;
  setSectorToDelete: (sector: Sector | null) => void;
  startEditing: (sector: Sector) => void;
  handleCreate: (e?: React.BaseSyntheticEvent) => Promise<void>;
  handleUpdate: (id: EntityId) => void;
  handleDeleteClick: (sector: Sector) => void;
  handleConfirmDelete: () => Promise<void>;
}

interface UseManageSectorsModalProps {
  onSectorsChanged: () => void;
  onSuccess?: (message: string) => void;
  onClose: () => void;
}

export const useManageSectorsModal = ({
  onSectorsChanged,
  onSuccess,
  onClose,
}: UseManageSectorsModalProps): UseManageSectorsModalReturn => {
  const { sector: sectorRepo } = useRepositories();

  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [editingId, setEditingId] = useState<EntityId | null>(null);
  const [sectorToDelete, setSectorToDelete] = useState<Sector | null>(null);

  const { toast, showToast, closeToast } = useToast();
  const addForm = useForm<SectorNameForm>({ defaultValues: { name: "" } });
  const editForm = useForm<SectorNameForm>({ defaultValues: { name: "" } });

  const fetchSectors = async () => {
    setLoading(true);
    try {
      setSectors(await sectorRepo.getAll());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSectors(); }, []);

  const handleCreate = addForm.handleSubmit(async ({ name }) => {
    setActionLoading(true);
    try {
      await sectorRepo.create(name.trim());
      addForm.reset({ name: "" });
      await fetchSectors();
      onSectorsChanged();
      onSuccess?.("Sector creado correctamente");
      onClose();
    } catch (error) {
      showToast(getErrorMessage(error, "No se pudo crear el sector."));
    } finally {
      setActionLoading(false);
    }
  });

  const handleUpdate = (id: EntityId) => editForm.handleSubmit(async ({ name }) => {
    setActionLoading(true);
    try {
      await sectorRepo.update(id, name.trim());
      setEditingId(null);
      await fetchSectors();
      onSectorsChanged();
      onSuccess?.("Sector actualizado correctamente");
      onClose();
    } catch (error) {
      showToast(getErrorMessage(error, "No se pudo actualizar el sector."));
    } finally {
      setActionLoading(false);
    }
  })();

  const handleDeleteClick = (sector: Sector) => setSectorToDelete(sector);

  const handleConfirmDelete = async () => {
    if (!sectorToDelete) return;
    setActionLoading(true);
    try {
      await sectorRepo.delete(sectorToDelete.id);
      await fetchSectors();
      onSectorsChanged();
      onSuccess?.("Sector eliminado correctamente");
      onClose();
    } catch (error) {
      showToast(getErrorMessage(error, "No se pudo eliminar el sector."));
    } finally {
      setActionLoading(false);
      setSectorToDelete(null);
    }
  };

  const startEditing = (sector: Sector) => {
    setEditingId(sector.id);
    editForm.reset({ name: sector.name });
  };

  return {
    sectors,
    loading,
    actionLoading,
    editingId,
    sectorToDelete,
    addForm,
    editForm,
    setEditingId,
    setSectorToDelete,
    startEditing,
    handleCreate,
    handleUpdate,
    handleDeleteClick,
    handleConfirmDelete,
    toast,
    showToast,
    closeToast,
  };
};
