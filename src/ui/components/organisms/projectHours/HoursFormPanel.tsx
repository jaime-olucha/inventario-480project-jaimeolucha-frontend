import { CalendarDays, Check, Clock, MessageSquare, X } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import type { EntryForm } from "./useProjectHours";

interface HoursFormPanelProps {
  addForm: UseFormReturn<EntryForm>;
  saving: boolean;
  onClose: () => void;
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
}

export const HoursFormPanel = ({ addForm, saving, onClose, onSubmit }: HoursFormPanelProps) => (
  <div className="hours-form-panel">
    <div className="team-form-header">
      <div>
        <h3>Nueva imputación</h3>
        <p>Introduce la fecha, horas y un comentario opcional.</p>
      </div>
      <button type="button" className="icon-button" onClick={onClose} disabled={saving} aria-label="Cerrar">
        <X size={18} />
      </button>
    </div>

    <form className="hours-form-grid" onSubmit={onSubmit}>
      <label>
        Fecha
        <div className="input-with-icon">
          <CalendarDays size={15} />
          <input type="date" disabled={saving} {...addForm.register("date")} />
        </div>
        {addForm.formState.errors.date && (
          <span className="field-error">{addForm.formState.errors.date.message}</span>
        )}
      </label>

      <label>
        Horas
        <div className="input-with-icon">
          <Clock size={15} />
          <input type="number" min="0.25" step="0.25" placeholder="Ej. 7.5" disabled={saving} {...addForm.register("hours")} />
        </div>
        {addForm.formState.errors.hours && (
          <span className="field-error">{addForm.formState.errors.hours.message}</span>
        )}
      </label>

      <label className="hours-form-comment">
        Comentario
        <div className="input-with-icon">
          <MessageSquare size={15} />
          <input type="text" placeholder="Descripción del trabajo realizado" disabled={saving} {...addForm.register("comment")} />
        </div>
      </label>

      <div className="team-form-actions">
        <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
          <X size={16} /> Cancelar
        </button>
        <ActionButton type="submit" icon={<Check size={16} />} disabled={saving}>
          {saving ? "Guardando..." : "Guardar"}
        </ActionButton>
      </div>
    </form>
  </div>
);
