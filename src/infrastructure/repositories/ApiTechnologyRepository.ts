import type { TechnologyRepository } from "@/domain/repositories/TechnologyRepository";
import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Technology } from "@/domain/models/Project/Technology";
import type { TechnologyDTO } from "@/infrastructure/dtos/Project/TechnologyDTO";
import { httpClient } from "../http/httpClient";
import { API_ENDPOINTS } from "../http/types/endpoints";
import { HttpMethod } from "../http/types/HttpMethods";
import { mapTechnology } from "../mappers/mapDevelopment";
import { v7 as uuidv7 } from "uuid";

export class ApiTechnologyRepository implements TechnologyRepository {

  async getAll(): Promise<Technology[]> {
    const response = await httpClient<TechnologyDTO[]>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.TECHNOLOGIES.LIST,
    });
    return response.map(mapTechnology);
  }

  async getById(id: EntityId): Promise<Technology> {
    const response = await httpClient<TechnologyDTO>({
      method: HttpMethod.GET,
      path: API_ENDPOINTS.TECHNOLOGIES.BY_ID(id),
    });
    return mapTechnology(response);
  }

  async create(name: string): Promise<void> {
    await httpClient<void, { id: string; name: string }>({
      method: HttpMethod.POST,
      path: API_ENDPOINTS.TECHNOLOGIES.CREATE,
      body: { id: uuidv7(), name },
    });
  }

  async update(id: EntityId, name: string): Promise<void> {
    await httpClient<void, { name: string }>({
      method: HttpMethod.PATCH,
      path: API_ENDPOINTS.TECHNOLOGIES.BY_ID(id),
      body: { name },
    });
  }

  async delete(id: EntityId): Promise<void> {
    await httpClient<void>({
      method: HttpMethod.DELETE,
      path: API_ENDPOINTS.TECHNOLOGIES.BY_ID(id),
    });
  }
}
