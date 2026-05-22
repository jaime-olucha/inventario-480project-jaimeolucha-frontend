import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { UseFormRegister } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { PROJECT_ROLES, getProjectRoleLabel } from "@/domain/value-objects/ProjectRole";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useToast } from "@/ui/hooks/useToast";
import type { ToastState } from "@/ui/hooks/useToast";
import { useProjectTeamData } from "./useProjectTeamData";
import { useTeamFilters } from "./useTeamFilters";
import type { ProjectUser } from "@/domain/models/Project/ProjectUser";
import type { ProjectRole } from "@/domain/models/Project/ProjectRole";
import type { User } from "@/domain/models/User/User";
import type { EntityId } from "@/domain/value-objects/EntityId";

export type TeamFormMode = "add" | "edit";

export interface TeamFormMeta {
  mode: TeamFormMode;
  originalUserId?: EntityId;
}

export interface TeamFormValues {
  userId: EntityId;
  roleId: EntityId;
}

export interface PendingUserChange {
  values: TeamFormValues;
  meta: TeamFormMeta;
  oldMember: ProjectUser;
}

export function getFullName(user: ProjectUser | User): string {
  return `${user.name} ${user.surname}`.trim();
}

export interface UseProjectTeamReturn {
  loading: boolean;
  saving: boolean;
  error: string | null;
  activeTeam: ProjectUser[];
  projectManager: ProjectUser | undefined;
  kam: ProjectUser | undefined;
  techLeader: ProjectUser | undefined;
  isAdmin: boolean;
  canEdit: boolean;
  availableUsers: User[];
  editModeUsers: User[];
  selectedRole: ProjectRole | undefined;
  filteredTeam: ProjectUser[];
  projectRoles: ProjectRole[];
  search: string;
  setSearch: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  formMeta: TeamFormMeta | null;
  register: UseFormRegister<TeamFormValues>;
  watchedUserId: EntityId;
  watchedRoleId: EntityId;
  pendingUserChange: PendingUserChange | null;
  cancelPendingUserChange: () => void;
  confirmPendingUserChange: () => Promise<void>;
  openAddForm: () => void;
  openEditForm: (member: ProjectUser) => void;
  closeForm: () => void;
  submitForm: (e?: React.BaseSyntheticEvent) => Promise<void>;
  deactivateMember: (member: ProjectUser) => Promise<void>;
  inactivateMember: (member: ProjectUser) => Promise<void>;
  refreshTeam: () => Promise<void>;
  toast: ToastState | null;
  closeToast: () => void;
}

