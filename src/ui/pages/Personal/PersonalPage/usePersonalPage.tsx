import type { CreateUserRequest } from "@/domain/models/User/CreateUserRequest";
import type { User } from "@/domain/models/User/User";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { usePagination } from "@/ui/hooks/usePagination";
import { useState, useRef, useEffect } from "react";


export const usePersonalPage = () => {
  const userStore = useUserStore((store) => store.user);
  const { user: userRepo } = useRepositories();
  const [users, setUsers] = useState<User[]>([]);
  const [activeProjectCounts, setActiveProjectCounts] = useState<Record<string, number>>({});
  const [showFab, setShowFab] = useState(false);
  const addBtnRef = useRef<HTMLButtonElement>(null);

  const PAGE_LIMIT = 20;
  const { page, limit, isFirst, isLast, setIsLast, goNext, goPrev } = usePagination(PAGE_LIMIT);

  useEffect(() => {
    if (!userStore) return;
    userRepo.getAll(page, limit).then(result => {
      setUsers(result);
      setIsLast(result.length < limit);
    });
  }, [userRepo, page, limit]);

  useEffect(() => {
    if (users.length === 0) return;
    users.forEach(user => {
      userRepo.getProjects(user.id).then(projects => {
        setActiveProjectCounts(prev => ({
          ...prev,
          [String(user.id)]: projects.filter(p => p.isActive).length,
        }));
      });
    });
  }, [users]);

  useEffect(() => {
    const btn = addBtnRef.current;
    if (!btn) return;
    const observer = new IntersectionObserver(
      ([entry]) => setShowFab(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(btn);
    return () => observer.disconnect();
  }, []);

  const handleCreateUser = async (data: CreateUserRequest) => {
    await userRepo.createUser(data);
    const result = await userRepo.getAll(page, limit);
    setUsers(result);
    setIsLast(result.length < limit);
  };

  return {
    activeProjectCounts,
    showFab,
    isFirst,
    isLast,
    page,
    users,

    goNext,
    goPrev,
    handleCreateUser,
  }
}
