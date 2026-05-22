import type { EntityId } from "@/domain/value-objects/EntityId";
import type { SystemRole } from "@/domain/value-objects/SystemRole";

export interface JwtPayload {
  id: EntityId;
  role: SystemRole;
  email: string;
  exp: number;
  iat: number;
}
