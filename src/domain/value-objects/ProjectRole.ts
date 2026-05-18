export const PROJECT_ROLES = {
  PROJECT_MANAGER: "PROJECT_MANAGER",
  KAM: "KAM",
  DEVELOPER: "DEVELOPER",
  TECH_LEADER: "TECH_LEADER",
} as const;

export type ProjectRoleName = typeof PROJECT_ROLES[keyof typeof PROJECT_ROLES];

const ROLE_LABELS: Record<string, string> = {
  PROJECT_MANAGER: "Project Manager",
  KAM: "KAM",
  DEVELOPER: "Developer",
  TECH_LEADER: "Tech Leader",
};

const ROLE_ALIASES: Record<string, string> = {
  KEY_ACCOUNT_MANAGER: "KAM",
};

export function normalizeRoleName(roleName: string): string {
  return ROLE_ALIASES[roleName] ?? roleName;
}

export function getProjectRoleLabel(roleName: string): string {
  const normalized = normalizeRoleName(roleName);
  return ROLE_LABELS[normalized] ?? normalized.replaceAll("_", " ");
}
