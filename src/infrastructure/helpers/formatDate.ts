export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function toInputDate(date: Date | string): string {
  return new Date(date).toISOString().split("T")[0];
}
