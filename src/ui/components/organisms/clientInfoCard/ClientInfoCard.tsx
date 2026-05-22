import { Building2, Edit2, FolderKanban, ListTree, Save, X } from "lucide-react";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ManageSectorsModal } from "@/ui/pages/Client/ClientPage/ManageSectorsModal";
import { ContactDetail } from "@/ui/pages/Client/ClientDetailPage/ContactDetail/ContactDetail";
import { useClientInfoCard } from "./useClientInfoCard";
import type { Client } from "@/domain/models/Client/Client";
import type { EntityId } from "@/domain/value-objects/EntityId";
import "./ClientInfoCard.scss";

interface ClientInfoCardProps {
  clientId: EntityId;
  onClientLoaded?: (client: Client) => void;
}

export const ClientInfoCard = ({ clientId, onClientLoaded }: ClientInfoCardProps) => {
  const {
    client, sectors, isEditing, editData, saving, isAdmin,
    isManageSectorsOpen, openManageSectors, closeManageSectors,
    toast, showToast, closeToast,
    refreshSectors, handleEditClick, handleSave, handleInputChange, cancelEdit,
  } = useClientInfoCard({ clientId, onClientLoaded });

  if (!client) return null;

  return (
    <article className="client-info-card">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {isManageSectorsOpen && (
        <ManageSectorsModal
          onClose={closeManageSectors}
          onSectorsChanged={refreshSectors}
          onSuccess={(msg) => showToast(msg, "success")}
        />
      )}

      <div className="client-info-card__header">
        <span className="header_title">Información del Cliente</span>

        {isAdmin && !isEditing && (
          <ActionButton compact icon={<Edit2 size={14} />} onClick={handleEditClick}>
            Editar
          </ActionButton>
        )}

        {isAdmin && isEditing && (
          <div className="client-info-card__edit-actions">
            <ActionButton compact icon={<Save size={16} />} onClick={handleSave} disabled={saving}>
              {saving ? "Guardando..." : "Guardar"}
            </ActionButton>
            <button type="button" className="btn-cancel" onClick={cancelEdit}>
              <X size={16} /> Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="client-info-card__body">
        <div className="client-info-card__info-row">
          <div className="client-info-card__logo">
            <Building2 size={32} />
          </div>

          {!isEditing ? (
            <div className="client-info-card__info">
              <h3>{client.name}</h3>
              <p className="client-info-card__sector">
                <FolderKanban size={13} />
                Sector: {client.sectorName}
              </p>
            </div>
          ) : (
            <div className="client-info-card__form">
              <div className="client-info-card__form-row">
                <div className="form-group">
                  <label htmlFor="cic-name">Nombre</label>
                  <input
                    id="cic-name"
                    name="name"
                    type="text"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>

                <div className="form-group">
                  <div className="field-header">
                    <label htmlFor="cic-sector">Sector</label>
                    <button type="button" className="btn-inline-action" onClick={openManageSectors}>
                      <ListTree size={12} /> Gestionar Sectores
                    </button>
                  </div>
                  <select
                    id="cic-sector"
                    name="sectorId"
                    value={editData.sectorId}
                    onChange={handleInputChange}
                    className="edit-input"
                  >
                    <option value="" disabled>Selecciona un sector</option>
                    {sectors.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {!isEditing && (
        <ContactDetail clientId={clientId} isAdmin={isAdmin} onToast={showToast} />
      )}
    </article>
  );
};
