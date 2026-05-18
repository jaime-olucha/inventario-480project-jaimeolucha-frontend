import type { EntityId } from "@/domain/value-objects/EntityId";

export interface UpdateProjectRequest {
  name: string;
  description: string;
  startDate: string;
  isActive: boolean;
  clientId: EntityId;
}