export const useProjectTeam = (): UseProjectTeamReturn => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);

  const { team, users, projectRoles, loading, error, refreshTeam } = useProjectTeamData();

  const [saving, setSaving] = useState(false);
  const { toast, showToast, closeToast } = useToast();
  const [formMeta, setFormMeta] = useState<TeamFormMeta | null>(null);
  const [pendingUserChange, setPendingUserChange] = useState<PendingUserChange | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<TeamFormValues>({
    defaultValues: { userId: "", roleId: "" },
  });

  const watchedUserId = watch("userId");
  const watchedRoleId = watch("roleId");

  const activeTeam = useMemo(() => team.filter((m) => m.isActive), [team]);
  const { search, setSearch, roleFilter, setRoleFilter, filteredTeam } = useTeamFilters(activeTeam);

  const projectManager = useMemo(
    () => activeTeam.find((member) => member.role.name === PROJECT_ROLES.PROJECT_MANAGER),
    [activeTeam],
  );

  const kam = useMemo(
    () => activeTeam.find((member) => member.role.name === PROJECT_ROLES.KAM),
    [activeTeam],
  );

  const techLeader = useMemo(
    () => activeTeam.find((member) => member.role.name === PROJECT_ROLES.TECH_LEADER),
    [activeTeam],
  );

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;
  const isProjectManager = Boolean(projectManager && userStore?.id === projectManager.userId);
  const canEdit = isAdmin || isProjectManager;

  const availableUsers = useMemo(() => {
    const assignedUserIds = new Set(activeTeam.map((member) => member.userId));
    return users.filter((user) => !assignedUserIds.has(user.id));
  }, [activeTeam, users]);

  const editModeUsers = useMemo(() => {
    if (!formMeta || formMeta.mode !== "edit" || !formMeta.originalUserId) return availableUsers;
    const currentUser = users.find((u) => u.id === formMeta.originalUserId);
    return currentUser ? [currentUser, ...availableUsers] : availableUsers;
  }, [formMeta, users, availableUsers]);

  const selectedRole = useMemo(
    () => projectRoles.find((role) => role.id === watchedRoleId),
    [watchedRoleId, projectRoles],
  );

  const openAddForm = () => {
    const firstUser = availableUsers[0];
    const firstRole = projectRoles.find((role) => role.name !== PROJECT_ROLES.PROJECT_MANAGER || isAdmin) ?? projectRoles[0];
    reset({ userId: firstUser?.id ?? "", roleId: firstRole?.id ?? "" });
    setFormMeta({ mode: "add" });
  };

  const openEditForm = (member: ProjectUser) => {
    reset({ userId: member.userId, roleId: member.role.id });
    setFormMeta({ mode: "edit", originalUserId: member.userId });
  };

  const closeForm = () => {
    setFormMeta(null);
    reset({ userId: "", roleId: "" });
  };

  const findExclusiveRoleOwner = (roleName: string, targetUserId: EntityId) => {
    if (roleName !== PROJECT_ROLES.PROJECT_MANAGER && roleName !== PROJECT_ROLES.KAM) return undefined;
    return activeTeam.find((member) => member.role.name === roleName && member.userId !== targetUserId);
  };

  const persistForm = async (values: TeamFormValues, meta: TeamFormMeta) => {
    if (!id) return;

    setSaving(true);

    try {
      if (meta.mode === "add") {
        await projectRepo.addUser(id, values.userId, values.roleId);
        showToast("Persona añadida al proyecto.", "success");
      } else if (meta.originalUserId && values.userId !== meta.originalUserId) {
        const oldMember = activeTeam.find((m) => m.userId === meta.originalUserId);
        if (oldMember) await projectRepo.removeUser(id, oldMember.userId);
        await projectRepo.addUser(id, values.userId, values.roleId);
        showToast("Asignación actualizada correctamente.", "success");
      } else {
        await projectRepo.updateUserRole(id, values.userId, values.roleId);
        showToast("Rol actualizado correctamente.", "success");
      }

      await refreshTeam();
      closeForm();
      setPendingUserChange(null);
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo guardar la asignación."));
    } finally {
      setSaving(false);
    }
  };

  const submitForm = handleSubmit(async (values) => {
    if (!formMeta || !selectedRole) return;

    if (!isAdmin && selectedRole.name === PROJECT_ROLES.PROJECT_MANAGER) {
      showToast("Un PM no puede asignar a otro usuario como Project Manager.");
      return;
    }

    const replacingMember = findExclusiveRoleOwner(selectedRole.name, values.userId);
    if (replacingMember) {
      showToast(`Ya existe un ${getProjectRoleLabel(selectedRole.name)} asignado. Cámbialo manualmente antes de asignar otro.`);
      return;
    }

    if (formMeta.mode === "edit" && formMeta.originalUserId && values.userId !== formMeta.originalUserId) {
      const oldMember = activeTeam.find((m) => m.userId === formMeta.originalUserId);
      if (oldMember) {
        setPendingUserChange({ values, meta: formMeta, oldMember });
        return;
      }
    }

    await persistForm(values, formMeta);
  });

  const deactivateMember = async (member: ProjectUser) => {
    if (!id) return;

    setSaving(true);

    try {
      await projectRepo.removeUser(id, member.userId);
      await refreshTeam();
      showToast(`${getFullName(member)} ha sido eliminado del proyecto.`, "success");
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo quitar al usuario del proyecto."));
    } finally {
      setSaving(false);
    }
  };

  const inactivateMember = async (member: ProjectUser) => {
    if (!id) return;

    setSaving(true);

    try {
      await projectRepo.patchUserActive(id, member.userId, false);
      await refreshTeam();
      showToast(`${getFullName(member)} ha sido inactivado en el proyecto.`, "success");
    } catch (err) {
      showToast(getErrorMessage(err, "No se pudo inactivar al usuario en el proyecto."));
    } finally {
      setSaving(false);
    }
  };

  const cancelPendingUserChange = () => setPendingUserChange(null);

  const confirmPendingUserChange = async () => {
    if (!pendingUserChange) return;
    await persistForm(pendingUserChange.values, pendingUserChange.meta);
  };

  return {
    loading,
    saving,
    error,
    activeTeam,
    projectManager,
    kam,
    techLeader,
    isAdmin,
    canEdit,
    availableUsers,
    editModeUsers,
    selectedRole,
    filteredTeam,
    projectRoles,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    formMeta,
    register,
    watchedUserId,
    watchedRoleId,
    pendingUserChange,
    cancelPendingUserChange,
    confirmPendingUserChange,
    openAddForm,
    openEditForm,
    closeForm,
    submitForm,
    deactivateMember,
    inactivateMember,
    refreshTeam,
    toast,
    closeToast,
  };
};
