import type { EntityId } from "@/domain/value-objects/EntityId";
import type { LinkDTO } from "./LinkDTO";
import type { TechnologyDTO } from "./TechnologyDTO";

export interface DevelopmentDTO {
  id: EntityId;
  name: string;
  description?: string;
  technology: TechnologyDTO;
  url_repository: string
  links: LinkDTO[];
}