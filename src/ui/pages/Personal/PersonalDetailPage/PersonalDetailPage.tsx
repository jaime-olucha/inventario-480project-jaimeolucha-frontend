import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/ui/routes/routes";
import './PersonalDetailPage.scss';
import { Trash2, UserCheck, UserX } from "lucide-react";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import '@/ui/components/organisms/confirmModal/ConfirmModal.scss';
import { ProjectsListCard } from "@/ui/components/organisms/projectsListCard/ProjectsListCard";
import { DetailPageHeader } from "@/ui/components/molecules/detailPageHeader/DetailPageHeader";
import { UserInfoCard } from "@/ui/components/organisms/userInfoCard/UserInfoCard";
import { usePersonalDetailPage } from "./usePersonalDetailPage";
import { ChangePasswordModal } from "./ChangePasswordModal";
import { AdminPasswordModal } from "./AdminPasswordModal";


export const PersonalDetailPage = () => {
  const navigate = useNavigate();
  const {
    targetUser,
    projects,
    loadingPatch,
    toast,
    closeToast,
    modalActive,
    modalLoadingPatch,
    openModal,
    closeModal,
    handleDelete,
    handleToggleActive,
    isAdmin,
    isMyProfile,
    isEditing,
    setIsEditing,
    editData,
    handleEditClick,
    handleSave,
    handleInputChange,
    handleRoleToggle,
    passwordModal,
    adminPasswordModal,
    handlePasswordSubmit,
    handleAdminPasswordSubmit,
  } = usePersonalDetailPage();

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
          loading={modalLoadingPatch}
          onConfirm={modalActive === "eliminar" ? handleDelete : handleToggleActive}
          onCancel={closeModal}
        />
      )}

      {passwordModal.isOpen && (
        <ChangePasswordModal
          onClose={passwordModal.close}
          onSubmit={handlePasswordSubmit}
        />
      )}

      {adminPasswordModal.isOpen && (
        <AdminPasswordModal
          onClose={adminPasswordModal.close}
          onSubmit={handleAdminPasswordSubmit}
        />
      )}

      <DetailPageHeader
        title={isMyProfile ? "Mi Perfil" : "Detalle de Personal"}
        subtitle={isMyProfile ? "Tu información completa y proyectos" : "Información completa del empleado"}
        onBack={() => navigate(ROUTES.USER.LIST)}
        actions={isAdmin && !isMyProfile && (
          <>
            {targetUser?.isActive ? (
              <button className="btn-action btn-inactivar" onClick={() => openModal("inactivar")}>
                <UserX size={15} /> Inactivar
              </button>
            ) : (
              <button className="btn-action btn-activar" onClick={() => openModal("activar")}>
                <UserCheck size={15} /> Activar
              </button>
            )}
            <button className="btn-action btn-eliminar" onClick={() => openModal("eliminar")}>
              <Trash2 size={15} /> Eliminar
            </button>
          </>
        )}
      />

      <UserInfoCard
        user={targetUser}
        isAdmin={isAdmin}
        isMyProfile={isMyProfile}
        isEditing={isEditing}
        editData={editData}
        loadingPatch={loadingPatch}
        onEditClick={handleEditClick}
        onSave={handleSave}
        onCancelEdit={() => setIsEditing(false)}
        onInputChange={handleInputChange}
        onRoleToggle={handleRoleToggle}
        onChangePasswordClick={passwordModal.open}
        onAdminChangePasswordClick={adminPasswordModal.open}
      />

      {!isEditing && (
        <ProjectsListCard
          projects={projects}
          description={isMyProfile ? "estás asignado" : `${targetUser?.name ?? "el empleado"} ha participado`}
          emptyText="No hay proyectos asignados"
          renderActiveBadge={(p) => <span className="project-badge">{p.clientName}</span>}
        />
      )}
    </section>
  );
};
