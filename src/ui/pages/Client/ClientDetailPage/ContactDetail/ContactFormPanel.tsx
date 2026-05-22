import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import type { UseFormReturn } from "react-hook-form";
import type { ContactForm } from "./contactSchema";
import type { EntityId } from "@/domain/value-objects/EntityId";

interface ContactFormPanelProps {
  form: UseFormReturn<ContactForm>;
  editingContactId: EntityId | null;
  loadingContact: boolean;
  onSave: (e?: React.BaseSyntheticEvent) => Promise<void>;
  onCancel: () => void;
}

export const ContactFormPanel = ({ form, editingContactId, loadingContact, onSave, onCancel }: ContactFormPanelProps) => {
  const { register, formState: { errors } } = form;

  return (
    <form className="contact-form" onSubmit={onSave}>
      <div className="contact-form_grid">
        <div className="form-group">
          <label htmlFor="contactFullName">Nombre</label>
          <input
            id="contactFullName"
            className={`edit-input ${errors.fullName ? "edit-input--error" : ""}`}
            {...register("fullName")}
          />
          {errors.fullName && <span className="field-error">{errors.fullName.message}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="contactPhone">Teléfono</label>
          <input id="contactPhone" className="edit-input" {...register("phone")} />
        </div>

        <div className="form-group">
          <label htmlFor="contactEmail">Email</label>
          <input
            id="contactEmail"
            type="email"
            className={`edit-input ${errors.email ? "edit-input--error" : ""}`}
            {...register("email")}
          />
          {errors.email && <span className="field-error">{errors.email.message}</span>}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="contactNote">Nota</label>
        <textarea id="contactNote" className="edit-input contact-textarea" {...register("note")} />
      </div>

      <div className="contact-form_footer">
        <label className="contact-checkbox">
          <input type="checkbox" {...register("isMain")} />
          Contacto principal
        </label>

        <div className="contact-form_actions">
          <button type="button" className="btn-cancel-contact" onClick={onCancel} disabled={loadingContact}>
            Cancelar
          </button>
          <ActionButton type="submit" compact disabled={loadingContact}>
            {loadingContact ? "Guardando..." : editingContactId ? "Guardar cambios" : "Crear contacto"}
          </ActionButton>
        </div>
      </div>
    </form>
  );
};
