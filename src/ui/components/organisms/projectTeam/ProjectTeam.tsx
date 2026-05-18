import { useMemo, useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { Crown, KeyRound, Pencil, Search, ShieldAlert, UserPlus, Users2, X, Check, UserMinus, Code2 } from "lucide-react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { PROJECT_ROLES, getProjectRoleLabel } from "@/domain/value-objects/ProjectRole";
import { ConfirmModal } from "@/ui/components/molecules/confirmModal/ConfirmModal";
import { ActionButton } from "@/ui/components/molecules/actionButton/ActionButton";
import { LogoUser } from "@/ui/components/logoUser/LogoUser";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import type { ProjectUser } from "@/domain/models/Project/ProjectUser";
import type { ProjectRole } from "@/domain/models/Project/ProjectRole";
import type { User } from "@/domain/models/User/User";
import type { EntityId } from "@/domain/value-objects/EntityId";
import "@/ui/components/molecules/confirmModal/ConfirmModal.scss";
import "./ProjectTeam.scss";

type TeamFormMode = "add" | "edit";

interface TeamFormMeta {
  mode: TeamFormMode;
  originalUserId?: EntityId;
}

interface TeamFormValues {
  userId: EntityId;
  roleId: EntityId;
}

interface PendingUserChange {
  values: TeamFormValues;
  meta: TeamFormMeta;
  oldMember: ProjectUser;
}

function getFullName(user: ProjectUser | User): string {
  return `${user.name} ${user.surname}`.trim();
}

export const ProjectTeam = () => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo, user: userRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);

  const [team, setTeam] = useState<ProjectUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [formMeta, setFormMeta] = useState<TeamFormMeta | null>(null);
  const [pendingUserChange, setPendingUserChange] = useState<PendingUserChange | null>(null);

  const { register, handleSubmit, reset, watch } = useForm<TeamFormValues>({
    defaultValues: { userId: "" as EntityId, roleId: "" as EntityId },
  });

  const watchedUserId = watch("userId");
  const watchedRoleId = watch("roleId");

  const showToast = (message: string, type: "success" | "error" = "error") => {
    setToast({ message, type });
  };

  const refreshTeam = async () => {
    if (!id) return;
    const nextTeam = await projectRepo.getUsers(id);
    setTeam(nextTeam);
  };

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    setError(null);

    Promise.all([
      projectRepo.getUsers(id),
      projectRepo.getRoles(),
    ])
      .then(([projectUsers, roles]) => {
        setTeam(projectUsers);
        setProjectRoles(roles);
      })
      .catch(() => setError("No se pudo cargar el equipo del proyecto."))
      .finally(() => setLoading(false));
  }, [id, projectRepo]);

  useEffect(() => {
    userRepo.getAll(1, 500)
      .then((allUsers) => setUsers(allUsers.filter((u) => u.isActive)))
      .catch(() => { });
  }, [userRepo]);

  const activeTeam = useMemo(() => team.filter((m) => m.isActive), [team]);

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

  const filteredTeam = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return activeTeam.filter((member) => {
      if (roleFilter && member.role.name !== roleFilter) return false;
      return !normalizedSearch || getFullName(member).toLowerCase().includes(normalizedSearch);
    });
  }, [search, roleFilter, activeTeam]);

  const openAddForm = () => {
    const firstUser = availableUsers[0];
    const firstRole = projectRoles.find((role) => role.name !== PROJECT_ROLES.PROJECT_MANAGER || isAdmin) ?? projectRoles[0];
    reset({ userId: firstUser?.id ?? "" as EntityId, roleId: firstRole?.id ?? "" as EntityId });
    setFormMeta({ mode: "add" });
  };

  const openEditForm = (member: ProjectUser) => {
    reset({ userId: member.userId, roleId: member.role.id });
    setFormMeta({ mode: "edit", originalUserId: member.userId });
  };

  const closeForm = () => {
    setFormMeta(null);
    reset({ userId: "" as EntityId, roleId: "" as EntityId });
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

  if (loading) {
    return (
      <section className="project-team">
        <div className="card">
          <div className="team-skeleton-header">
            <div className="skeleton skeleton--title" />
            <div className="skeleton skeleton--short" />
          </div>
          <div className="team-grid">
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
            <div className="skeleton skeleton--card" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="project-team">
        <div className="card empty-state empty-state--error">
          <ShieldAlert size={34} />
          <h2>No se pudo cargar el equipo</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="project-team">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {pendingUserChange && (
        <ConfirmModal
          title="Cambiar persona asignada"
          message={`¿Deseas reemplazar a ${getFullName(pendingUserChange.oldMember)} por la persona seleccionada en este rol?`}
          confirmLabel="Confirmar cambio"
          loading={saving}
          onConfirm={() => persistForm(pendingUserChange.values, pendingUserChange.meta)}
          onCancel={() => setPendingUserChange(null)}
        />
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <span className="header_title">Equipo del proyecto</span>
            <p className="project-subtitle">
              Consulta y gestiona las personas que forman o han formado parte del proyecto y sus roles.
            </p>
          </div>

          {canEdit && (
            <div className="header-actions">
              <ActionButton icon={<UserPlus size={16} />} onClick={openAddForm} disabled={saving || availableUsers.length === 0 || projectRoles.length === 0}>Añadir persona</ActionButton>
            </div>
          )}
        </div>

        <div className="role-summary">
          {([
            { label: "Project Manager", member: projectManager, icon: <Crown size={20} />, cls: "summary-card--pm" },
            { label: "KAM", member: kam, icon: <KeyRound size={20} />, cls: "summary-card--kam" },
            { label: "Tech Leader", member: techLeader, icon: <Code2 size={20} />, cls: "summary-card--tech" },
          ]).map(({ label, member, icon, cls }) => (
            <article key={label} className={`summary-card ${cls}`}>
              <div className="summary-icon">{icon}</div>
              <div className="summary-info">
                <span>{label}</span>
                <strong>{member ? getFullName(member) : "Sin asignar"}</strong>
              </div>
            </article>
          ))}

          <article className="summary-card">
            <div className="summary-icon">
              <Users2 size={20} />
            </div>
            <div>
              <span>Total personal</span>
              <strong>{activeTeam.length}</strong>
            </div>
          </article>
        </div>

        {formMeta && (
          <div className="team-form-panel">
            <div className="team-form-header">
              <div>
                <h3>{formMeta.mode === "add" ? "Añadir persona" : "Editar asignación"}</h3>
                <p>{formMeta.mode === "add" ? "Selecciona un usuario de Personal y el rol que tendrá en el proyecto." : "Modifica el usuario o el rol de la asignación."}</p>
              </div>
              <button type="button" className="icon-button" onClick={closeForm} disabled={saving} aria-label="Cerrar formulario">
                <X size={18} />
              </button>
            </div>

            <div className="team-form-grid">
              <label>
                Persona
                <select disabled={saving} {...register("userId", { required: true })}>
                  {formMeta.mode === "add" && availableUsers.length === 0
                    ? <option value="">No hay personal disponible</option>
                    : (formMeta.mode === "add" ? availableUsers : editModeUsers).map((user) => (
                      <option key={user.id} value={user.id}>{getFullName(user)}</option>
                    ))
                  }
                </select>
              </label>

              <label>
                Rol
                <select disabled={saving} {...register("roleId", { required: true })}>
                  {projectRoles.map((role) => (
                    <option key={role.id} value={role.id} disabled={!isAdmin && role.name === PROJECT_ROLES.PROJECT_MANAGER}>
                      {getProjectRoleLabel(role.name)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="team-form-actions">
              <button type="button" className="btn-secondary" onClick={closeForm} disabled={saving}>
                <X size={16} /> Cancelar
              </button>
              <ActionButton icon={<Check size={16} />} onClick={submitForm} disabled={saving || !watchedUserId || !watchedRoleId}>{saving ? "Guardando..." : "Guardar"}</ActionButton>
            </div>
          </div>
        )}

        <div className="team-toolbar">
          <div className="search-box">
            <Search size={17} />
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por nombre..." type="search" />
          </div>
          <select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
            <option value="">Todos los roles</option>
            {projectRoles.map((role) => (
              <option key={role.id} value={role.name}>{getProjectRoleLabel(role.name)}</option>
            ))}
          </select>
        </div>

        {activeTeam.length === 0 ? (
          <div className="empty-state">
            <Users2 size={38} />
            <h3>Sin personal asignado</h3>
            <p>Cuando se asignen usuarios al proyecto aparecerán aquí.</p>
          </div>
        ) : (
          <div className="team-list">
            {filteredTeam.map((member) => {
              const isPm = member.role.name === PROJECT_ROLES.PROJECT_MANAGER;
              const isKam = member.role.name === PROJECT_ROLES.KAM;
              const isTechLead = member.role.name === PROJECT_ROLES.TECH_LEADER;

              return (
                <article className="team-member" key={`${member.userId}-${member.role.id}`}>
                  <div className="member-main">
                    <LogoUser user={member} className="avatar" />
                    <div>
                      <h3>{getFullName(member)}</h3>
                    </div>
                  </div>

                  <div className="member-side">
                    <span className={`role-badge ${isPm ? "role-badge--pm" : ""} ${isKam ? "role-badge--kam" : ""} ${isTechLead ? "role-badge--tech" : ""}`}>
                      {getProjectRoleLabel(member.role.name)}
                    </span>

                    {canEdit && (
                      <div className="member-actions">
                        <button type="button" className="icon-button" onClick={() => openEditForm(member)} disabled={saving} aria-label="Editar rol">
                          <Pencil size={16} />
                        </button>
                        <button type="button" className="icon-button icon-button--danger" onClick={() => deactivateMember(member)} disabled={saving} aria-label="Quitar del proyecto">
                          <UserMinus size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        {activeTeam.length > 0 && filteredTeam.length === 0 && (
          <div className="empty-state empty-state--compact">
            <Search size={30} />
            <h3>No hay coincidencias</h3>
            <p>Prueba con otro nombre.</p>
          </div>
        )}

      </div>
    </section>
  );
};
