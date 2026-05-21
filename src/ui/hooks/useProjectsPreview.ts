import { useState } from "react";

export function useProjectsPreview<T extends { isActive: boolean }>(projects: T[], limit = 2) {
  const [showAllActive, setShowAllActive] = useState(false);
  const [showAllInactive, setShowAllInactive] = useState(false);

  const activeProjects = projects.filter((project) => project.isActive);
  const inactiveProjects = projects.filter((project) => !project.isActive);
  const visibleActive = showAllActive ? activeProjects : activeProjects.slice(0, limit);
  const visibleInactive = showAllInactive ? inactiveProjects : inactiveProjects.slice(0, limit);

  return {
    activeProjects,
    inactiveProjects,
    visibleActive,
    visibleInactive,
    showAllActive,
    showAllInactive,
    limit,
    setShowAllActive,
    setShowAllInactive,
  };
}
