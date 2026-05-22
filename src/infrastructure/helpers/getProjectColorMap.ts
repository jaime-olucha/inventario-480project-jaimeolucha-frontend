import type { UserProject } from "@/domain/models/User/UserProject";

const PROJECT_COLORS = [
  "#00b341", "#3b82f6", "#f59e0b", "#8b5cf6",
  "#ec4899", "#06b6d4", "#f97316", "#14b8a6"
];

export const getProjectColorMap = (projects: UserProject[]) => {
  return new Map(
    projects.map((project, i) => [
      String(project.id),
      PROJECT_COLORS[i % PROJECT_COLORS.length]
    ])
  );
};
