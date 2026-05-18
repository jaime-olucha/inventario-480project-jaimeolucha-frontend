import type { Project } from "./Project";


export interface ProjectDetail extends Project {
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
  };
}