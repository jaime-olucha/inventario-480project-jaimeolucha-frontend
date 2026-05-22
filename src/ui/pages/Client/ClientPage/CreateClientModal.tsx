import { X, Building2, ListTree } from "lucide-react";
import { Controller } from "react-hook-form";
import { FilterSelect } from "@/ui/components/organisms/filterSelect/FilterSelect";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ManageSectorsModal } from "./ManageSectorsModal";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { useCreateClientModal } from "./useCreateClientModal";
import type { CreateClientRequest } from "@/domain/models/Client/CreateClientRequest";
import "./CreateClientModal.scss";

interface Props {
  onClose: () => void;
  onSubmit: (data: CreateClientRequest) => Promise<void>;
}

export const CreateClientModal = ({ onClose, onSubmit }: Props) => {
  const {
    serverError, sectorOptions, form,
    isManageSectorsOpen, openManageSectors, closeManageSectors,
    toast, showToast, closeToast,
    refreshSectors, handleCreate,
  } = useCreateClientModal({ onSubmit, onClose });

  const { register, handleSubmit: _, control, formState: { errors, isSubmitting } } = form;

  return (
    <div className="modal-overlay" onClick={onClose}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}
      <div className="modal" onClick={(event) => event.stopPropagation()}>
        <div className="modal_header">
          <h2><Building2 className="iconHeader" /> Nuevo Cliente</h2>
          <button type="button" className="modal_close" onClick={onClose}><X size={20} /></button>
        </div>

        {isManageSectorsOpen && (
          <ManageSectorsModal
            onClose={closeManageSectors}
            onSectorsChanged={refreshSectors}
            onSuccess={(msg) => showToast(msg, "success")}
          />
        )}

        <form className="modal_form" onSubmit={handleCreate}>
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
                  <button type="button" className="btn-inline-action" onClick={openManageSectors}>
                    <ListTree size={12} /> Gestionar Sectores
                  </button>
                </div>
                <FilterSelect
                  label=""
                  value={field.value ?? ""}
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
