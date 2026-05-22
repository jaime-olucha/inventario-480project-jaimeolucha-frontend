import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import { useModal } from "@/ui/hooks/useModal";
import type { Sector } from "@/domain/models/Client/Sector";
import type { CreateClientRequest } from "@/domain/models/Client/CreateClientRequest";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  sectorId: z.string().min(1, "El sector es obligatorio"),
});

export type CreateClientFormValues = z.infer<typeof schema>;

export interface UseCreateClientModalReturn extends UseToastReturn {
  sectors: Sector[];
  serverError: string | null;
  form: UseFormReturn<CreateClientFormValues>;
  sectorOptions: { value: string; label: string }[];
  isManageSectorsOpen: boolean;
  openManageSectors: () => void;
  closeManageSectors: () => void;
  refreshSectors: () => void;
  handleCreate: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

interface UseCreateClientModalProps {
  onSubmit: (data: CreateClientRequest) => Promise<void>;
  onClose: () => void;
}

export const useCreateClientModal = ({
  onSubmit,
  onClose,
}: UseCreateClientModalProps): UseCreateClientModalReturn => {
  const { sector: sectorRepo } = useRepositories();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);

  const { toast, showToast, closeToast } = useToast();
  const { isOpen: isManageSectorsOpen, open: openManageSectors, close: closeManageSectors } = useModal();

  const form = useForm<CreateClientFormValues>({
    resolver: zodResolver(schema),
  });

  const refreshSectors = () => {
    sectorRepo.getAll().then(setSectors);
  };

  useEffect(() => {
    refreshSectors();
  }, [sectorRepo]);

  const handleCreate = form.handleSubmit(async (data) => {
    setServerError(null);
    try {
      await onSubmit({ name: data.name, sectorId: data.sectorId });
      onClose();
    } catch (error) {
      if (error instanceof Error && error.message.includes("409")) {
        setServerError("Ya existe un cliente con este nombre.");
      } else {
        setServerError("Error al crear el cliente. Inténtalo de nuevo.");
      }
    }
  });

  const sectorOptions = sectors.map((s) => ({ value: String(s.id), label: s.name }));

  return {
    sectors,
    serverError,
    form,
    sectorOptions,
    isManageSectorsOpen,
    openManageSectors,
    closeManageSectors,
    refreshSectors,
    handleCreate,
    toast,
    showToast,
    closeToast,
  };
};
