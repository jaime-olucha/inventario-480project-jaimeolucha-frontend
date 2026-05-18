import type { ProjectDetailDTO } from "@/infrastructure/dtos/Project/ProjectDetailDTO";
import type { ProjectDTO } from "@/infrastructure/dtos/Project/ProjectDTO";
import type { ProjectListItemDTO } from "@/infrastructure/dtos/Project/ProjectListItemDTO";
import type { Project } from "../../domain/models/Project/Project";
import type { ProjectDetail } from "../../domain/models/Project/ProjectDetail";
import type { ProjectListItem } from "../../domain/models/Project/ProjectListItem";
import type { ProjectRoleDTO } from "@/infrastructure/dtos/Project/ProjectRoleDTO";
import type { ProjectRole } from "../../domain/models/Project/ProjectRole";
import type { ProjectUserDTO } from "@/infrastructure/dtos/Project/ProjectUserDTO";
import type { ProjectUser } from "../../domain/models/Project/ProjectUser";
import type { UpdateProjectRequest } from "@/domain/models/Project/UpdateProjectRequest";
import type { UpdateProjectRequestDTO } from "../dtos/Project/UpdateProjectRequestDTO";
import { normalizeRoleName } from "@/domain/value-objects/ProjectRole";


export const mapProject = (dto: ProjectDTO): Project => ({
  id: dto.id,
  name: dto.name,
  description: dto.description,
  startDate: dto.start_date,
  isActive: dto.is_active,
  clientId: dto.client.id,
  clientName: dto.client.name,
});

export const mapProjectListItem = (dto: ProjectListItemDTO): ProjectListItem => ({
  ...mapProject(dto),
  teamMembers: dto.team_members,
});

export const mapProjectDetail = (dto: ProjectDetailDTO): ProjectDetail => ({
  ...mapProject(dto),
  permissions: {
    canEdit: dto.permissions?.can_edit ?? true,
    canDelete: dto.permissions?.can_delete ?? true,
  },
});

export const mapProjectRole = (dto: ProjectRoleDTO): ProjectRole => ({
  id: dto.id,
  name: normalizeRoleName(dto.name),
})

export const mapProjectUser = (dto: ProjectUserDTO): ProjectUser => ({
  userId: dto.app_user_id,
  name: dto.name,
  surname: dto.surname,
  role: mapProjectRole(dto.role),
  isActive: dto.is_user_active ?? dto.is_active ?? true,
})

export const mapUpdateProject = (request: UpdateProjectRequest): UpdateProjectRequestDTO => ({
  name: request.name,
  description: request.description,
  start_date: request.startDate,
  is_active: request.isActive,
  client_id: request.clientId
})