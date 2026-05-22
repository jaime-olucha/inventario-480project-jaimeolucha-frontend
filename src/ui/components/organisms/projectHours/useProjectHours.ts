import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import type { ProjectTimeEntry } from "@/domain/models/Project/ProjectTimeEntry";
import type { EntityId } from "@/domain/value-objects/EntityId";

const today = new Date().toISOString().split("T")[0];

export const entrySchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  hours: z.string().refine((v) => Number(v) > 0, { message: "Introduce un número de horas válido" }),
  comment: z.string().optional(),
});

export type EntryForm = z.infer<typeof entrySchema>;

const EMPTY_FORM: EntryForm = { date: today, hours: "", comment: "" };

export function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export interface UseProjectHoursReturn extends UseToastReturn {
  entries: ProjectTimeEntry[];
  loading: boolean;
  saving: boolean;
  totalHours: number;
  canInput: boolean;
  canModify: (entry: ProjectTimeEntry) => boolean;
  showForm: boolean;
  editingId: EntityId | null;
  entryToDelete: ProjectTimeEntry | null;
  addForm: UseFormReturn<EntryForm>;
  editForm: UseFormReturn<EntryForm>;
  openAddForm: () => void;
  closeAddForm: () => void;
  handleCreate: (e?: React.BaseSyntheticEvent) => Promise<void>;
  openEdit: (entry: ProjectTimeEntry) => void;
  closeEdit: () => void;
  handleUpdate: (entryId: EntityId) => Promise<void>;
  handleDelete: () => Promise<void>;
  setEntryToDelete: (entry: ProjectTimeEntry | null) => void;
}

export const useProjectHours = (): UseProjectHoursReturn => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo, user: userRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);

  const [entries, setEntries] = useState<ProjectTimeEntry[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<EntityId | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<ProjectTimeEntry | null>(null);

  const { toast, showToast, closeToast } = useToast();

  const addForm = useForm<EntryForm>({ resolver: zodResolver(entrySchema), defaultValues: EMPTY_FORM });
  const editForm = useForm<EntryForm>({ resolver: zodResolver(entrySchema), defaultValues: EMPTY_FORM });

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;
  const canModify = (entry: ProjectTimeEntry) => isAdmin || entry.userId === userStore?.id;
  const canInput = isAdmin || isMember;
  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

  const refreshEntries = async () => {
    if (!id) return;
    const next = await projectRepo.getTimeEntries(id);
    setEntries(next);
  };

  useEffect(() => {
    if (!id || !userStore) return;
    setLoading(true);
    Promise.all([
      projectRepo.getTimeEntries(id),
      projectRepo.getUsers(id),
    ])
      .then(([timeEntries, members]) => {
        setEntries(timeEntries);
        setIsMember(members.some((member) => member.userId === userStore.id && member.isActive));
      })
      .catch(() => showToast("No se pudieron cargar las imputaciones."))
      .finally(() => setLoading(false));
  }, [id, projectRepo, userStore]);

  const openAddForm = () => {
    addForm.reset(EMPTY_FORM);
    setShowForm(true);
  };

  const closeAddForm = () => {
    setShowForm(false);
    addForm.reset(EMPTY_FORM);
  };

  const handleCreate = addForm.handleSubmit(async (data) => {
    if (!id || !userStore) return;
    setSaving(true);
    try {
      await userRepo.createTimeEntry(userStore.id, {
        projectId: id,
        date: data.date,
        hours: Number(data.hours),
        comment: data.comment ?? "",
      });
      await refreshEntries();
      closeAddForm();
      showToast("Imputación añadida correctamente.", "success");
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo añadir la imputación."));
    } finally {
      setSaving(false);
    }
  });

  const openEdit = (entry: ProjectTimeEntry) => {
    setEditingId(entry.id);
    editForm.reset({ date: entry.date, hours: String(entry.hours), comment: entry.comment ?? "" });
  };

  const closeEdit = () => {
    setEditingId(null);
    editForm.reset(EMPTY_FORM);
  };

  const handleUpdate = (entryId: EntityId) => editForm.handleSubmit(async (data) => {
    if (!id) return;
    setSaving(true);
    try {
      await projectRepo.updateTimeEntry(id, entryId, {
        date: data.date,
        hours: Number(data.hours),
        comment: data.comment ?? "",
      });
      await refreshEntries();
      closeEdit();
      showToast("Imputación actualizada correctamente.", "success");
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo actualizar la imputación."));
    } finally {
      setSaving(false);
    }
  })();

  const handleDelete = async () => {
    if (!id || !entryToDelete) return;
    setSaving(true);
    try {
      await projectRepo.deleteTimeEntry(id, entryToDelete.id);
      await refreshEntries();
      setEntryToDelete(null);
      showToast("Imputación eliminada correctamente.", "success");
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo eliminar la imputación."));
    } finally {
      setSaving(false);
    }
  };

  return {
    entries,
    loading,
    saving,
    totalHours,
    canInput,
    canModify,
    showForm,
    editingId,
    entryToDelete,
    addForm,
    editForm,
    openAddForm,
    closeAddForm,
    handleCreate,
    openEdit,
    closeEdit,
    handleUpdate,
    handleDelete,
    setEntryToDelete,
    toast,
    showToast,
    closeToast,
  };
};
