import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Pencil, X, Check, Building2 } from "lucide-react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import type { ProjectDetail } from "@/domain/models/Project/ProjectDetail";
import type { Client } from "@/domain/models/Client/Client";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { StatusBadge } from "@/ui/components/molecules/statusBadge/StatusBadge";
import { ActionButton } from "@/ui/components/molecules/actionButton/ActionButton";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import "./ProjectInfo.scss";
import type { UpdateProjectRequest } from "@/domain/models/Project/UpdateProjectRequest";

type EditForm = Omit<UpdateProjectRequest, 'isActive'>

function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", { day: "2-digit", month: "long", year: "numeric" });
}

function toInputDate(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}

interface ProjectInfoProps {
  isActive?: boolean;
}

export const ProjectInfo = ({ isActive: isActiveProp }: ProjectInfoProps) => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo, client: clientRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);
  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;

  const [project, setProject] = useState<ProjectDetail>();
  const canEdit = project?.permissions.canEdit ?? false;
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<EditForm>();

  const currentIsActive = isActiveProp !== undefined ? isActiveProp : project?.isActive;

  useEffect(() => {
    if (!id) return;

    const clientsPromise = isAdmin ? clientRepo.getAll(1, 100) : Promise.resolve([]);

    Promise.all([
      projectRepo.getById(id),
      clientsPromise,

    ]).then(([proj, cls]) => {
      setProject(proj);
      setClients(cls as Client[]);

    }).finally(() => setLoading(false));
  }, [id, isAdmin, projectRepo, clientRepo]);

  const startEdit = () => {
    if (!project) return;
    reset({
      name: project.name,
      description: project.description ?? "",
      startDate: toInputDate(project.startDate),
      clientId: project.clientId,
    });
    setEditing(true);
  };

  const cancelEdit = () => {
    setEditing(false);
  };

  const onSubmit = async (data: EditForm) => {
    if (!id || !project) return;
    setSaving(true);
    try {
      await projectRepo.putUser(id, {
        name: data.name,
        description: data.description,
        startDate: data.startDate,
        isActive: project.isActive,
        clientId: data.clientId,
      });

      const selectedClient = clients.find(client => client.id === data.clientId);
      setProject(prev => prev ? {
        ...prev,
        name: data.name,
        description: data.description,
        startDate: new Date(data.startDate),
        clientId: data.clientId,
        clientName: selectedClient?.name ?? prev.clientName,
      } : prev);

      setEditing(false);
      setToast({ message: "Proyecto actualizado correctamente.", type: "success" });
    } catch (err) {
      setToast({ message: getErrorMessage(err, "No se pudo guardar el proyecto."), type: "error" });
    } finally {
      setSaving(false);
    }
  };

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
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
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
              <ActionButton compact icon={<Check size={14} />} onClick={handleSubmit(onSubmit)} disabled={saving}>{saving ? "Guardando..." : "Guardar"}</ActionButton>
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
                      {clients.map(client => (
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


