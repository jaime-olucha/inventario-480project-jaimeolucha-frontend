import type { EntityId } from "@/domain/value-objects/EntityId";

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: `/login`,
    LOGOUT: `/logout`,
    MFA: `/mfa`,
    REFRESH: `/refresh`,
  },

  USERS: {
    LIST: `/users`,
    CREATE: `/users`,
    BY_ID: (id: EntityId) => `/users/${id}`,
    PROJECTS: (id: EntityId) => `/users/${id}/projects`,
    PASSWORD_CHANGE: (id: EntityId) => `/users/${id}/password-change`,
    ADMIN_PASSWORD_CHANGE: (id: EntityId) => `/users/${id}/admin-password`,
    TIME_ENTRIES: (id: EntityId) => `/users/${id}/time-entries`,
  },

  CLIENTS: {
    LIST: `/clients`,
    CREATE: `/clients`,
    BY_ID: (id: EntityId) => `/clients/${id}`,
    BY_ID_STATUS: (id: EntityId) => `/clients/${id}/change-status`,
    PROJECTS: (id: EntityId) => `/clients/${id}/projects`,
    CONTACTS: (id: EntityId) => `/clients/${id}/contacts`,
    CONTACT_ID: (id: EntityId, contact_id: EntityId) => `/clients/${id}/contacts/${contact_id}`,
  },

  SECTORS: {
    LIST: `/sectors`,
    BY_ID: (id: EntityId) => `/sectors/${id}`,
  },

  TECHNOLOGIES: {
    LIST: `/technologies`,
    CREATE: `/technologies`,
    BY_ID: (id: EntityId) => `/technologies/${id}`,
  },

  PROJECTS: {
    LIST: `/projects`,
    CREATE: `/projects`,
    BY_ID: (id: EntityId) => `/projects/${id}`,
    BY_ID_STATUS: (id: EntityId) => `/projects/${id}/change-status`,
    USERS: (id: EntityId) => `/projects/${id}/users`,
    USER: (projectId: EntityId, userId: EntityId) => `/projects/${projectId}/users/${userId}`,
    DEVELOPMENTS: (id: EntityId) => `/projects/${id}/developments`,
    DEVELOPMENT_BY_ID: (projectId: EntityId, devId: EntityId) => `/projects/${projectId}/developments/${devId}`,
    TIME_ENTRIES: (id: EntityId) => `/projects/${id}/time-entries`,
    TIME_ENTRY_BY_ID: (projectId: EntityId, entryId: EntityId) => `/projects/${projectId}/time-entries/${entryId}`,
  },

  PROJECT_ROLES: {
    LIST: `/project-roles`,
  },

} as const;
