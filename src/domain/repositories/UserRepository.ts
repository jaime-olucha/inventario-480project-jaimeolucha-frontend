import type { EntityId } from "../value-objects/EntityId";
import type { User } from "../models/User/User";
import type { CreateUserRequest } from "../models/User/CreateUserRequest";
import type { UpdateUserRequest } from "../models/User/UpdateUserRequest";
import type { UserProject } from "../models/User/UserProject";
import type { UserTimeEntry } from "../models/User/UserTimeEntry";
import type { CreateTimeEntryRequest } from "../models/User/CreateTimeEntryRequest";

export interface UserRepository {
  getAll(page: number, limit: number): Promise<User[]>;
  getById(id: EntityId): Promise<User>;
  getProjects(id: EntityId): Promise<UserProject[]>;
  getTimeEntries(id: EntityId): Promise<UserTimeEntry[]>;
  createTimeEntry(id: EntityId, data: CreateTimeEntryRequest): Promise<void>;
  createUser(data: CreateUserRequest): Promise<void>;
  patchActive(id: EntityId, isActive: boolean): Promise<void>;
  deleteUser(id: EntityId): Promise<void>;
  putUser(id: EntityId, data: UpdateUserRequest): Promise<void>;
  putPassword(id: EntityId): Promise<void>;
}
