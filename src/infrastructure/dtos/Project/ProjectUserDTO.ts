import type { EntityId } from "../../../domain/value-objects/EntityId";
import type { ProjectRoleDTO } from "./ProjectRoleDTO";


export interface ProjectUserDTO {
  app_user_id: EntityId;
  name: string;
  surname: string;
  role: ProjectRoleDTO;
  is_active?: boolean;
  is_user_active?: boolean;
}