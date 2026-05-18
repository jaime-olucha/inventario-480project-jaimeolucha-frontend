import type { EntityId } from "../value-objects/EntityId";
import type { Technology } from "../models/Project/Technology";

export interface TechnologyRepository {
  getAll(): Promise<Technology[]>;
  getById(id: EntityId): Promise<Technology>;
  create(name: string): Promise<void>;
  update(id: EntityId, name: string): Promise<void>;
  delete(id: EntityId): Promise<void>;
}
