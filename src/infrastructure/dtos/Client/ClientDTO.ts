import type { EntityId } from "../../../domain/value-objects/EntityId";

export interface ClientDTO {
  id: EntityId;
  name: string;
  sector: {
    id: EntityId;
    name: string;
  }
}