import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuthStore } from "@/infrastructure/store/auth.store";
import { useUserStore } from "@/infrastructure/store/user.store";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import type { User } from "@/domain/models/User/User";
import type { UserProject } from "@/domain/models/User/UserProject";
import type { UpdateUserRequest } from "@/domain/models/User/UpdateUserRequest";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { ROUTES } from "@/ui/routes/routes";
import { useToast } from "@/ui/hooks/useToast";
import { useModal } from "@/ui/hooks/useModal";
import { useEntityActions } from "@/ui/hooks/useEntityActions";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";

export function usePersonalDetailPage() {
  const { id } = useParams<{ id: EntityId }>();
  const navigate = useNavigate();
  const userStore = useUserStore((store) => store.user);
  const logout = useAuthStore((state) => state.logout);
  const { user: userRepo } = useRepositories();

  const { toast, showToast, closeToast } = useToast();
  const passwordModal = useModal();
  const adminPasswordModal = useModal();

  const [targetUser, setTargetUser] = useState<User>();
  const [projects, setProjects] = useState<UserProject[]>([]);

  const entityActions = useEntityActions({
    entityId: id,
    isActive: targetUser?.isActive,
    patchActive: (userId, nextValue) => userRepo.patchActive(userId, nextValue),
    deleteEntity: (userId) => userRepo.deleteUser(userId),
    onActiveChanged: (nextValue) => {
      setTargetUser((prev) => prev ? { ...prev, isActive: nextValue } : prev);
    },
    onDeleted: () => {
      setTimeout(() => navigate(ROUTES.USER.LIST), 1500);
    },
    showToast,
    messages: {
      activateSuccess: "Activado correctamente",
      deactivateSuccess: "Inactivado correctamente",
      toggleError: () => "No se pudo completar la acción. Inténtalo de nuevo.",
      deleteSuccess: "Empleado eliminado correctamente",
      deleteError: (error) => getErrorMessage(error, "No se pudo eliminar el empleado."),
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateUserRequest>({
    name: "",
    surname: "",
    email: "",
    isActive: true,
    role: SYSTEM_ROLES.EMPLOYEE,
  });
  const [loadingPatch, setLoadingPatch] = useState(false);

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;
  const isMyProfile = userStore?.id === targetUser?.id;

  useEffect(() => {
    if (!id) return;
    userRepo.getById(id).then(setTargetUser);
    userRepo.getProjects(id).then(setProjects);
  }, [id, userRepo]);

  const handleEditClick = () => {
    if (!targetUser) return;
    setEditData({
      name: targetUser.name,
      surname: targetUser.surname,
      email: targetUser.email,
      isActive: targetUser.isActive,
      role: targetUser.role,
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!id) return;
    const emailChanged = isMyProfile && editData.email !== targetUser?.email;
    setLoadingPatch(true);
    try {
      await userRepo.putUser(id, editData);
      if (emailChanged) {
        sessionStorage.setItem("sessionMessage", "Tu correo ha sido actualizado. Por favor, inicia sesión de nuevo.");
        logout();
        return;
      }
      setTargetUser((prev) => prev ? { ...prev, ...editData } : prev);
      showToast("Información actualizada correctamente", "success");
      setIsEditing(false);
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo guardar los cambios."));
    } finally {
      setLoadingPatch(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditData((prev) => ({
      ...prev,
      role: e.target.checked ? SYSTEM_ROLES.ADMIN : SYSTEM_ROLES.EMPLOYEE,
    }));
  };

  const handlePasswordSubmit = async (data: { currentPassword: string; newPassword: string }) => {
    if (!id) return;
    try {
      await userRepo.patchPassword(id, data);
      sessionStorage.setItem("sessionMessage", "Tu contraseña ha sido actualizada. Por favor, inicia sesión de nuevo.");
      logout();
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo cambiar la contraseña."));
      throw err;
    }
  };

  const handleAdminPasswordSubmit = async (newPassword: string) => {
    if (!id) return;
    try {
      await userRepo.patchAdminPassword(id, newPassword);
      showToast("Contraseña actualizada correctamente", "success");
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo cambiar la contraseña."));
      throw err;
    }
  };

  return {
    targetUser,
    projects,
    toast,
    closeToast,
    modalActive: entityActions.modalActive,
    modalLoadingPatch: entityActions.loadingPatch,
    openModal: entityActions.openModal,
    closeModal: entityActions.closeModal,
    handleToggleActive: entityActions.handleToggleActive,
    handleDelete: entityActions.handleDelete,
    isAdmin,
    isMyProfile,
    isEditing,
    setIsEditing,
    editData,
    loadingPatch,
    handleEditClick,
    handleSave,
    handleInputChange,
    handleRoleToggle,
    passwordModal,
    adminPasswordModal,
    handlePasswordSubmit,
    handleAdminPasswordSubmit,
  };
}
