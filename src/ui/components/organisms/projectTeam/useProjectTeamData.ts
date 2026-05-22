import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import type { ProjectUser } from "@/domain/models/Project/ProjectUser";
import type { ProjectRole } from "@/domain/models/Project/ProjectRole";
import type { User } from "@/domain/models/User/User";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface UseProjectTeamDataReturn {
  team: ProjectUser[];
  users: User[];
  projectRoles: ProjectRole[];
  loading: boolean;
  error: string | null;
  refreshTeam: () => Promise<void>;
}

export const useProjectTeamData = (): UseProjectTeamDataReturn => {
  const { id } = useParams<{ id: EntityId }>();
  const { project: projectRepo, user: userRepo } = useRepositories();

  const [team, setTeam] = useState<ProjectUser[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [projectRoles, setProjectRoles] = useState<ProjectRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  return { team, users, projectRoles, loading, error, refreshTeam };
};
