import type { EntityId } from "@/domain/value-objects/EntityId";

export interface UpdateProjectRequestDTO {
  name: string;
  description: string;
  start_date: string;
  is_active: boolean;
  client_id: EntityId;
}
