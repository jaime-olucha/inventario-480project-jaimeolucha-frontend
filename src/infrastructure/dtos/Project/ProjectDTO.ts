import type { EntityId } from "@/domain/value-objects/EntityId";

export interface ProjectDTO {
  id: EntityId;
  name: string;
  description?: string;
  start_date: Date;
  is_active: boolean;
  client: {
    id: EntityId;
    name: string;
  }
}

