import type { EntityId } from "@/domain/value-objects/EntityId";
import type { Technology } from "./Technology";
import type { Link } from "./Link";



export interface Development {
  id: EntityId;
  name: string;
  description?: string;
  technology: Technology;
  urlRepository: string
  links: Link[];
}