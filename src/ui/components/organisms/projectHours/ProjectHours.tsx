import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Check, Clock, MessageSquare, Pencil, Plus, Trash2, X } from "lucide-react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { MenuOptions } from "@/ui/components/organisms/menuOptions/MenuOptions";
import type { ProjectTimeEntry } from "@/domain/models/Project/ProjectTimeEntry";
import type { EntityId } from "@/domain/value-objects/EntityId";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";
import "./ProjectHours.scss";
import { useToast } from "@/ui/hooks/useToast";

const today = new Date().toISOString().split("T")[0];

const entrySchema = z.object({
  date: z.string().min(1, "La fecha es obligatoria"),
  hours: z.string().refine((v) => Number(v) > 0, { message: "Introduce un número de horas válido" }),
  comment: z.string().optional(),
});

type EntryForm = z.infer<typeof entrySchema>;

const EMPTY_FORM: EntryForm = { date: today, hours: "", comment: "" };

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const ProjectHours = () => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo, user: userRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);

  const [entries, setEntries] = useState<ProjectTimeEntry[]>([]);
  const [isMember, setIsMember] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<EntityId | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<ProjectTimeEntry | null>(null);

  const addForm = useForm<EntryForm>({ resolver: zodResolver(entrySchema), defaultValues: EMPTY_FORM });
  const editForm = useForm<EntryForm>({ resolver: zodResolver(entrySchema), defaultValues: EMPTY_FORM });

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;

  const canModify = (entry: ProjectTimeEntry) => isAdmin || entry.userId === userStore?.id;
  const canInput = isAdmin || isMember;

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

  const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);

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

  if (loading) {
    return (
      <section className="project-hours">
        <div className="card">
          <div className="skeleton skeleton--title" style={{ marginBottom: "1rem" }} />
          <div className="skeleton skeleton--full" style={{ height: "120px" }} />
        </div>
      </section>
    );
  }

  return (
    <section className="project-hours">
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
      )}

      {entryToDelete && (
        <ConfirmModal
          title="Eliminar imputación"
          message={`¿Seguro que deseas eliminar la imputación de ${entryToDelete.hours}h del ${formatDate(entryToDelete.date)}? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          loading={saving}
          onConfirm={handleDelete}
          onCancel={() => setEntryToDelete(null)}
        />
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <span className="header_title">Horas del proyecto</span>
            <p className="project-subtitle">
              Registro de horas imputadas por todo el equipo.
            </p>
          </div>
          <div className="header-actions">
            <span className="hours-total-badge">{totalHours}h total</span>
            <ActionButton icon={<Plus size={16} />} onClick={openAddForm} disabled={saving || showForm || !canInput}>
              Imputar horas
            </ActionButton>
          </div>
        </div>

        {showForm && (
          <div className="hours-form-panel">
            <div className="team-form-header">
              <div>
                <h3>Nueva imputación</h3>
                <p>Introduce la fecha, horas y un comentario opcional.</p>
              </div>
              <button type="button" className="icon-button" onClick={closeAddForm} disabled={saving} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <form className="hours-form-grid" onSubmit={handleCreate}>
              <label>
                Fecha
                <div className="input-with-icon">
                  <CalendarDays size={15} />
                  <input type="date" disabled={saving} {...addForm.register("date")} />
                </div>
                {addForm.formState.errors.date && <span className="field-error">{addForm.formState.errors.date.message}</span>}
              </label>

              <label>
                Horas
                <div className="input-with-icon">
                  <Clock size={15} />
                  <input type="number" min="0.25" step="0.25" placeholder="Ej. 7.5" disabled={saving} {...addForm.register("hours")} />
                </div>
                {addForm.formState.errors.hours && <span className="field-error">{addForm.formState.errors.hours.message}</span>}
              </label>

              <label className="hours-form-comment">
                Comentario
                <div className="input-with-icon">
                  <MessageSquare size={15} />
                  <input type="text" placeholder="Descripción del trabajo realizado" disabled={saving} {...addForm.register("comment")} />
                </div>
              </label>

              <div className="team-form-actions">
                <button type="button" className="btn-secondary" onClick={closeAddForm} disabled={saving}>
                  <X size={16} /> Cancelar
                </button>
                <ActionButton type="submit" icon={<Check size={16} />} disabled={saving}>
                  {saving ? "Guardando..." : "Guardar"}
                </ActionButton>
              </div>
            </form>
          </div>
        )}

        {entries.length === 0 ? (
          <div className="empty-state">
            <Clock size={38} />
            <h3>Sin imputaciones</h3>
            <p>Cuando el equipo impute horas aparecerán aquí.</p>
          </div>
        ) : (
          <div className="hours-table-wrapper">
            <table className="hours-table">
              <thead>
                <tr>
                  <th>Persona</th>
                  <th>Fecha</th>
                  <th>Horas</th>
                  <th>Comentario</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {entries.map((entry) => {
                  const isEditing = editingId === entry.id;
                  const modifiable = canModify(entry);

                  if (isEditing) {
                    return (
                      <tr key={entry.id} className="hours-row hours-row--editing">
                        <td className="cell-name">
                          {entry.name} {entry.surname}
                        </td>
                        <td>
                          <div className="input-with-icon input-with-icon--sm">
                            <CalendarDays size={13} />
                            <input type="date" disabled={saving} {...editForm.register("date")} />
                          </div>
                        </td>
                        <td>
                          <div className="input-with-icon input-with-icon--sm">
                            <Clock size={13} />
                            <input type="number" min="0.25" step="0.25" disabled={saving} className="input-hours" {...editForm.register("hours")} />
                          </div>
                        </td>
                        <td>
                          <input type="text" disabled={saving} className="input-comment" {...editForm.register("comment")} />
                        </td>
                        <td className="cell-actions">
                          <button
                            type="button"
                            className="icon-button icon-button--confirm"
                            onClick={() => handleUpdate(entry.id)}
                            disabled={saving}
                            aria-label="Guardar"
                          >
                            <Check size={15} />
                          </button>
                          <button
                            type="button"
                            className="icon-button"
                            onClick={closeEdit}
                            disabled={saving}
                            aria-label="Cancelar"
                          >
                            <X size={15} />
                          </button>
                        </td>
                      </tr>
                    );
                  }

                  return (
                    <tr key={entry.id} className="hours-row">
                      <td className="cell-name">
                        {entry.name} {entry.surname}
                      </td>
                      <td className="cell-date">{formatDate(entry.date)}</td>
                      <td className="cell-hours">
                        <span className="hours-chip">{entry.hours}h</span>
                      </td>
                      <td className="cell-comment">{entry.comment || <span className="no-comment">—</span>}</td>
                      <td className="cell-actions">
                        {modifiable && (
                          <MenuOptions
                            disabled={saving}
                            items={[
                              { label: "Editar", icon: <Pencil size={14} />, onClick: () => openEdit(entry) },
                              { label: "Eliminar", icon: <Trash2 size={14} />, variant: "danger", onClick: () => setEntryToDelete(entry) },
                            ]}
                          />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
};
