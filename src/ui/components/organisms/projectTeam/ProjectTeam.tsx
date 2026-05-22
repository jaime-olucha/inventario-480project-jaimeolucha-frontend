import { Search, ShieldAlert, UserPlus, X, Check } from "lucide-react";
import { PROJECT_ROLES, getProjectRoleLabel } from "@/domain/value-objects/ProjectRole";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { useProjectTeam, getFullName } from "./useProjectTeam";
import { TeamMemberCard } from "./TeamMemberCard";
import { RoleSummaryBar } from "./RoleSummaryBar";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";
import "./ProjectTeam.scss";

export const ProjectTeam = () => {
  const {
    loading,
    error,
    toast,
    closeToast,
    pendingUserChange,
    saving,
    confirmPendingUserChange,
    cancelPendingUserChange,
    canEdit,
    availableUsers,
    projectRoles,
    openAddForm,
    projectManager,
    kam,
    techLeader,
    activeTeam,
    formMeta,
    editModeUsers,
    register,
    isAdmin,
    watchedUserId,
    watchedRoleId,
    closeForm,
    submitForm,
    search,
    setSearch,
    roleFilter,
    setRoleFilter,
    filteredTeam,
    openEditForm,
    inactivateMember,
    deactivateMember,
  } = useProjectTeam();

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
          onClose={closeToast}
        />
      )}

      {pendingUserChange && (
        <ConfirmModal
          title="Cambiar persona asignada"
          message={`¿Deseas reemplazar a ${getFullName(pendingUserChange.oldMember)} por la persona seleccionada en este rol?`}
          confirmLabel="Confirmar cambio"
          loading={saving}
          onConfirm={confirmPendingUserChange}
          onCancel={cancelPendingUserChange}
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

        <RoleSummaryBar
          projectManager={projectManager}
          kam={kam}
          techLeader={techLeader}
          totalCount={activeTeam.length}
        />

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
            <Search size={38} />
            <h3>Sin personal asignado</h3>
            <p>Cuando se asignen usuarios al proyecto aparecerán aquí.</p>
          </div>
        ) : (
          <div className="team-list">
            {filteredTeam.map((member) => (
              <TeamMemberCard
                key={`${member.userId}-${member.role.id}`}
                member={member}
                canEdit={canEdit}
                saving={saving}
                onEdit={openEditForm}
                onInactivate={inactivateMember}
                onDeactivate={deactivateMember}
              />
            ))}
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
