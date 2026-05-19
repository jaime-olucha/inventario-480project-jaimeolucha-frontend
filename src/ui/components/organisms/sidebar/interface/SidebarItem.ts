import type { SystemRole } from "@/domain/value-objects/SystemRole";

export interface SidebarItem {
  label: string;
  path: string;
  icon: React.ElementType;
  roles: SystemRole[];
  page: React.ComponentType;
}