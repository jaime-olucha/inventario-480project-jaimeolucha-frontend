
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUserStore } from "@/infrastructure/store/user.store";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useEffect, useState, useCallback } from "react";
import type { UserProject } from "@/domain/models/User/UserProject";
import { ROUTES } from "@/ui/routes/routes";
import type { User } from "@/domain/models/User/User";
import './PersonalDetailPage.scss';
import { LogoUser } from "@/ui/components/logoUser/LogoUser";
import type { EntityId } from "@/domain/value-objects/EntityId";
import { ArrowLeft, Edit2, FolderKanban, Mail, Save, Trash2, UserCheck, UserX, X } from "lucide-react";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { ConfirmModal } from "@/ui/components/molecules/confirmModal/ConfirmModal";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ActionButton } from "@/ui/components/molecules/actionButton/ActionButton";
import type { UpdateUserRequest } from "@/domain/models/User/UpdateUserRequest";
import '@/ui/components/molecules/confirmModal/ConfirmModal.scss';


export const PersonalDetailPage = () => {
  const { id } = useParams<{ id: EntityId }>();
  const navigate = useNavigate();
  const userStore = useUserStore((store) => store.user);
  const { user: userRepo } = useRepositories();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [targetUser, setTargetUser] = useState<User>();
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllInactive, setShowAllInactive] = useState(false);
  const [modalActive, setModalActive] = useState<"inactivar" | "activar" | "eliminar" | null>(null);
  const [loadingPatch, setLoadingPatch] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState<UpdateUserRequest>({
    name: "",
    surname: "",
    email: "",
    isActive: true,
    role: SYSTEM_ROLES.EMPLOYEE,
  });

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;
  const isMyProfile = userStore?.id === targetUser?.id;

  const PROJECTS_PREVIEW_LIMIT = 2;
  const activeProjects = projects.filter((project) => project.isActive);
  const inactiveProjects = projects.filter((project) => !project.isActive);
  const visibleActive = showAllActive ? activeProjects : activeProjects.slice(0, PROJECTS_PREVIEW_LIMIT);
  const visibleInactive = showAllInactive ? inactiveProjects : inactiveProjects.slice(0, PROJECTS_PREVIEW_LIMIT);


  useEffect(() => {
    if (!id) return;
    userRepo.getById(id).then(setTargetUser);
    userRepo.getProjects(id).then(setProjects);
  }, [id, userRepo]);

  const closeToast = useCallback(() => setToast(null), []);

  const handleDelete = async () => {
    if (!id) return;
    setLoadingPatch(true);

    try {
      await userRepo.deleteUser(id);

      setToast({
        message: "Empleado eliminado correctamente",
        type: "success"
      });
      setTimeout(() => navigate(ROUTES.USER.LIST), 1500);
    } catch (err) {
      setToast({
        message: getErrorMessage(err, "No se pudo eliminar el empleado."),
        type: "error"
      });
    } finally {
      setLoadingPatch(false);
      setModalActive(null);
    }
  };

  const handleToggleActive = async () => {
    if (!id || !targetUser) return;
    const nextValue = !targetUser.isActive;
    setLoadingPatch(true);
    try {
      await userRepo.patchActive(id, nextValue);
      setTargetUser((prev) => prev ? { ...prev, isActive: nextValue } : prev);
      setToast({
        message: nextValue ? "Activado correctamente" : "Inactivado correctamente",
        type: "success"
      });

    } catch (err) {
      setToast({
        message: "No se pudo completar la acción. Inténtalo de nuevo.",
        type: "error"
      });

      console.log(err)

    } finally {
      setLoadingPatch(false);
      setModalActive(null);
    }
  };

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
    if (!id || !editData) return;
    setLoadingPatch(true);
    try {
      await userRepo.putUser(id, editData);
      setTargetUser((prev) => prev ? { ...prev, ...editData } : prev);
      setToast({
        message: "Información actualizada correctamente",
        type: "success"
      });
      setIsEditing(false);
    } catch (err) {
      setToast({
        message: getErrorMessage(err, "No se pudo guardar los cambios."),
        type: "error"
      });

    } finally {
      setLoadingPatch(false);
    }
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = e.target.checked;
    setEditData((prev) => ({
      ...prev,
      role: isChecked ? SYSTEM_ROLES.ADMIN : SYSTEM_ROLES.EMPLOYEE,
    }));
  };

  return (
    <section className="personal-detail-page">

      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {modalActive && (
        <ConfirmModal
          title={
            modalActive === "inactivar" ? "Inactivar Usuario"
              : modalActive === "activar" ? "Activar Usuario"
                : "Eliminar Usuario"
          }
          message={
            modalActive === "inactivar"
              ? "¿Estás seguro de que deseas inactivar a este usuario? Los datos no se eliminarán."
              : modalActive === "activar"
                ? "¿Estás seguro de que deseas activar a este usuario?"
                : "¿Estás seguro de que deseas eliminar a este usuario? Esta acción no se puede deshacer."
          }
          loading={loadingPatch}
          onConfirm={modalActive === "eliminar" ? handleDelete : handleToggleActive}
          onCancel={() => setModalActive(null)}
        />
      )}

      <div className="personal-detail-page_header">
        <div className="header-left">
          <button className="btn-back" onClick={() => navigate(ROUTES.USER.LIST)} aria-label="Volver">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>{isMyProfile ? "Mi Perfil" : "Detalle de Personal"}</h1>
            <p className="info">
              {isMyProfile ? "Tu información completa y proyectos" : "Información completa del empleado"}
            </p>
          </div>
        </div>

        {isAdmin && !isMyProfile && (
          <div className="header-actions">
            {targetUser?.isActive ? (
              <button className="btn-action btn-inactivar" onClick={() => setModalActive("inactivar")}>
                <UserX size={15} /> Inactivar
              </button>
            ) : (
              <button className="btn-action btn-activar" onClick={() => setModalActive("activar")}>
                <UserCheck size={15} /> Activar
              </button>
            )}
            <button className="btn-action btn-eliminar" onClick={() => setModalActive("eliminar")}>
              <Trash2 size={15} /> Eliminar
            </button>
          </div>
        )}
      </div>

      <article className="card profile-card">
        <div className="profile-card_top">
          <span className="section-label">Información Personal</span>
          {isAdmin && !isEditing && (
            <ActionButton compact icon={<Edit2 size={14} />} onClick={handleEditClick}>Editar</ActionButton>
          )}
          {isAdmin && isEditing && (
            <div className="edit-actions">
              <ActionButton compact icon={<Save size={16} />} onClick={handleSave} disabled={loadingPatch}>
                {loadingPatch ? "Guardando..." : "Guardar"}
              </ActionButton>
              <button className="btn-cancel" onClick={() => setIsEditing(false)}>
                <X size={16} />
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div className="profile-card_body">
          <LogoUser user={targetUser} className="logo-user" />
          {!isEditing ? (
            <div className="card-user_info">
              <h3>{targetUser?.name} {targetUser?.surname}</h3>
              <p className="user-email">
                <Mail size={13} className="iconSvg" />
                {targetUser?.email}
              </p>
            </div>
          ) : (
            <div className="edit-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">Nombre</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={editData.name}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="surname">Apellido</label>
                  <input
                    id="surname"
                    name="surname"
                    type="text"
                    value={editData.surname}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="email">Correo Corporativo</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={editData.email}
                    onChange={handleInputChange}
                    className="edit-input"
                  />
                </div>

                {userStore?.id !== targetUser?.id && (
                  <div className="form-group checkbox-group">
                    <label>Rol de Usuario</label>
                    <div className="checkbox-wrapper">
                      <input
                        id="isAdmin"
                        name="isAdmin"
                        type="checkbox"
                        checked={editData.role === SYSTEM_ROLES.ADMIN}
                        onChange={handleRoleToggle}
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

      {!isEditing && (
        <article className="card projects-card">
          <div className="projects-card_top">
            <FolderKanban size={18} className="iconSvg" />
            <div>
              <h2 className="card_header">Proyectos</h2>
              <p className="info">
                Proyectos en los que {isMyProfile ? "estás asignado" : `${targetUser?.name ?? "el empleado"} ha participado`}
              </p>
            </div>
          </div>

          {projects.length === 0 && (
            <p className="no-projects">No hay proyectos asignados</p>
          )}

          {activeProjects.length > 0 && (
            <div className="projects-group">
              <h3 className="group-label group-label--active">
                Proyectos Activos ({activeProjects.length})
              </h3>
              <ul className="projects-list">
                {visibleActive.map((project) => (
                  <li key={project.id} className="project-item">
                    <Link to={ROUTES.PROJECTS.BY_ID(project.id)} className="project-item_inner">
                      <div>
                        <p className="project-name">{project.name}</p>
                        <p className="info project-desc">{project.description}</p>
                      </div>
                      <span className="project-badge">{project.clientName}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              {activeProjects.length > PROJECTS_PREVIEW_LIMIT && (
                <button className="btn-toggle" onClick={() => setShowAllActive((v) => !v)}>
                  {showAllActive ? "Ver menos" : `Ver más (${activeProjects.length - PROJECTS_PREVIEW_LIMIT} más)`}
                </button>
              )}
            </div>
          )}

          {inactiveProjects.length > 0 && (
            <div className="projects-group">
              <h3 className="group-label group-label--inactive">
                Proyectos Finalizados ({inactiveProjects.length})
              </h3>
              <ul className="projects-list">
                {visibleInactive.map((project) => (
                  <li key={project.id} className="project-item project-item--inactive">
                    <div className="project-item_inner">
                      <div>
                        <p className="project-name">{project.name}</p>
                        <p className="info project-desc">{project.description}</p>
                      </div>
                      <span className="project-badge project-badge--inactive">Inactivo</span>
                    </div>
                  </li>
                ))}
              </ul>
              {inactiveProjects.length > PROJECTS_PREVIEW_LIMIT && (
                <button className="btn-toggle" onClick={() => setShowAllInactive((view) => !view)}>
                  {showAllInactive ? "Ver menos" : `Ver más (${inactiveProjects.length - PROJECTS_PREVIEW_LIMIT} más)`}
                </button>
              )}
            </div>
          )}
        </article>
      )}
    </section>
  );
};
