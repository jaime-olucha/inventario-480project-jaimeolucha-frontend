import type { ProjectRepository } from "@/domain/repositories/ProjectRepository";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { ProjectListItem } from "@/domain/models/Project/ProjectListItem";
import type { ProjectDetail } from "@/domain/models/Project/ProjectDetail";
import type { ProjectUser } from "@/domain/models/Project/ProjectUser";
import type { ProjectRole } from "@/domain/models/Project/ProjectRole";
import type { Development } from "@/domain/models/Project/Development";
import type { ProjectTimeEntry } from "@/domain/models/Project/ProjectTimeEntry";
import type { ProjectListItemDTO } from "@/infrastructure/dtos/Project/ProjectListItemDTO";
import type { ProjectDetailDTO } from "@/infrastructure/dtos/Project/ProjectDetailDTO";
import type { ProjectUserDTO } from "@/infrastructure/dtos/Project/ProjectUserDTO";
import type { ProjectRoleDTO } from "@/infrastructure/dtos/Project/ProjectRoleDTO";
import type { DevelopmentDTO } from "@/infrastructure/dtos/Project/DevelopmentDTO";
import type { ProjectTimeEntryDTO } from "@/infrastructure/dtos/Project/ProjectTimeEntryDTO";
import { httpClient } from "../http/httpClient";
import { API_ENDPOINTS } from "../http/types/endpoints";
import { HttpMethod } from "../http/types/HttpMethods";
import { mapProjectListItem, mapProjectDetail, mapProjectUser, mapProjectRole } from "../mappers/mapProject";
import { mapDevelopment } from "../mappers/mapDevelopment";
import { mapProjectTimeEntry } from "../mappers/mapTimeEntry";
import type { CreateProjectRequest } from "@/domain/models/Project/CreateProjectRequest";
import type { CreateProjectRequestDTO } from "../dtos/Project/CreateProjectRequestDTO";
import type { UpdateProjectRequest } from "@/domain/models/Project/UpdateProjectRequest";
import type { UpdateProjectRequestDTO } from "../dtos/Project/UpdateProjectRequestDTO";
import type { CreateDevelopmentRequest } from "@/domain/models/Project/CreateDevelopmentRequest";
import type { UpdateDevelopmentRequest } from "@/domain/models/Project/UpdateDevelopmentRequest";
import { v7 as uuidv7 } from "uuid";
import { mapUpdateProject } from "../mappers/mapProject";

export class ApiProjectRepository implements ProjectRepository {
  async getAll(page: number, limit: number): Promise<ProjectListItem[]> {
    const response = await httpClient<ProjectListItemDTO[]>({
      method: HttpMethod.GET,
      path: `${API_ENDPOINTS.PROJECTS.LIST}?page=${page}&limit=${limit}`,
    });
    return response.map(mapProjectListItem);
  }

