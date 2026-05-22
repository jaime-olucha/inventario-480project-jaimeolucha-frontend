import { useMemo, useState } from "react";
import { getFullName } from "./useProjectTeam";
import type { ProjectUser } from "@/domain/models/Project/ProjectUser";

export interface UseTeamFiltersReturn {
  search: string;
  setSearch: (value: string) => void;
  roleFilter: string;
  setRoleFilter: (value: string) => void;
  filteredTeam: ProjectUser[];
}

export const useTeamFilters = (activeTeam: ProjectUser[]): UseTeamFiltersReturn => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const filteredTeam = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return activeTeam.filter((member) => {
      if (roleFilter && member.role.name !== roleFilter) return false;
      return !normalizedSearch || getFullName(member).toLowerCase().includes(normalizedSearch);
    });
  }, [search, roleFilter, activeTeam]);

  return { search, setSearch, roleFilter, setRoleFilter, filteredTeam };
};
