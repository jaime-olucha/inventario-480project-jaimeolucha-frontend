import type { UserRepository } from "@/domain/repositories/UserRepository";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { User } from "@/domain/models/User/User";
import type { CreateUserRequest } from "@/domain/models/User/CreateUserRequest";
import type { UserProject } from "@/domain/models/User/UserProject";
import type { UserDTO } from "@/infrastructure/dtos/User/UserDTO";
import type { CreateUserRequestDTO } from "@/infrastructure/dtos/User/CreateUserRequestDTO";
import type { UserProjectDTO } from "@/infrastructure/dtos/User/UserProjectDTO";
import type { UpdateUserRequest } from "@/domain/models/User/UpdateUserRequest";
import type { UpdateUserRequestDTO } from "@/infrastructure/dtos/User/UpdateUserRequestDTO";
import type { CreateTimeEntryRequest } from "@/domain/models/User/CreateTimeEntryRequest";
import type { CreateTimeEntryRequestDTO } from "@/infrastructure/dtos/User/CreateTimeEntryRequestDTO";
import { httpClient } from "../http/httpClient";
import { API_ENDPOINTS } from "../http/types/endpoints";
import { HttpMethod } from "../http/types/HttpMethods";
import { mapUser, mapUpdateUserRequest, mapChangePassword } from "../mappers/mapUser";
import { mapUserProject } from "../mappers/mapUserProject";
import { mapUserTimeEntry } from "../mappers/mapTimeEntry";
import { v7 as uuidv7 } from "uuid";
import type { UserTimeEntry } from "@/domain/models/User/UserTimeEntry";
import type { UserTimeEntryDTO } from "../dtos/User/UserTimeEntriyDTO";
import type { ChangePassword } from "@/domain/models/User/ChangePassword";
import type { ChangePasswordDTO } from "../dtos/User/ChangePasswordDTO";
import type { AdminChangePasswordDTO } from "../dtos/User/AdminChangePasswordDTO";

export class ApiUserRepository implements UserRepository {
  async getAll(page: number, limit: number): Promise<User[]> {
    const response = await httpClient<UserDTO[]>({
      method: HttpMethod.GET,
      path: `${API_ENDPOINTS.USERS.LIST}?page=${page}&limit=${limit}`,
    });
    return response.map(mapUser);
  }

  async getById(id: EntityId): Promise<User> {
    const response = await httpClient<UserDTO>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.USERS.BY_ID(id),
    });
    return mapUser(response);
  }

  async getProjects(id: EntityId): Promise<UserProject[]> {
    const response = await httpClient<UserProjectDTO[]>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.USERS.PROJECTS(id),
    });
    return response.map(mapUserProject);
  }

  async getTimeEntries(id: EntityId): Promise<UserTimeEntry[]> {
    const response = await httpClient<UserTimeEntryDTO[] | { data?: UserTimeEntryDTO[]; items?: UserTimeEntryDTO[]; results?: UserTimeEntryDTO[]; time_entries?: UserTimeEntryDTO[] }>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.USERS.TIME_ENTRIES(id),
    });

    const entries = Array.isArray(response)
      ? response
      : response.data ?? response.items ?? response.results ?? response.time_entries ?? [];

    return entries.map(mapUserTimeEntry);
  }

  async createTimeEntry(id: EntityId, data: CreateTimeEntryRequest): Promise<void> {
    const body: CreateTimeEntryRequestDTO = {
      id: uuidv7(),
      project_id: data.projectId,
      date: data.date,
      hour: data.hours,
      comment: data.comment,
    };

    await httpClient<void, CreateTimeEntryRequestDTO>({
      method: HttpMethod.POST,
      path: API_ENDPOINTS.USERS.TIME_ENTRIES(id),
      body,
    });
  }

  async createUser(data: CreateUserRequest): Promise<void> {
    const body: CreateUserRequestDTO = { id: uuidv7(), ...data };
    await httpClient<void, CreateUserRequestDTO>({
      method: HttpMethod.POST,
      path: API_ENDPOINTS.USERS.CREATE,
      body,
    });
  }

  async patchActive(id: EntityId, isActive: boolean): Promise<void> {
    await httpClient<void, { is_active: boolean }>({
      method: HttpMethod.PATCH,
      path: API_ENDPOINTS.USERS.BY_ID(id),
      body: { is_active: isActive },
    });
  }

  async deleteUser(id: EntityId): Promise<void> {
    await httpClient<void>({
      method: HttpMethod.DELETE,
      path: API_ENDPOINTS.USERS.BY_ID(id),
    });
  }

  async putUser(id: EntityId, data: UpdateUserRequest): Promise<void> {
    const body = mapUpdateUserRequest(data);
    await httpClient<void, UpdateUserRequestDTO>({
      method: HttpMethod.PUT,
      path: API_ENDPOINTS.USERS.BY_ID(id),
      body,
    });
  }

  async patchPassword(id: EntityId, data: ChangePassword): Promise<void> {
    const body = mapChangePassword(data);
    await httpClient<void, ChangePasswordDTO>({
      method: HttpMethod.PATCH,
      path: API_ENDPOINTS.USERS.PASSWORD_CHANGE(id),
      body,
    });
  }

  async patchAdminPassword(id: EntityId, newPassword: string): Promise<void> {
    await httpClient<void, AdminChangePasswordDTO>({
      method: HttpMethod.PATCH,
      path: API_ENDPOINTS.USERS.ADMIN_PASSWORD_CHANGE(id),
      body: { new_password: newPassword },
    });
  }
}
