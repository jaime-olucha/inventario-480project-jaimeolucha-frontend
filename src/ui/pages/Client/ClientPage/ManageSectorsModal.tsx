import { X, Plus, Edit2, Trash2, Save, ListTree, Loader2, AlertCircle } from "lucide-react";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { useManageSectorsModal } from "./useManageSectorsModal";
import "./ManageSectorsModal.scss";

interface ManageSectorsModalProps {
  onClose: () => void;
  onSectorsChanged: () => void;
  onSuccess?: (message: string) => void;
}

export const ManageSectorsModal = ({ onClose, onSectorsChanged, onSuccess }: ManageSectorsModalProps) => {
  const {
    sectors, loading, actionLoading, editingId, sectorToDelete,
    addForm, editForm,
    toast, closeToast,
    setEditingId, setSectorToDelete, startEditing,
    handleCreate, handleUpdate, handleDeleteClick, handleConfirmDelete,
  } = useManageSectorsModal({ onClose, onSectorsChanged, onSuccess });

  return (
    <div role="presentation" className="modal-overlay" onClick={onClose}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {sectorToDelete && (
        <ConfirmModal
          title="Eliminar Sector"
          message={`¿Estás seguro de que deseas eliminar el sector "${sectorToDelete.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setSectorToDelete(null)}
          loading={actionLoading}
        />
      )}

      <div role="dialog" aria-modal="true" aria-label="Gestionar Sectores" className="modal manage-sectors-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal_header">
          <h2><ListTree className="iconHeader" /> Gestionar Sectores</h2>
          <button type="button" className="modal_close" onClick={onClose}><X size={20} /></button>
        </div>

        <div className="modal_body">
          <div className="global-warning">
            <AlertCircle size={16} />
            <p>Los cambios en los sectores son <strong>inmediatos y globales</strong>. Se aplicarán aunque canceles la creación del cliente.</p>
          </div>

          <div className="add-sector-form">
            <input
              type="text"
              placeholder="Nuevo sector..."
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

          <div className="sectors-list-container">
            {loading ? (
              <div className="loading-state">
                <Loader2 className="spinner" />
                <p>Cargando sectores...</p>
              </div>
            ) : (
              <ul className="sectors-list">
                {sectors.map((sector) => (
                  <li key={sector.id} className="sector-item">
                    {editingId === sector.id ? (
                      <div className="edit-mode">
                        <input type="text" autoFocus {...editForm.register("name", { required: true })} />
                        <div className="item-actions">
                          <button className="btn-save" onClick={() => handleUpdate(sector.id)} disabled={actionLoading}>
                            <Save size={16} />
                          </button>
                          <button className="btn-cancel" onClick={() => setEditingId(null)}>
                            <X size={16} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="view-mode">
                        <span className="sector-name">{sector.name}</span>
                        <div className="item-actions">
                          <button className="btn-edit" onClick={() => startEditing(sector)}>
                            <Edit2 size={16} />
                          </button>
                          <button className="btn-delete" onClick={() => handleDeleteClick(sector)}>
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
