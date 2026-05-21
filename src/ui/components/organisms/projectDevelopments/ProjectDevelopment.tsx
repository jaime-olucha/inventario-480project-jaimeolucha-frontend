import { Check, Code2, ExternalLink, GitBranch, LayersIcon, Pencil, Plus, Settings, ShieldAlert, Trash2, X } from "lucide-react";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { MenuOptions } from "@/ui/components/organisms/menuOptions/MenuOptions";
import { ManageTechnologiesModal } from "./ManageTechnologiesModal";
import { useProjectDevelopment } from "./useProjectDevelopment";
import type { DevForm } from "./useProjectDevelopment";
import type { Environment } from "@/domain/value-objects/Environment";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";
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

interface ProjectDevelopmentProps {
  canEdit?: boolean;
}

export const ProjectDevelopment = ({ canEdit = false }: ProjectDevelopmentProps) => {
  const {
    developments, technologies, refreshTechnologies,
    loading, saving, error,
    toast, showToast, closeToast,
    showForm, editingDev,
    register, errors,
    openAddForm, openEditForm, closeForm, handleSubmitForm,
    devToDelete, setDevToDelete, handleDelete,
    showTechModal, openTechModal, closeTechModal,
  } = useProjectDevelopment();

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
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

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
          onClose={closeTechModal}
          onChanged={refreshTechnologies}
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
              <button type="button" className="btn-secondary" onClick={openTechModal} disabled={saving}>
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
                      <label key={env} className="dev-form-env-row">
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
        {!editingDev && (developments.length === 0 ? (
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
                        <MenuOptions
                          disabled={saving}
                          items={[
                            {
                              label: "Editar",
                              icon: <Pencil size={14} />,
                              onClick: () => openEditForm(dev),
                            },
                            {
                              label: "Eliminar",
                              icon: <Trash2 size={14} />,
                              variant: "danger",
                              onClick: () => setDevToDelete(dev),
                            },
                          ]}
                        />
                      </div>
                    )}
                  </div>

                  {dev.description && (
                    <p className="dev-card__description">{dev.description}</p>
                  )}

                  {dev.urlRepository && (
                    <a href={dev.urlRepository} target="_blank" rel="noreferrer" className="dev-card__repo">
                      <GitBranch size={14} />
                      <span className="dev-card__repo-url">{dev.urlRepository}</span>
                      <ExternalLink size={12} className="dev-card__repo-icon" />
                    </a>
                  )}

                  <div className="dev-card__envs">
                    {ENV_ORDER.map((env) => {
                      const url = linksByEnv[env];
                      if (!url) return null;
                      return (
                        <a key={env} href={url} target="_blank" rel="noreferrer" className="dev-card__env-row">
                          <span className={`env-badge ${ENV_CLASS[env]}`}>{ENV_LABEL[env]}</span>
                          <span className="dev-card__env-url">{url}</span>
                          <ExternalLink size={11} className="dev-card__env-icon" />
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
        ))}
      </div>
    </section>
  );
};
