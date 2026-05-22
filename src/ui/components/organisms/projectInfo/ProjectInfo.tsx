import { Pencil, X, Check, Building2 } from "lucide-react";
import { StatusBadge } from "@/ui/components/atoms/statusBadge/StatusBadge";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { formatDate } from "@/infrastructure/helpers/formatDate";
import { useProjectInfo } from "./useProjectInfo";
import "./ProjectInfo.scss";

interface ProjectInfoProps {
  isActive?: boolean;
}

export const ProjectInfo = ({ isActive }: ProjectInfoProps) => {
  const {
    project, clients, loading, editing, saving,
    isAdmin, canEdit, currentIsActive,
    toast, closeToast,
    form: { register, handleSubmit, formState: { errors } },
    startEdit, cancelEdit, onSubmit,
  } = useProjectInfo({ isActive });

  if (loading) {
    return (
      <div className="project-info">
        <div className="card">
          <div className="card-header">
            <div className="skeleton-header">
              <div className="skeleton skeleton--title" />
              <div className="skeleton skeleton--short" />
            </div>
          </div>
          <div className="info-grid">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="info-field">
                <div className="skeleton skeleton--label" />
                <div className="skeleton skeleton--full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!project) return null;

  return (
    <div className="project-info">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="project-title">
              {project.name}
              <StatusBadge isActive={currentIsActive ?? project.isActive} />
            </h2>
          </div>

          {!editing ? (
            canEdit && (
              <ActionButton compact icon={<Pencil size={14} />} onClick={startEdit}>Editar</ActionButton>
            )
          ) : (
            <div className="edit-actions">
              <button className="btn-cancel" onClick={cancelEdit} disabled={saving}>
                <X size={14} /> Cancelar
              </button>
              <ActionButton compact icon={<Check size={14} />} onClick={handleSubmit(onSubmit)} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </ActionButton>
            </div>
          )}
        </div>

        {!editing ? (
          <div className="info-grid">
            <div className="info-field info-field--full">
              <span className="field-label">Descripción</span>
              <span className={`field-value ${!project.description ? "field-value--empty" : ""}`}>
                {project.description || "Sin descripción"}
              </span>
            </div>

            <div className="info-field">
              <span className="field-label">Fecha de inicio</span>
              <span className="field-value">{formatDate(project.startDate)}</span>
            </div>

            <div className="info-field">
              <span className="field-label">Cliente</span>
              <span className="client-badge">
                <Building2 size={14} />
                {project.clientName}
              </span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="edit-grid">
              <div className="form-group form-group--full">
                <label>Nombre del proyecto</label>
                <input
                  className={`edit-input ${errors.name ? "edit-input--error" : ""}`}
                  placeholder="Nombre del proyecto"
                  {...register("name", { required: "El nombre es obligatorio" })}
                />
                {errors.name && <span className="field-error">{errors.name.message}</span>}
              </div>

              <div className="form-group form-group--full">
                <label>Descripción</label>
                <textarea
                  className="edit-input"
                  placeholder="Descripción del proyecto"
                  {...register("description")}
                />
              </div>

              <div className="form-group">
                <label>Fecha de inicio</label>
                <input
                  type="date"
                  className={`edit-input ${errors.startDate ? "edit-input--error" : ""}`}
                  {...register("startDate", { required: "La fecha es obligatoria" })}
                />
                {errors.startDate && <span className="field-error">{errors.startDate.message}</span>}
              </div>

              <div className="form-group">
                <label>Cliente</label>
                {isAdmin ? (
                  <>
                    <select
                      className={`edit-select ${errors.clientId ? "edit-input--error" : ""}`}
                      {...register("clientId", { required: "El cliente es obligatorio" })}
                    >
                      <option value="">Selecciona un cliente</option>
                      {clients.map((client) => (
                        <option key={client.id} value={client.id}>{client.name}</option>
                      ))}
                    </select>
                    {errors.clientId && <span className="field-error">{errors.clientId.message}</span>}
                  </>
                ) : (
                  <span className="client-badge">
                    <Building2 size={14} />
                    {project.clientName}
                  </span>
                )}
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