  async getById(id: EntityId): Promise<ProjectDetail> {
    const response = await httpClient<ProjectDetailDTO>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.PROJECTS.BY_ID(id),
    });
    return mapProjectDetail(response);
  }

  async getUsers(id: EntityId): Promise<ProjectUser[]> {
    const response = await httpClient<ProjectUserDTO[]>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.PROJECTS.USERS(id),
    });
    return response.map(mapProjectUser);
  }

  async getRoles(): Promise<ProjectRole[]> {
    const response = await httpClient<ProjectRoleDTO[]>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.PROJECT_ROLES.LIST,
    });
    return response.map(mapProjectRole);
  }

  async addUser(projectId: EntityId, userId: EntityId, roleId: EntityId): Promise<void> {
    await httpClient<void, { app_user_id: EntityId; project_role_id: EntityId }>({
      method: HttpMethod.POST,
      path: API_ENDPOINTS.PROJECTS.USERS(projectId),
      body: { app_user_id: userId, project_role_id: roleId },
    });
  }

  async updateUserRole(projectId: EntityId, userId: EntityId, roleId: EntityId): Promise<void> {
    await httpClient<void, { app_user_id: EntityId; project_role_id: EntityId }>({
      method: HttpMethod.PUT,
      path: API_ENDPOINTS.PROJECTS.USERS(projectId),
      body: { app_user_id: userId, project_role_id: roleId },
    });
  }

  async removeUser(projectId: EntityId, userId: EntityId): Promise<void> {
    await httpClient<void>({
      method: HttpMethod.DELETE,
      path: API_ENDPOINTS.PROJECTS.USER(projectId, userId),
    });
  }

  async patchUserActive(projectId: EntityId, userId: EntityId, isActive: boolean): Promise<void> {
    await httpClient<void, { is_active: boolean }>({
      method: HttpMethod.PATCH,
      path: API_ENDPOINTS.PROJECTS.USER(projectId, userId),
      body: { is_active: isActive },
    });
  }

  async getDevelopments(id: EntityId): Promise<Development[]> {
    const response = await httpClient<DevelopmentDTO[]>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.PROJECTS.DEVELOPMENTS(id),
    });
    return response.map(mapDevelopment);
  }

  async createDevelopment(projectId: EntityId, data: CreateDevelopmentRequest): Promise<void> {
    await httpClient<void, { id: string; name: string; description?: string; technology_id: EntityId; url_repository: string }>({
      method: HttpMethod.POST,
      path: API_ENDPOINTS.PROJECTS.DEVELOPMENTS(projectId),
      body: {
        id: uuidv7(),
        name: data.name,
        description: data.description,
        technology_id: data.technologyId,
        url_repository: data.urlRepository,
      },
    });
  }

  async updateDevelopment(projectId: EntityId, devId: EntityId, data: UpdateDevelopmentRequest): Promise<void> {
    await httpClient<void, { name: string; description?: string; technology_id: EntityId; url_repository: string; links: { environment: string; url: string }[] }>({
      method: HttpMethod.PUT,
      path: API_ENDPOINTS.PROJECTS.DEVELOPMENT_BY_ID(projectId, devId),
      body: {
        name: data.name,
        description: data.description,
        technology_id: data.technologyId,
        url_repository: data.urlRepository,
        links: data.links,
      },
    });
  }

  async deleteDevelopment(projectId: EntityId, devId: EntityId): Promise<void> {
    await httpClient<void>({
      method: HttpMethod.DELETE,
      path: API_ENDPOINTS.PROJECTS.DEVELOPMENT_BY_ID(projectId, devId),
    });
  }

  async getTimeEntries(id: EntityId): Promise<ProjectTimeEntry[]> {
    const response = await httpClient<ProjectTimeEntryDTO[]>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.PROJECTS.TIME_ENTRIES(id),
    });
    return response.map(mapProjectTimeEntry);
  }

  async getTimeEntryById(projectId: EntityId, entryId: EntityId): Promise<ProjectTimeEntry> {
    const response = await httpClient<ProjectTimeEntryDTO>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.PROJECTS.TIME_ENTRY_BY_ID(projectId, entryId),
    });
    return mapProjectTimeEntry(response);
  }

  async updateTimeEntry(projectId: EntityId, entryId: EntityId, data: { date: string; hours: number; comment: string }): Promise<void> {
    await httpClient<void, { date: string; hour: number; comment: string }>({
      method: HttpMethod.PUT,
      path: API_ENDPOINTS.PROJECTS.TIME_ENTRY_BY_ID(projectId, entryId),
      body: { date: data.date, hour: data.hours, comment: data.comment },
    });
  }

  async deleteTimeEntry(projectId: EntityId, entryId: EntityId): Promise<void> {
    await httpClient<void>({
      method: HttpMethod.DELETE,
      path: API_ENDPOINTS.PROJECTS.TIME_ENTRY_BY_ID(projectId, entryId),
    });
  }

  async createProject(data: CreateProjectRequest): Promise<void> {
    const body: CreateProjectRequestDTO = {
      id: uuidv7(),
      name: data.name,
      description: data.description,
      start_date: data.startDate || null,
      client_id: data.clientId
    };
    await httpClient<void, CreateProjectRequestDTO>({
      method: HttpMethod.POST,
      path: API_ENDPOINTS.PROJECTS.CREATE,
      body,
    });
  }

  async patchActive(id: EntityId, isActive: boolean): Promise<void> {
    await httpClient<void, { is_active: boolean }>({
      method: HttpMethod.PATCH,
      path: API_ENDPOINTS.PROJECTS.BY_ID_STATUS(id),
      body: { is_active: isActive },
    });
  }

  async deleteProject(id: EntityId): Promise<void> {
    await httpClient<void>({
      method: HttpMethod.DELETE,
      path: API_ENDPOINTS.PROJECTS.BY_ID(id),
    });
  }

  async putUser(id: EntityId, data: UpdateProjectRequest): Promise<void> {
    const body = mapUpdateProject(data);
    await httpClient<void, UpdateProjectRequestDTO>({
      method: HttpMethod.PUT,
      path: API_ENDPOINTS.PROJECTS.BY_ID(id),
      body,
    });
  }
}
