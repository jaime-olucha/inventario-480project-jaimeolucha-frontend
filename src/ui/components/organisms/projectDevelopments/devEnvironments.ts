import type { Environment } from "@/domain/value-objects/Environment";

export const ENV_ORDER: Environment[] = ["PRODUCTION", "PREPRODUCTION", "STAGE"];

export const ENV_LABEL: Record<Environment, string> = {
  PRODUCTION: "Producción",
  PREPRODUCTION: "Preproducción",
  STAGE: "Stage",
};

export const ENV_CLASS: Record<Environment, string> = {
  PRODUCTION: "env-badge--production",
  PREPRODUCTION: "env-badge--preproduction",
  STAGE: "env-badge--stage",
};
