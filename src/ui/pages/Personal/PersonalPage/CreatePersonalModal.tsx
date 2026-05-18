import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, UserPlus } from "lucide-react";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import type { CreateUserRequest } from "@/domain/models/User/CreateUserRequest";
import { ActionButton } from "@/ui/components/molecules/actionButton/ActionButton";
import "./CreatePersonalModal.scss";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  surname: z.string().min(1, "Los apellidos son obligatorios"),
  email: z.email("Email no válido"),
  password: z.string().min(8, "Mínimo 8 caracteres"),
  confirmPassword: z.string(),
  role: z.enum([SYSTEM_ROLES.ADMIN, SYSTEM_ROLES.EMPLOYEE]),

}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],

}).transform(({ confirmPassword: _, ...rest }) => rest);

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

interface Props {
  onClose: () => void;
  onSubmit: (data: CreateUserRequest) => Promise<void>;
  existingEmails: string[];
}

export const CreatePersonalModal = ({ onClose, onSubmit, existingEmails }: Props) => {

  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { role: SYSTEM_ROLES.EMPLOYEE },
  });

  const handleCreate = async (data: FormOutput) => {

    if (existingEmails.includes(data.email)) {
      setError("email", { message: "Este email ya está en uso" });
      return;
    }


    try {
      await onSubmit(data);
      onClose();

    } catch {
      setError("email", { message: "Este email ya está en uso" });
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal_header">
          <h2><UserPlus className="iconHeader" /> Nuevo Personal</h2>
          <button type="button" className="modal_close" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="modal_form" onSubmit={handleSubmit(handleCreate)}>
          <div className="form_row">
            <div className="form_field">
              <label htmlFor="name">Nombre</label>
              <input id="name" type="text" {...register("name")} />
              {errors.name && <span className="form_error">{errors.name.message}</span>}
            </div>
            <div className="form_field">
              <label htmlFor="surname">Apellidos</label>
              <input id="surname" type="text" {...register("surname")} />
              {errors.surname && <span className="form_error">{errors.surname.message}</span>}
            </div>
          </div>

          <div className="form_field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" {...register("email")} />
            {errors.email && <span className="form_error">{errors.email.message}</span>}
          </div>

          <div className="form_row">
            <div className="form_field">
              <label htmlFor="password">Contraseña</label>
              <input id="password" type="password" {...register("password")} />
              {errors.password && <span className="form_error">{errors.password.message}</span>}
            </div>
            <div className="form_field">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input id="confirmPassword" type="password" {...register("confirmPassword")} />
              {errors.confirmPassword && <span className="form_error">{errors.confirmPassword.message}</span>}
            </div>
          </div>

          <div className="form_field">
            <label htmlFor="role">Rol</label>
            <select id="role" {...register("role")}>
              <option value={SYSTEM_ROLES.EMPLOYEE}>Empleado</option>
              <option value={SYSTEM_ROLES.ADMIN}>Administrador</option>
            </select>
            {errors.role && <span className="form_error">{errors.role.message}</span>}
          </div>

          <div className="modal_actions">
            <button type="button" className="btn_secondary" onClick={onClose}>Cancelar</button>
            <ActionButton type="submit" compact disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear"}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};
