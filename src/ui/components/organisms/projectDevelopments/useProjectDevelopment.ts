import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, type UseFormRegister, type FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useToast, type ToastState } from "@/ui/hooks/useToast";
import { useModal } from "@/ui/hooks/useModal";
import type { Development } from "@/domain/models/Project/Development";
import type { Technology } from "@/domain/models/Project/Technology";
import type { Environment } from "@/domain/value-objects/Environment";
import type { EntityId } from "@/domain/value-objects/EntityId";

export const devSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  technologyId: z.string().min(1, "Selecciona una tecnología"),
  urlRepository: z.string().url("Introduce una URL válida").or(z.literal("")),
  productionUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
  preproductionUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
  stageUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
});

export type DevForm = z.infer<typeof devSchema>;

export const EMPTY_FORM: DevForm = {
  name: "",
  description: "",
  technologyId: "",
  urlRepository: "",
  productionUrl: "",
  preproductionUrl: "",
  stageUrl: "",
};

export interface UseProjectDevelopmentReturn {
  developments: Development[];
  technologies: Technology[];
  refreshTechnologies: () => void;

  loading: boolean;
  saving: boolean;
  error: string | null;

  toast: ToastState | null;
  showToast: (message: string, type?: "success" | "error") => void;
  closeToast: () => void;

  showForm: boolean;
  editingDev: Development | null;
  register: UseFormRegister<DevForm>;
  errors: FieldErrors<DevForm>;
  openAddForm: () => void;
  openEditForm: (dev: Development) => void;
  closeForm: () => void;
  handleSubmitForm: (e?: React.BaseSyntheticEvent) => Promise<void>;

  devToDelete: Development | null;
  setDevToDelete: (dev: Development | null) => void;
  handleDelete: () => Promise<void>;

  showTechModal: boolean;
  openTechModal: () => void;
  closeTechModal: () => void;
}

export const useProjectDevelopment = (): UseProjectDevelopmentReturn => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo, technology: technologyRepo } = useRepositories();

  const [developments, setDevelopments] = useState<Development[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDev, setEditingDev] = useState<Development | null>(null);
  const [devToDelete, setDevToDelete] = useState<Development | null>(null);

  const { toast, showToast, closeToast } = useToast();
  const { isOpen: showTechModal, open: openTechModal, close: closeTechModal } = useModal();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DevForm>({
    resolver: zodResolver(devSchema),
    defaultValues: EMPTY_FORM,
  });

  const fetchAll = async () => {
    if (!id) return;
    const [devs, techs] = await Promise.all([
      projectRepo.getDevelopments(id),
      technologyRepo.getAll(),
    ]);
    setDevelopments(devs);
    setTechnologies(techs);
  };

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetchAll()
      .catch(() => setError("No se pudieron cargar los desarrollos del proyecto."))
      .finally(() => setLoading(false));
  }, [id]);

  const openAddForm = () => {
    reset(EMPTY_FORM);
    setEditingDev(null);
    setShowForm(true);
  };

  const openEditForm = (dev: Development) => {
    const linksByEnv = Object.fromEntries(dev.links.map((l) => [l.environment, l.url]));
    reset({
      name: dev.name,
      description: dev.description ?? "",
      technologyId: dev.technology.id,
      urlRepository: dev.urlRepository ?? "",
      productionUrl: linksByEnv["PRODUCTION"] ?? "",
      preproductionUrl: linksByEnv["PREPRODUCTION"] ?? "",
      stageUrl: linksByEnv["STAGE"] ?? "",
    });
    setEditingDev(dev);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingDev(null);
    reset(EMPTY_FORM);
  };

  const handleSubmitForm = handleSubmit(async (data) => {
    if (!id) return;
    setSaving(true);
    try {
      if (editingDev) {
        const links: { environment: Environment; url: string }[] = [];
        if (data.productionUrl) links.push({ environment: "PRODUCTION", url: data.productionUrl });
        if (data.preproductionUrl) links.push({ environment: "PREPRODUCTION", url: data.preproductionUrl });
        if (data.stageUrl) links.push({ environment: "STAGE", url: data.stageUrl });

        await projectRepo.updateDevelopment(id, editingDev.id, {
          name: data.name,
          description: data.description,
          technologyId: data.technologyId,
          urlRepository: data.urlRepository,
          links,
        });
        showToast("Desarrollo actualizado correctamente.", "success");
      } else {
        await projectRepo.createDevelopment(id, {
          name: data.name,
          description: data.description,
          technologyId: data.technologyId,
          urlRepository: data.urlRepository,
        });
        showToast("Desarrollo creado correctamente.", "success");
      }
      await fetchAll();
      closeForm();
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo guardar el desarrollo."));
    } finally {
      setSaving(false);
    }
  });

  const handleDelete = async () => {
    if (!id || !devToDelete) return;
    setSaving(true);
    try {
      await projectRepo.deleteDevelopment(id, devToDelete.id);
      setDevToDelete(null);
      await fetchAll();
      showToast("Desarrollo eliminado correctamente.", "success");

    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo eliminar el desarrollo."));

    } finally {
      setSaving(false);
    }
  };

  const refreshTechnologies = () => {
    technologyRepo.getAll().then(setTechnologies);
  };

  return {
    developments,
    technologies,
    refreshTechnologies,

    loading,
    saving,
    error,

    toast,
    showToast,
    closeToast,

    showForm,
    editingDev,
    register,
    errors,
    openAddForm,
    openEditForm,
    closeForm,
    handleSubmitForm,

    devToDelete,
    setDevToDelete,
    handleDelete,

    showTechModal,
    openTechModal,
    closeTechModal,
  };
};
