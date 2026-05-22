import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import { useEntityActions, type UseEntityActionsReturn } from "@/ui/hooks/useEntityActions";
import { ROUTES } from "@/ui/routes/routes";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { ProjectDetail } from "@/domain/models/Project/ProjectDetail";
import type { ProjectTab } from "@/ui/components/organisms/menuItem/ProjectMenuItem";

export interface UseProjectDetailPageReturn extends UseToastReturn, UseEntityActionsReturn {
  targetProject: ProjectDetail | undefined;
  activeTab: ProjectTab;
  canEdit: boolean;
  canDelete: boolean;
  setActiveTab: (tab: ProjectTab) => void;
  handleBack: () => void;
}

export const useProjectDetailPage = (): UseProjectDetailPageReturn => {
  const { id } = useParams<{ id: EntityId }>();
  const navigate = useNavigate();
  const { project: projectRepo } = useRepositories();

  const [targetProject, setTargetProject] = useState<ProjectDetail>();
  const [activeTab, setActiveTab] = useState<ProjectTab>("info");

  const { toast, showToast, closeToast } = useToast();

  const entityActions = useEntityActions({
    entityId: id,
    isActive: targetProject?.isActive,
    patchActive: (projectId, nextValue) => projectRepo.patchActive(projectId, nextValue),
    deleteEntity: (projectId) => projectRepo.deleteProject(projectId),
    onActiveChanged: (nextValue) => {
      setTargetProject((prev) => (prev ? { ...prev, isActive: nextValue } : prev));
    },
    onDeleted: () => {
      setTimeout(() => navigate(ROUTES.PROJECTS.LIST), 1500);
    },
    showToast,
    messages: {
      activateSuccess: "Activado correctamente",
      deactivateSuccess: "Inactivado correctamente",
      toggleError: () => "No se pudo completar la acción. Inténtalo de nuevo.",
      deleteSuccess: "Proyecto eliminado correctamente",
      deleteError: (error) => getErrorMessage(error, "No se pudo eliminar el proyecto."),
    },
  });

  useEffect(() => {
    if (!id) return;
    projectRepo.getById(id).then(setTargetProject);
  }, [id, projectRepo]);

  const canEdit = targetProject?.permissions.canEdit ?? false;
  const canDelete = targetProject?.permissions.canDelete ?? false;

  return {
    targetProject,
    activeTab,
    setActiveTab,
    canEdit,
    canDelete,
    handleBack: () => navigate(ROUTES.PROJECTS.LIST),
    toast,
    showToast,
    closeToast,
    ...entityActions,
  };
};
