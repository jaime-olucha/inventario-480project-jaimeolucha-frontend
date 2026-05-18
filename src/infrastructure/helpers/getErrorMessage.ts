export const getErrorMessage = (err: unknown, fallback = "Algo salió mal. Inténtalo de nuevo."): string => {
  if (err instanceof Error && err.message && !err.message.startsWith("HTTP")) {
    return err.message;
  }
  return fallback;
};