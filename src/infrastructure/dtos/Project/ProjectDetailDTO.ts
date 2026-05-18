
import type { ProjectDTO } from "./ProjectDTO";

export interface ProjectDetailDTO extends ProjectDTO {
  permissions: {
    can_edit: boolean;
    can_delete: boolean;
  };
}