import { AlertCircle, Edit2, Loader2, Plus, Save, Settings, Trash2, X } from "lucide-react";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { useManageTechnologiesModal } from "./useManageTechnologiesModal";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";
import "./ManageTechnologiesModal.scss";

interface ManageTechnologiesModalProps {
  onClose: () => void;
  onChanged: () => void;
  onSuccess?: (message: string) => void;
}

export const ManageTechnologiesModal = ({ onClose, onChanged, onSuccess }: ManageTechnologiesModalProps) => {
  const {
    technologies, loading, actionLoading, editingId, techToDelete,
    addForm, editForm,
    toast, closeToast,
    setEditingId, setTechToDelete, startEditing,
    handleCreate, handleUpdate, handleConfirmDelete,
  } = useManageTechnologiesModal({ onChanged, onSuccess });

  return (
    <div role="presentation" className="modal-overlay" onClick={onClose}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {techToDelete && (
        <ConfirmModal
          title="Eliminar tecnología"
          message={`¿Seguro que deseas eliminar "${techToDelete.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setTechToDelete(null)}
          loading={actionLoading}
        />
      )}

      <div role="dialog" aria-modal="true" aria-label="Gestionar Tecnologías" className="modal manage-technologies-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal_header">
          <h2><Settings className="iconHeader" /> Gestionar Tecnologías</h2>
          <button type="button" className="modal_close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal_body">
          <div className="global-warning">
            <AlertCircle size={16} />
            <p>Los cambios en las tecnologías son <strong>inmediatos y globales</strong>.</p>
          </div>

          <div className="add-item-form">
            <input
              type="text"
              placeholder="Nueva tecnología..."
              disabled={actionLoading}
              {...addForm.register("name", { required: true })}
            />
            <button
              className="btn-add"
              onClick={handleCreate}
              disabled={actionLoading || !addForm.watch("name")?.trim()}
            >
              <Plus size={18} /> Añadir
            </button>
          </div>

          <div className="items-list-container">
            {loading ? (
              <div className="loading-state">
                <Loader2 className="spinner" />
                <p>Cargando tecnologías...</p>
              </div>
            ) : (
              <ul className="items-list">
                {technologies.map((tech) => (
                  <li key={tech.id} className="item">
                    {editingId === tech.id ? (
                      <div className="edit-mode">
                        <input type="text" autoFocus {...editForm.register("name", { required: true })} />
                        <div className="item-actions">
                          <button className="btn-save" onClick={() => handleUpdate(tech.id)} disabled={actionLoading}>
                            <Save size={16} />
                          </button>
                          <button className="btn-cancel" onClick={() => setEditingId(null)}>
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="view-mode">
                        <span className="item-name">{tech.name}</span>
                        <div className="item-actions">
                          <button className="btn-edit" onClick={() => startEditing(tech)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-delete" onClick={() => setTechToDelete(tech)}>
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
