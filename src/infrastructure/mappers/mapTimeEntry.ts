import type { UserTimeEntry } from "../../domain/models/User/UserTimeEntry";
import type { UserTimeEntryDTO } from "@/infrastructure/dtos/User/UserTimeEntriyDTO";
import type { ProjectTimeEntryDTO } from "@/infrastructure/dtos/Project/ProjectTimeEntryDTO";
import type { ProjectTimeEntry } from "../../domain/models/Project/ProjectTimeEntry";

export const mapUserTimeEntry = (dto: UserTimeEntryDTO): UserTimeEntry => ({
  id: dto.id,
  date: dto.date,
  hours: Number(dto.hour),
  comment: dto.comment,
  projectId: dto.project.id,
  projectName: dto.project.name
});


export const mapProjectTimeEntry = (dto: ProjectTimeEntryDTO): ProjectTimeEntry => ({
  id: dto.id,
  userId: dto.id_user,
  date: dto.date,
  hours: Number(dto.hour),
  comment: dto.comment,
  name: dto.name,
  surname: dto.surname,
});
