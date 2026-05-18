import type { EntityId } from "@/domain/value-objects/EntityId";

export interface CreateDevelopmentRequest {
  name: string;
  description?: string;
  technologyId: EntityId;
  urlRepository: string;
}
