import { useState, useEffect, useCallback } from "react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import { useModal } from "@/ui/hooks/useModal";
import type { Client } from "@/domain/models/Client/Client";
import type { Sector } from "@/domain/models/Client/Sector";
import type { UpdateClientRequest } from "@/domain/models/Client/UpdateClientRequest";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface UseClientInfoCardReturn extends UseToastReturn {
  client: Client | null;
  sectors: Sector[];
  isEditing: boolean;
  editData: UpdateClientRequest;
  saving: boolean;
  isAdmin: boolean;
  isManageSectorsOpen: boolean;
  openManageSectors: () => void;
  closeManageSectors: () => void;
  refreshSectors: () => Promise<void>;
  handleEditClick: () => Promise<void>;
  handleSave: () => Promise<void>;
  handleInputChange: (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  cancelEdit: () => void;
}

interface UseClientInfoCardProps {
  clientId: EntityId;
  onClientLoaded?: (client: Client) => void;
}

export const useClientInfoCard = ({ clientId, onClientLoaded }: UseClientInfoCardProps): UseClientInfoCardReturn => {
  const { client: clientRepo, sector: sectorRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);

  const [client, setClient] = useState<Client | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateClientRequest>({ name: "", isActive: true, sectorId: "" });
  const [saving, setSaving] = useState(false);

  const { toast, showToast, closeToast } = useToast();
  const { isOpen: isManageSectorsOpen, open: openManageSectors, close: closeManageSectors } = useModal();

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;

  useEffect(() => {
    clientRepo.getById(clientId).then((loaded) => {
      setClient(loaded);
      onClientLoaded?.(loaded);
    });
  }, [clientId, clientRepo, onClientLoaded]);

  const refreshSectors = useCallback(async () => {
    try {
      setSectors(await sectorRepo.getAll());
    } catch {
      showToast("Error al refrescar sectores", "error");
    }
  }, [sectorRepo, showToast]);

  const handleEditClick = async () => {
    if (!client) return;
    try {
      setSectors(await sectorRepo.getAll());
      setEditData({ name: client.name, isActive: client.isActive, sectorId: client.sectorId });
      setIsEditing(true);
    } catch {
      showToast("Error al cargar sectores", "error");
    }
  };

  const handleSave = async () => {
    if (!client) return;
    setSaving(true);
    try {
      await clientRepo.putClient(clientId, editData);
      const selectedSector = sectors.find((s) => s.id === editData.sectorId);
      setClient((prev) =>
        prev ? { ...prev, ...editData, sectorName: selectedSector?.name ?? prev.sectorName } : prev
      );
      showToast("Información actualizada correctamente", "success");
      setIsEditing(false);
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo guardar la información del cliente."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  return {
    client,
    sectors,
    isEditing,
    editData,
    saving,
    isAdmin,
    isManageSectorsOpen,
    openManageSectors,
    closeManageSectors,
    refreshSectors,
    handleEditClick,
    handleSave,
    handleInputChange,
    cancelEdit: () => setIsEditing(false),
    toast,
    showToast,
    closeToast,
  };
};
