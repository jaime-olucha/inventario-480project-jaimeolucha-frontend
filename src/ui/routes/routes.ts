import type { EntityId } from "@/domain/value-objects/EntityId";

export const ROUTES = {
  LOGIN: "/login",
  DASHBOARD: "/",

  PROJECTS: {
    LIST: "/projects",
    BY_ID: (id: EntityId) => `/projects/${id}`,
  },

  CLIENTS: {
    LIST: "/clients",
    BY_ID: (id: EntityId) => `/clients/${id}`,
  },

  USER: {
    LIST: "/user",
    BY_ID: (id: EntityId) => `/user/${id}`,
    ME: () => `/me`,
  }
} as const;