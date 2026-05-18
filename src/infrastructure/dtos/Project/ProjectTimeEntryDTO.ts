import type { TimeEntryDTO } from "../User/TimeEntryDTO";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface ProjectTimeEntryDTO extends TimeEntryDTO {
  id_user: EntityId;
  name: string;
  surname: string;
}