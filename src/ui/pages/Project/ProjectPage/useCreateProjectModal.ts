import { useEffect, useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import type { Client } from "@/domain/models/Client/Client";
import type { CreateProjectRequest } from "@/domain/models/Project/CreateProjectRequest";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  startDate: z.string().optional().or(z.literal("")),
  clientId: z.string().min(1, "Debes seleccionar un cliente"),
});

export type CreateProjectFormInput = z.input<typeof schema>;

export interface UseCreateProjectModalReturn extends UseToastReturn {
  clients: Client[];
  form: UseFormReturn<CreateProjectFormInput>;
  handleCreate: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

interface UseCreateProjectModalProps {
  onSubmit: (data: CreateProjectRequest) => Promise<void>;
  onClose: () => void;
}

export const useCreateProjectModal = ({
  onSubmit,
  onClose,
}: UseCreateProjectModalProps): UseCreateProjectModalReturn => {
  const { client: clientRepo } = useRepositories();
  const [clients, setClients] = useState<Client[]>([]);
  const { toast, showToast, closeToast } = useToast();

  const form = useForm<CreateProjectFormInput>({
    resolver: zodResolver(schema),
    defaultValues: { startDate: "", clientId: "" },
  });

  useEffect(() => {
    clientRepo.getAll(1, 1000).then(setClients);
  }, [clientRepo]);

  const handleCreate = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data as CreateProjectRequest);
      onClose();
    } catch (error) {
      showToast(getErrorMessage(error, "No se pudo crear el proyecto."));
    }
  });

  return { clients, form, handleCreate, toast, showToast, closeToast };
};
