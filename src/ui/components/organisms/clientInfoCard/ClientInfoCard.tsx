import { useState, useEffect, useCallback } from "react";
import { Building2, Edit2, FolderKanban, ListTree, Save, X } from "lucide-react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { ManageSectorsModal } from "@/ui/pages/Client/ClientPage/ManageSectorsModal";
import { ContactDetail } from "@/ui/pages/Client/ClientDetailPage/ContactDetail/ContactDetail";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import type { Client } from "@/domain/models/Client/Client";
import type { Sector } from "@/domain/models/Client/Sector";
import type { UpdateClientRequest } from "@/domain/models/Client/UpdateClientRequest";
import type { EntityId } from "@/domain/value-objects/EntityId";
import "./ClientInfoCard.scss";

interface ClientInfoCardProps {
  clientId: EntityId;
  isAdmin: boolean;
  onToast: (message: string, type: "success" | "error") => void;
  onClientLoaded?: (client: Client) => void;
}

export const ClientInfoCard = ({ clientId, isAdmin, onToast, onClientLoaded }: ClientInfoCardProps) => {
  const { client: clientRepo, sector: sectorRepo } = useRepositories();
  const [client, setClient] = useState<Client | null>(null);
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateClientRequest>({ name: "", isActive: true, sectorId: "" as EntityId });
  const [saving, setSaving] = useState(false);
  const [isManageSectorsOpen, setIsManageSectorsOpen] = useState(false);

  useEffect(() => {
    clientRepo.getById(clientId).then((loaded) => {
      setClient(loaded);
      onClientLoaded?.(loaded);
    });
  }, [clientId, clientRepo, onClientLoaded]);

  const refreshSectors = useCallback(async () => {
    try {
      setSectors(await sectorRepo.getAll());
    } catch {
      onToast("Error al refrescar sectores", "error");
    }
  }, [sectorRepo, onToast]);

  const handleEditClick = async () => {
    if (!client) return;
    try {
      setSectors(await sectorRepo.getAll());
      setEditData({ name: client.name, isActive: client.isActive, sectorId: client.sectorId });
      setIsEditing(true);
    } catch {
      onToast("Error al cargar sectores", "error");
    }
  };

  const handleSave = async () => {
    if (!client) return;
    setSaving(true);
    try {
      await clientRepo.putClient(clientId, editData);
      const selectedSector = sectors.find((s) => s.id === editData.sectorId);
      setClient((prev) => prev ? { ...prev, ...editData, sectorName: selectedSector?.name ?? prev.sectorName } : prev);
      onToast("Información actualizada correctamente", "success");
      setIsEditing(false);
    } catch (err) {
      onToast(getErrorMessage(err, "No se pudo guardar la información del cliente."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  if (!client) return null;

  return (
    <article className="client-info-card">
      {isManageSectorsOpen && (
        <ManageSectorsModal
          onClose={() => setIsManageSectorsOpen(false)}
          onSectorsChanged={refreshSectors}
          onSuccess={(msg) => onToast(msg, "success")}
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
            <button type="button" className="btn-cancel" onClick={() => setIsEditing(false)}>
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
                    <button type="button" className="btn-inline-action" onClick={() => setIsManageSectorsOpen(true)}>
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
        <ContactDetail clientId={clientId} isAdmin={isAdmin} onToast={onToast} />
      )}
    </article>
  );
};
