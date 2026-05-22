import { Check, X } from "lucide-react";
import type { UseFormRegister, FieldErrors } from "react-hook-form";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { ENV_ORDER, ENV_LABEL, ENV_CLASS } from "./devEnvironments";
import type { DevForm } from "./useProjectDevelopment";
import type { Development } from "@/domain/models/Project/Development";
import type { Technology } from "@/domain/models/Project/Technology";

interface DevFormPanelProps {
  register: UseFormRegister<DevForm>;
  errors: FieldErrors<DevForm>;
  editingDev: Development | null;
  technologies: Technology[];
  saving: boolean;
  onClose: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export const DevFormPanel = ({
  register,
  errors,
  editingDev,
  technologies,
  saving,
  onClose,
  onSubmit,
}: DevFormPanelProps) => (
  <div className="dev-form-panel">
    <div className="dev-form-header">
      <div>
        <h3>{editingDev ? "Editar desarrollo" : "Nuevo desarrollo"}</h3>
        <p>{editingDev ? "Modifica los datos y los entornos disponibles." : "Rellena los datos básicos del desarrollo."}</p>
      </div>
      <button type="button" className="icon-button" onClick={onClose} disabled={saving} aria-label="Cerrar">
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
                  placeholder="https://..."
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
      <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
        <X size={16} /> Cancelar
      </button>
      <ActionButton icon={<Check size={16} />} onClick={onSubmit} disabled={saving}>
        {saving ? "Guardando..." : "Guardar"}
      </ActionButton>
    </div>
  </div>
);
