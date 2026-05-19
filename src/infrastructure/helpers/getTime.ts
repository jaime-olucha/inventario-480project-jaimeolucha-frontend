import type { UserTimeEntry } from "../../domain/models/User/UserTimeEntry";

export interface DayProjectEntry {
  projectId: string;
  projectName: string;
  hours: number;
}

export interface WeekDay {
  day: string;
  dateISO: string;
  total: number;
  entries: DayProjectEntry[];
}

export const getWeeklyHours = (timeEntries: UserTimeEntry[]): WeekDay[] => {
  const days = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

  const today = new Date();
  const currentDay = today.getDay();
  const diffToMonday = currentDay === 0 ? 0 : 1 - currentDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  const week: WeekDay[] = days.map((label, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    return {
      day: `${label} ${date.getDate()} ${months[date.getMonth()]}`,
      dateISO: date.toISOString().split("T")[0],
      total: 0,
      entries: [],
    };
  });

  for (const entry of timeEntries) {
    const daySlot = week.find((d) => d.dateISO === entry.date);
    if (!daySlot) continue;

    daySlot.total += entry.hours;

    const existing = daySlot.entries.find((e) => e.projectId === String(entry.projectId));
    if (existing) {
      existing.hours += entry.hours;
    } else {
      daySlot.entries.push({
        projectId: String(entry.projectId),
        projectName: entry.projectName,
        hours: entry.hours,
      });
    }
  }

  return week;
};

export const today = new Date().toISOString().split("T")[0];
