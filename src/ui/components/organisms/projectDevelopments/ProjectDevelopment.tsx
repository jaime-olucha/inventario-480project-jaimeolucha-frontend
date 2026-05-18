import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Check, Code2, ExternalLink, GitBranch, LayersIcon, Pencil, Plus, Settings, ShieldAlert, Trash2, X } from "lucide-react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { ActionButton } from "@/ui/components/molecules/actionButton/ActionButton";
import { ConfirmModal } from "@/ui/components/molecules/confirmModal/ConfirmModal";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ManageTechnologiesModal } from "./ManageTechnologiesModal";
import type { Development } from "@/domain/models/Project/Development";
import type { Technology } from "@/domain/models/Project/Technology";
import type { Environment } from "@/domain/value-objects/Environment";
import type { EntityId } from "@/domain/value-objects/EntityId";
import "@/ui/components/molecules/confirmModal/ConfirmModal.scss";
import "./ProjectDevelopment.scss";

const ENV_ORDER: Environment[] = ["PRODUCTION", "PREPRODUCTION", "STAGE"];

const ENV_LABEL: Record<Environment, string> = {
  PRODUCTION: "Producción",
  PREPRODUCTION: "Preproducción",
  STAGE: "Stage",
};

const ENV_CLASS: Record<Environment, string> = {
  PRODUCTION: "env-badge--production",
  PREPRODUCTION: "env-badge--preproduction",
  STAGE: "env-badge--stage",
};

const devSchema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().optional(),
  technologyId: z.string().min(1, "Selecciona una tecnología"),
  urlRepository: z.string().url("Introduce una URL válida").or(z.literal("")),
  productionUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
  preproductionUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
  stageUrl: z.string().url("URL inválida").or(z.literal("")).optional(),
});

type DevForm = z.infer<typeof devSchema>;

const EMPTY_FORM: DevForm = {
  name: "",
  description: "",
  technologyId: "" as EntityId,
  urlRepository: "",
  productionUrl: "",
  preproductionUrl: "",
  stageUrl: "",
};

interface ProjectDevelopmentProps {
  canEdit?: boolean;
}

