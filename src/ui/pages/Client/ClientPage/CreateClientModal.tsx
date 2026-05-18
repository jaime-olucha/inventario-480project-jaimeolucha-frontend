import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, Building2, ListTree } from "lucide-react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { FilterSelect } from "@/ui/components/molecules/filterSelect/FilterSelect";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ManageSectorsModal } from "./ManageSectorsModal";
import { ActionButton } from "@/ui/components/molecules/actionButton/ActionButton";
import type { Sector } from "@/domain/models/Client/Sector";
import type { CreateClientRequest } from "@/domain/models/Client/CreateClientRequest";
import "./CreateClientModal.scss";

const schema = z.object({
  name: z.string().min(1, "El nombre es obligatorio"),
  sectorId: z.string().min(1, "El sector es obligatorio"),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  onClose: () => void;
  onSubmit: (data: CreateClientRequest) => Promise<void>;
}

export const CreateClientModal = ({ onClose, onSubmit }: Props) => {
  const { sector: sectorRepo } = useRepositories();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isManageSectorsOpen, setIsManageSectorsOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const { register, handleSubmit, control, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const fetchSectors = () => {
    sectorRepo.getAll().then(setSectors);
  };

  useEffect(() => {
    fetchSectors();
  }, [sectorRepo]);

  const handleCreate = async (data: FormValues) => {
    setServerError(null);
    try {
      await onSubmit({ name: data.name, sectorId: data.sectorId });
      onClose();
    } catch (error) {
      if (error instanceof Error && error.message.includes('409')) {
        setServerError('Ya existe un cliente con este nombre.');
      } else {
        setServerError('Error al crear el cliente. Inténtalo de nuevo.');
      }
    }
  };

  const sectorOptions = sectors.map(s => ({ value: String(s.id), label: s.name }));

  return (
    <div className="modal-overlay" onClick={onClose}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div className="modal" onClick={event => event.stopPropagation()}>
        <div className="modal_header">
          <h2><Building2 className="iconHeader" /> Nuevo Cliente</h2>
          <button type="button" className="modal_close" onClick={onClose}><X size={20} /></button>
        </div>

        {isManageSectorsOpen && (
          <ManageSectorsModal 
            onClose={() => setIsManageSectorsOpen(false)} 
            onSectorsChanged={fetchSectors} 
            onSuccess={(msg) => setToast({ message: msg, type: "success" })}
          />
        )}

        <form className="modal_form" onSubmit={handleSubmit(handleCreate)}>
          {serverError && <p className="form_server_error">{serverError}</p>}

          <div className="form_field">
            <label htmlFor="name">Nombre del cliente</label>
            <input id="name" type="text" placeholder="Nombre de la empresa..." {...register("name")} />
            {errors.name && <span className="form_error">{errors.name.message}</span>}
          </div>

          <Controller
            name="sectorId"
            control={control}
            render={({ field }) => (
              <div className="form_field-with-action">
                <div className="field-header">
                  <label>Sector</label>
                  <button
                    type="button"
                    className="btn-inline-action"
                    onClick={() => setIsManageSectorsOpen(true)}
                  >
                    <ListTree size={12} /> Gestionar Sectores
                  </button>
                </div>
                <FilterSelect
                  label=""
                  value={field.value ?? ''}
                  options={sectorOptions}
                  onChange={field.onChange}
                />
              </div>
            )}
          />
          {errors.sectorId && <span className="form_error">{errors.sectorId.message}</span>}

          <div className="modal_actions">
            <button type="button" className="btn_secondary" onClick={onClose}>Cancelar</button>
            <ActionButton type="submit" compact disabled={isSubmitting}>
              {isSubmitting ? "Creando..." : "Crear cliente"}
            </ActionButton>
          </div>
        </form>
      </div>
    </div>
  );
};
