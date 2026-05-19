import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { X, Plus, Edit2, Trash2, Save, ListTree, Loader2, AlertCircle } from "lucide-react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import type { Sector } from "@/domain/models/Client/Sector";
import type { EntityId } from "@/domain/value-objects/EntityId";
import "./ManageSectorsModal.scss";

interface ManageSectorsModalProps {
  onClose: () => void;
  onSectorsChanged: () => void;
  onSuccess?: (message: string) => void;
}

export const ManageSectorsModal = ({ onClose, onSectorsChanged, onSuccess }: ManageSectorsModalProps) => {
  const { sector: sectorRepo } = useRepositories();
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<EntityId | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [sectorToDelete, setSectorToDelete] = useState<Sector | null>(null);

  const addForm = useForm<{ name: string }>({ defaultValues: { name: "" } });
  const editForm = useForm<{ name: string }>({ defaultValues: { name: "" } });

  const fetchSectors = async () => {
    setLoading(true);
    try {
      const data = await sectorRepo.getAll();
      setSectors(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSectors();
  }, []);

  const handleCreate = addForm.handleSubmit(async ({ name }) => {
    setActionLoading(true);
    try {
      await sectorRepo.create(name.trim());
      addForm.reset({ name: "" });
      await fetchSectors();
      onSectorsChanged();
      onSuccess?.("Sector creado correctamente");
      onClose();
    } catch (error) {
      setToast({ message: getErrorMessage(error, "No se pudo crear el sector."), type: "error" });
    } finally {
      setActionLoading(false);
    }
  });

  const handleUpdate = (id: EntityId) => editForm.handleSubmit(async ({ name }) => {
    setActionLoading(true);
    try {
      await sectorRepo.update(id, name.trim());
      setEditingId(null);
      await fetchSectors();
      onSectorsChanged();
      onSuccess?.("Sector actualizado correctamente");
      onClose();
    } catch (error) {
      setToast({ message: getErrorMessage(error, "No se pudo actualizar el sector."), type: "error" });
    } finally {
      setActionLoading(false);
    }
  })();

  const handleDeleteClick = (sector: Sector) => {
    setSectorToDelete(sector);
  };

  const handleConfirmDelete = async () => {
    if (!sectorToDelete) return;
    setActionLoading(true);
    try {
      await sectorRepo.delete(sectorToDelete.id);
      await fetchSectors();
      onSectorsChanged();
      onSuccess?.("Sector eliminado correctamente");
      onClose();
    } catch (error) {
      setToast({ message: getErrorMessage(error, "No se pudo eliminar el sector."), type: "error" });
    } finally {
      setActionLoading(false);
      setSectorToDelete(null);
    }
  };

  const startEditing = (sector: Sector) => {
    setEditingId(sector.id);
    editForm.reset({ name: sector.name });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      {sectorToDelete && (
        <ConfirmModal
          title="Eliminar Sector"
          message={`¿Estás seguro de que deseas eliminar el sector "${sectorToDelete.name}"? Esta acción no se puede deshacer.`}
          onConfirm={handleConfirmDelete}
          onCancel={() => setSectorToDelete(null)}
          loading={actionLoading}
        />
      )}

      <div className="modal manage-sectors-modal" onClick={e => e.stopPropagation()}>
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
            <button className="btn-add" onClick={handleCreate} disabled={actionLoading || !addForm.watch("name")?.trim()}>
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
                {sectors.map(sector => (
                  <li key={sector.id} className="sector-item">
                    {editingId === sector.id ? (
                      <div className="edit-mode">
                        <input
                          type="text"
                          autoFocus
                          {...editForm.register("name", { required: true })}
                        />
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
