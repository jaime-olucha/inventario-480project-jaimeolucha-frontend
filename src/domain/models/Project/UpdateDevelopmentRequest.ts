import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Environment } from "@/domain/value-objects/Environment";

export interface UpdateDevelopmentRequest {
  name: string;
  description?: string;
  technologyId: EntityId;
  urlRepository: string;
  links: { environment: Environment; url: string }[];
}
