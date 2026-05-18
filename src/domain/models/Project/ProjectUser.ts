import type { EntityId } from "@/domain/value-objects/EntityId";
import type { ProjectRole } from "./ProjectRole";


export interface ProjectUser {
  userId: EntityId;
  name: string;
  surname: string;
  role: ProjectRole;
  isActive: boolean;
}