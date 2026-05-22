import { CalendarDays, Check, Clock, Pencil, Plus, Trash2, X } from "lucide-react";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { MenuOptions } from "@/ui/components/organisms/menuOptions/MenuOptions";
import { HoursFormPanel } from "./HoursFormPanel";
import { useProjectHours, formatDate } from "./useProjectHours";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";
import "./ProjectHours.scss";

export const ProjectHours = () => {
  const {
    entries, loading, saving, totalHours,
    canInput, canModify,
    toast, closeToast,
    showForm, editingId,
    addForm, editForm,
    openAddForm, closeAddForm, handleCreate,
    openEdit, closeEdit, handleUpdate,
    entryToDelete, setEntryToDelete, handleDelete,
  } = useProjectHours();

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
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

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
            <p className="project-subtitle">Registro de horas imputadas por todo el equipo.</p>
          </div>
          <div className="header-actions">
            <span className="hours-total-badge">{totalHours}h total</span>
            <ActionButton icon={<Plus size={16} />} onClick={openAddForm} disabled={saving || showForm || !canInput}>
              Imputar horas
            </ActionButton>
          </div>
        </div>

        {showForm && (
          <HoursFormPanel
            addForm={addForm}
            saving={saving}
            onClose={closeAddForm}
            onSubmit={handleCreate}
          />
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
                        <td className="cell-name">{entry.name} {entry.surname}</td>
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
                      <td className="cell-name">{entry.name} {entry.surname}</td>
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
