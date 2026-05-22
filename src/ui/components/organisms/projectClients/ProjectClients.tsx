import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { ClientInfoCard } from "@/ui/components/organisms/clientInfoCard/ClientInfoCard";
import { Toast } from "@/ui/components/molecules/toast/Toast";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { ProjectDetail } from "@/domain/models/Project/ProjectDetail";
import { useToast } from "@/ui/hooks/useToast";

export const ProjectClients = () => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo } = useRepositories();
  const userStore = useUserStore((s) => s.user);
  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;

  const [projectDetail, setProjectDetail] = useState<ProjectDetail | null>(null);
  const { toast, showToast, closeToast } = useToast();

  useEffect(() => {
    if (!id) return;
    projectRepo.getById(id).then(setProjectDetail);
  }, [id, projectRepo]);

  if (!projectDetail) return null;

  return (
    <section className="project-clients">
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}

      <ClientInfoCard
        clientId={projectDetail.clientId}
        isAdmin={isAdmin}
        onToast={showToast}
      />
    </section>
  );
};
