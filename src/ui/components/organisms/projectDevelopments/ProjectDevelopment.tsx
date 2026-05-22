import { Code2, Plus, Settings, ShieldAlert } from "lucide-react";
import { ActionButton } from "@/ui/components/atoms/actionButton/ActionButton";
import { ConfirmModal } from "@/ui/components/organisms/confirmModal/ConfirmModal";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import { ManageTechnologiesModal } from "./ManageTechnologiesModal";
import { DevCard } from "./DevCard";
import { DevFormPanel } from "./DevFormPanel";
import { useProjectDevelopment } from "./useProjectDevelopment";
import "@/ui/components/organisms/confirmModal/ConfirmModal.scss";
import "./ProjectDevelopment.scss";

interface ProjectDevelopmentProps {
  canEdit?: boolean;
}

export const ProjectDevelopment = ({ canEdit = false }: ProjectDevelopmentProps) => {
  const {
    developments, technologies, refreshTechnologies,
    loading, saving, error,
    toast, showToast, closeToast,
    showForm, editingDev,
    register, errors,
    openAddForm, openEditForm, closeForm, handleSubmitForm,
    devToDelete, setDevToDelete, handleDelete,
    showTechModal, openTechModal, closeTechModal,
  } = useProjectDevelopment();

  if (loading) {
    return (
      <section className="project-development">
        <div className="card">
          <div className="skeleton skeleton--title" style={{ marginBottom: "8px" }} />
          <div className="skeleton skeleton--short" style={{ marginBottom: "24px" }} />
          <div className="dev-grid">
            {[1, 2, 3].map((n) => <div key={n} className="skeleton skeleton--dev-card" />)}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="project-development">
        <div className="card empty-state empty-state--error">
          <ShieldAlert size={34} />
          <h2>No se pudo cargar</h2>
          <p>{error}</p>
        </div>
      </section>
    );
  }

  return (
    <section className="project-development">
      {toast && <Toast message={toast.message} type={toast.type} onClose={closeToast} />}

      {devToDelete && (
        <ConfirmModal
          title="Eliminar desarrollo"
          message={`¿Seguro que deseas eliminar "${devToDelete.name}"? Esta acción no se puede deshacer.`}
          confirmLabel="Eliminar"
          loading={saving}
          onConfirm={handleDelete}
          onCancel={() => setDevToDelete(null)}
        />
      )}

      {showTechModal && (
        <ManageTechnologiesModal
          onClose={closeTechModal}
          onChanged={refreshTechnologies}
          onSuccess={(msg) => showToast(msg, "success")}
        />
      )}

      <div className="card">
        <div className="card-header">
          <div>
            <span className="header_title">Desarrollos</span>
            <p className="project-subtitle">Repositorios y entornos del proyecto.</p>
          </div>
          {canEdit && (
            <div className="header-actions">
              <button type="button" className="btn-secondary" onClick={openTechModal} disabled={saving}>
                <Settings size={15} /> Tecnologías
              </button>
              <ActionButton icon={<Plus size={16} />} onClick={openAddForm} disabled={saving || showForm}>
                Nuevo desarrollo
              </ActionButton>
            </div>
          )}
        </div>

        {showForm && (
          <DevFormPanel
            register={register}
            errors={errors}
            editingDev={editingDev}
            technologies={technologies}
            saving={saving}
            onClose={closeForm}
            onSubmit={handleSubmitForm}
          />
        )}

        {!editingDev && (developments.length === 0 ? (
          <div className="empty-state">
            <Code2 size={38} />
            <h3>Sin desarrollos</h3>
            <p>Cuando se registren desarrollos aparecerán aquí.</p>
          </div>
        ) : (
          <div className="dev-grid">
            {developments.map((dev) => (
              <DevCard
                key={dev.id}
                dev={dev}
                canEdit={canEdit}
                saving={saving}
                onEdit={openEditForm}
                onDelete={setDevToDelete}
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};
