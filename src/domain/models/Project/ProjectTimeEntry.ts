import type { TimeEntry } from "../User/TimeEntry";
import type { EntityId } from "@/domain/value-objects/EntityId";

export interface ProjectTimeEntry extends TimeEntry {
  userId: EntityId;
  name: string;
  surname: string;
}
