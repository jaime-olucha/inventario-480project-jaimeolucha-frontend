import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Lock } from "lucide-react";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";

const schema = z.object({
  newPassword: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type FormData = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSubmit: (newPassword: string) => Promise<void>;
}

export const AdminPasswordModal = ({ onClose, onSubmit }: Props) => {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const handleSave = async (data: FormData) => {
    await onSubmit(data.newPassword);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal_header">
          <h2><Lock className="iconHeader" /> Cambiar contraseña</h2>
          <button type="button" className="modal_close" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="modal_form" onSubmit={handleSubmit(handleSave)}>
          <div className="form_field">
            <label htmlFor="newPassword">Nueva contraseña</label>
            <input id="newPassword" type="password" {...register("newPassword")} />
            {errors.newPassword && <span className="form_error">{errors.newPassword.message}</span>}
          </div>

          <div className="form_field">
            <label htmlFor="confirmPassword">Confirmar nueva contraseña</label>
            <input id="confirmPassword" type="password" {...register("confirmPassword")} />
            {errors.confirmPassword && <span className="form_error">{errors.confirmPassword.message}</span>}
          </div>

          <div className="modal_actions">
            <button type="button" className="btn_secondary" onClick={onClose}>Cancelar</button>
            <ActionButton type="submit" compact disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Cambiar contraseña"}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};
