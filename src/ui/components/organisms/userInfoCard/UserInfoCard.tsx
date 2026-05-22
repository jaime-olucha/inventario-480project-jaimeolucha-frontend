import { Edit2, Lock, Mail, Save, X } from "lucide-react";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import type { User } from "@/domain/models/User/User";
import type { UpdateUserRequest } from "@/domain/models/User/UpdateUserRequest";
import { LogoUser } from "@/ui/components/atoms/logoUser/LogoUser";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";

interface UserInfoCardProps {
  user: User | undefined;
  isAdmin: boolean;
  isMyProfile: boolean;
  isEditing: boolean;
  editData: UpdateUserRequest;
  loadingPatch: boolean;
  onEditClick: () => void;
  onSave: () => Promise<void>;
  onCancelEdit: () => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRoleToggle: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangePasswordClick: () => void;
  onAdminChangePasswordClick: () => void;
}

export const UserInfoCard = ({
  user,
  isAdmin,
  isMyProfile,
  isEditing,
  editData,
  loadingPatch,
  onEditClick,
  onSave,
  onCancelEdit,
  onInputChange,
  onRoleToggle,
  onChangePasswordClick,
  onAdminChangePasswordClick,
}: UserInfoCardProps) => {
  return (
    <article className="card profile-card">
      <div className="profile-card_top">
        <span className="section-label">Información Personal</span>

        {!isEditing && (
          <div className="btn-group">
            {isAdmin && <ActionButton compact icon={<Edit2 size={14} />} onClick={onEditClick}>Editar</ActionButton>}
            {isMyProfile && (
              <ActionButton compact icon={<Lock size={14} />} onClick={onChangePasswordClick}>
                Cambiar Contraseña
              </ActionButton>
            )}
            {isAdmin && !isMyProfile && (
              <ActionButton compact icon={<Lock size={14} />} onClick={onAdminChangePasswordClick}>
                Cambiar Contraseña
              </ActionButton>
            )}
          </div>
        )}

        {isEditing && (
          <div className="edit-actions">
            <ActionButton compact icon={<Save size={16} />} onClick={onSave} disabled={loadingPatch}>
              {loadingPatch ? "Guardando..." : "Guardar"}
            </ActionButton>
            <button className="btn-cancel" onClick={onCancelEdit}>
              <X size={16} /> Cancelar
            </button>
          </div>
        )}
      </div>

      <div className="profile-card_body">
        <LogoUser user={user} className="logo-user" />

        {!isEditing && (
          <div className="card-user_info">
            <h3>{user?.name} {user?.surname}</h3>
            <p className="user-email">
              <Mail size={13} className="iconSvg" />
              {user?.email}
            </p>
          </div>
        )}

        {isEditing && (
          <div className="edit-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Nombre</label>
                <input id="name" name="name" type="text" value={editData.name} onChange={onInputChange} className="edit-input" />
              </div>
              <div className="form-group">
                <label htmlFor="surname">Apellido</label>
                <input id="surname" name="surname" type="text" value={editData.surname} onChange={onInputChange} className="edit-input" />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Correo Corporativo</label>
                <input id="email" name="email" type="email" value={editData.email} onChange={onInputChange} className="edit-input" />
              </div>
              {!isMyProfile && (
                <div className="form-group checkbox-group">
                  <span className="form-label">Rol de Usuario</span>
                  <div className="checkbox-wrapper">
                    <input
                      id="isAdmin"
                      name="isAdmin"
                      type="checkbox"
                      checked={editData.role === SYSTEM_ROLES.ADMIN}
                      onChange={onRoleToggle}
                      className="edit-checkbox"
                    />
                    <label htmlFor="isAdmin">Administrador</label>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
};