export const ProjectDevelopment = ({ canEdit = false }: ProjectDevelopmentProps) => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo, technology: technologyRepo } = useRepositories();

  const [developments, setDevelopments] = useState<Development[]>([]);
  const [technologies, setTechnologies] = useState<Technology[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingDev, setEditingDev] = useState<Development | null>(null);
  const [devToDelete, setDevToDelete] = useState<Development | null>(null);
  const [showTechModal, setShowTechModal] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<DevForm>({
    resolver: zodResolver(devSchema),
    defaultValues: EMPTY_FORM,
  });

  const showToast = (message: string, type: "success" | "error" = "error") =>
    setToast({ message, type });

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

  if (loading) {
    return (
      <section className="project-development">
        <div className="card">
          <div className="skeleton skeleton--title" style={{ marginBottom: "8px" }} />
          <div className="skeleton skeleton--short" style={{ marginBottom: "24px" }} />
          <div className="dev-grid">
            {[1, 2, 3].map((n) => <div key={n} className="skeleton skeleton--dev-card" />)}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="project-development">
        <div className="card empty-state empty-state--error">
          <ShieldAlert size={34} />
          <h2>No se pudo cargar</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="project-development">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {devToDelete && (
        <ConfirmModal
          title="Eliminar desarrollo"
          message={`¿Seguro que deseas eliminar "${devToDelete.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          loading={saving}
          onConfirm={handleDelete}
          onCancel={() => setDevToDelete(null)}
        />
      )}

      {showTechModal && (
        <ManageTechnologiesModal
          onClose={() => setShowTechModal(false)}
          onChanged={() => technologyRepo.getAll().then(setTechnologies)}
          onSuccess={(msg) => showToast(msg, "success")}
        />
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <span className="header_title">Desarrollos</span>
            <p className="project-subtitle">Repositorios y entornos del proyecto.</p>
          </div>
          {canEdit && (
            <div className="header-actions">
              <button type="button" className="btn-secondary" onClick={() => setShowTechModal(true)} disabled={saving}>
                <Settings size={15} /> Tecnologías
              </button>
              <ActionButton icon={<Plus size={16} />} onClick={openAddForm} disabled={saving || showForm}>
                Nuevo desarrollo
              </ActionButton>
            </div>
          )}
        </div>

        {showForm && (
          <div className="dev-form-panel">
            <div className="dev-form-header">
              <div>
                <h3>{editingDev ? "Editar desarrollo" : "Nuevo desarrollo"}</h3>
                <p>{editingDev ? "Modifica los datos y los entornos disponibles." : "Rellena los datos básicos del desarrollo."}</p>
              </div>
              <button type="button" className="icon-button" onClick={closeForm} disabled={saving} aria-label="Cerrar">
                <X size={18} />
              </button>
            </div>

            <div className="dev-form-grid">
              <label>
                Nombre *
                <input type="text" placeholder="Ej. Frontend, API, Backend..." disabled={saving} {...register("name")} />
                {errors.name && <span className="field-error">{errors.name.message}</span>}
              </label>

              <label>
                Tecnología *
                <select disabled={saving} {...register("technologyId")}>
                  <option value="">Selecciona una tecnología</option>
                  {technologies.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                {errors.technologyId && <span className="field-error">{errors.technologyId.message}</span>}
              </label>

              <label className="dev-form-full">
                Repositorio
                <input type="url" placeholder="https://github.com/org/repo" disabled={saving} {...register("urlRepository")} />
                {errors.urlRepository && <span className="field-error">{errors.urlRepository.message}</span>}
              </label>

              <label className="dev-form-full">
                Descripción
                <textarea rows={2} placeholder="Descripción del desarrollo..." disabled={saving} {...register("description")} />
              </label>

              {editingDev && (
                <>
                  <div className="dev-form-section-title dev-form-full">Entornos</div>
                  {ENV_ORDER.map((env) => {
                    const fieldKey = env === "PRODUCTION" ? "productionUrl" : env === "PREPRODUCTION" ? "preproductionUrl" : "stageUrl";
                    return (
                      <label key={env} className={`dev-form-env-row ${ENV_CLASS[env]}`}>
                        <span className={`env-badge ${ENV_CLASS[env]}`}>{ENV_LABEL[env]}</span>
                        <input
                          type="url"
                          placeholder={`https://...`}
                          disabled={saving}
                          {...register(fieldKey as keyof DevForm)}
                        />
                        {errors[fieldKey as keyof DevForm] && (
                          <span className="field-error">{errors[fieldKey as keyof DevForm]?.message}</span>
                        )}
                      </label>
                    );
                  })}
                </>
              )}
            </div>

            <div className="dev-form-actions">
              <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
                <X size={16} /> Cancelar
              </button>
              <ActionButton icon={<Check size={16} />} onClick={handleSubmitForm} disabled={saving}>
                {saving ? "Guardando..." : "Guardar"}
              </ActionButton>
            </div>
          </div>
        )}

        {developments.length === 0 ? (
          <div className="empty-state">
            <Code2 size={38} />
            <h3>Sin desarrollos</h3>
            <p>Cuando se registren desarrollos aparecerán aquí.</p>
          </div>
        ) : (
          <div className="dev-grid">
            {developments.map((dev) => {
              const linksByEnv = Object.fromEntries(dev.links.map((l) => [l.environment, l.url]));
              return (
                <article key={dev.id} className="dev-card">
                  <div className="dev-card__header">
                    <div className="dev-card__icon">
                      <LayersIcon size={20} />
                    </div>
                    <div className="dev-card__title-area">
                      <h3 className="dev-card__name">{dev.name}</h3>
                      <span className="tech-badge">{dev.technology.name}</span>
                    </div>
                    {canEdit && (
                      <div className="dev-card__actions">
                        <button type="button" className="icon-button" onClick={() => openEditForm(dev)} disabled={saving} aria-label="Editar">
                          <Pencil size={14} />
                        </button>
                        <button type="button" className="icon-button icon-button--danger" onClick={() => setDevToDelete(dev)} disabled={saving} aria-label="Eliminar">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </div>

                  {dev.description && (
                    <p className="dev-card__description">{dev.description}</p>
                  )}

                  {dev.urlRepository && (
                    <a href={dev.urlRepository} target="_blank" rel="noreferrer" className="dev-card__repo">
                      <GitBranch size={14} />
                      <span>Repositorio</span>
                      <ExternalLink size={12} className="dev-card__repo-icon" />
                    </a>
                  )}

                  <div className="dev-card__envs">
                    {ENV_ORDER.map((env) => {
                      const url = linksByEnv[env];
                      if (!url) return null;
                      return (
                        <a key={env} href={url} target="_blank" rel="noreferrer" className={`env-badge ${ENV_CLASS[env]}`}>
                          {ENV_LABEL[env]}
                          <ExternalLink size={11} />
                        </a>
                      );
                    })}
                    {dev.links.length === 0 && (
                      <span className="dev-card__no-envs">Sin entornos configurados</span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
