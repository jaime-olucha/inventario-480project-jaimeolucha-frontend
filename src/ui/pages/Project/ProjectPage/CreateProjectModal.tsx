import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, FolderPlus } from "lucide-react";
import Select from "react-select";
import type { CreateProjectRequest } from "@/domain/models/Project/CreateProjectRequest";
import { useEffect, useState } from "react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import type { Client } from "@/domain/models/Client/Client";
import { ActionButton } from "@/ui/components/molecules/actionButton/ActionButton";
import "./CreateProjectModal.scss";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  description: z.string().min(1, "La descripción es obligatoria"),
  startDate: z.string().optional().or(z.literal("")),
  clientId: z.string().min(1, "Debes seleccionar un cliente"),
});

type FormInput = z.input<typeof schema>;

interface Props {
  onClose: () => void;
  onSubmit: (data: CreateProjectRequest) => Promise<void>;
}

export const CreateProjectModal = ({ onClose, onSubmit }: Props) => {
  const { client: clientRepo } = useRepositories();
  const [clients, setClients] = useState<Client[]>([]);

  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormInput>({
    resolver: zodResolver(schema),
    defaultValues: {
      startDate: "",
      clientId: ""
    }
  });

  useEffect(() => {
    const loadClients = async () => {
      const result = await clientRepo.getAll(1, 1000);
      setClients(result);
    };
    loadClients();
  }, [clientRepo]);

  const clientOptions = clients.map(client => ({
    value: client.id,
    label: client.name
  }));

  const handleCreate = async (data: FormInput) => {
    try {
      await onSubmit(data as CreateProjectRequest);
      onClose();
    } catch (error) {
      console.error("Error al crear el proyecto:", error);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal_header">
          <h2><FolderPlus className="iconHeader" />Nuevo Proyecto</h2>
          <button type="button" className="modal_close" onClick={onClose}><X size={20} /></button>
        </div>

        <form className="modal_form" onSubmit={handleSubmit(handleCreate)}>
          <div className="form_field">
            <label htmlFor="name">Nombre del Proyecto</label>
            <input id="name" type="text" {...register("name")} placeholder="Ej. Inventario IT" />
            {errors.name && <span className="form_error">{errors.name.message}</span>}
          </div>

          <div className="form_field">
            <label htmlFor="description">Descripción</label>
            <textarea id="description" {...register("description")} placeholder="Describe el propósito del proyecto..." />
            {errors.description && <span className="form_error">{errors.description.message}</span>}
          </div>

          <div className="form_row">
            <div className="form_field">
              <label htmlFor="startDate">Fecha de Inicio</label>
              <input id="startDate" type="date" {...register("startDate")} />
              {errors.startDate && <span className="form_error">{errors.startDate.message}</span>}
            </div>

            <div className="form_field">
              <label htmlFor="clientId">Cliente</label>
              <Controller
                name="clientId"
                control={control}
                render={({ field: { onChange, value, ref } }) => (
                  <Select
                    ref={ref}
                    placeholder="Selecciona un cliente..."
                    options={clientOptions}
                    value={clientOptions.find(client => client.value === value)}
                    onChange={(val) => onChange(val?.value)}
                    isClearable
                    isSearchable
                    classNamePrefix="react-select"
                  />
                )}
              />
              {errors.clientId && <span className="form_error">{errors.clientId.message}</span>}
            </div>
          </div>

          <div className="modal_actions">
            <button type="button" className="btn_secondary" onClick={onClose}>Cancelar</button>
            <ActionButton type="submit" compact disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear Proyecto"}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};
