import { useEffect, useState } from "react";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { SYSTEM_ROLES } from "@/domain/value-objects/SystemRole";
import { useFab } from "@/ui/hooks/useFab";
import { useModal } from "@/ui/hooks/useModal";
import { usePagination } from "@/ui/hooks/usePagination";
import { useFilters } from "@/ui/hooks/useFilters";
import type { CreateProjectRequest } from "@/domain/models/Project/CreateProjectRequest";
import type { UserProject } from "@/domain/models/User/UserProject";
import type { RefCallback } from "react";

const PAGE_LIMIT = 20;

export interface UseProjectPageReturn {
  projects: UserProject[];
  filtered: UserProject[];
  isAdmin: boolean;
  isModalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  page: number;
  isFirst: boolean;
  isLast: boolean;
  goNext: () => void;
  goPrev: () => void;
  search: string;
  setSearch: (value: string) => void;
  status: string;
  setStatus: (value: string) => void;
  btnRef: RefCallback<HTMLButtonElement>;
  showFab: boolean;
  handleCreateProject: (data: CreateProjectRequest) => Promise<void>;
}

export const useProjectPage = (): UseProjectPageReturn => {
  const { project: projectRepo, user: userRepo } = useRepositories();
  const userStore = useUserStore((store) => store.user);

  const [projects, setProjects] = useState<UserProject[]>([]);

  const { isOpen: isModalOpen, open: openModal, close: closeModal } = useModal();
  const { page, limit, isFirst, isLast, setIsLast, goNext, goPrev } = usePagination(PAGE_LIMIT);
  const { search, setSearch, status, setStatus, filtered } = useFilters(projects);
  const { btnRef, showFab } = useFab();

  const isAdmin = userStore?.role === SYSTEM_ROLES.ADMIN;

  useEffect(() => {
    if (!userStore) return;

    if (isAdmin) {
      projectRepo.getAll(page, limit).then((result) => {
        setProjects(result);
        setIsLast(result.length < limit);
      });
    } else {
      userRepo.getProjects(userStore.id).then((result) => {
        setProjects(result);
        setIsLast(result.length < limit);
      });
    }
  }, [userStore, projectRepo, userRepo, page, limit]);

  const handleCreateProject = async (data: CreateProjectRequest) => {
    await projectRepo.createProject(data);
    const result = await projectRepo.getAll(page, limit);
    setProjects(result);
    setIsLast(result.length < limit);
  };

  return {
    projects,
    filtered,
    isAdmin,
    isModalOpen,
    openModal,
    closeModal,
    page,
    isFirst,
    isLast,
    goNext,
    goPrev,
    search,
    setSearch,
    status,
    setStatus,
    btnRef,
    showFab,
    handleCreateProject,
  };
};
