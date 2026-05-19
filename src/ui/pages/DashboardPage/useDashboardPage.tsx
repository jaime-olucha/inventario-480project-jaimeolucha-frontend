import type { UserProject } from "@/domain/models/User/UserProject";
import type { UserTimeEntry } from "@/domain/models/User/UserTimeEntry";
import { getRoleBadge } from "@/infrastructure/helpers/getRoleBadge";
import { today, getWeeklyHours } from "@/infrastructure/helpers/getTime";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

export const useDashboardPage = () => {

  const PROJECT_COLORS = ["#00b341", "#3b82f6", "#f59e0b", "#8b5cf6", "#ec4899", "#06b6d4", "#f97316", "#14b8a6"];

  const timeEntrySchema = z.object({
    projectId: z.string().min(1, "Selecciona un proyecto"),
    date: z.string().min(1, "La fecha es obligatoria"),
    hours: z.string().refine((value) => Number(value) > 0, { message: "Introduce un número de horas válido" }),
    comment: z.string().optional(),
  });
  type TimeEntryForm = z.infer<typeof timeEntrySchema>;

  const userStore = useUserStore((store) => store.user);
  const { user: userRepo } = useRepositories();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [timeEntries, setTimeEntries] = useState<UserTimeEntry[]>([]);
  const [isSubmittingHours, setIsSubmittingHours] = useState(false);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TimeEntryForm>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: { projectId: "", date: today, hours: "", comment: "" },
  });

  const weeklyHours = getWeeklyHours(timeEntries);
  const totalHours = weeklyHours.reduce((sum, day) => sum + day.total, 0);
  const maxHours = Math.max(...weeklyHours.map((d) => d.total), 1);
  const roleBadge = getRoleBadge(userStore?.role);

  const projectColorMap = new Map(
    projects.map((project, i) => [String(project.id), PROJECT_COLORS[i % PROJECT_COLORS.length]])
  );

  useEffect(() => {
    if (!userStore) return;

    userRepo.getProjects(userStore.id).then((userProjects) => {
      setProjects(userProjects);
      setValue("projectId", String(userProjects[0]?.id ?? ""));
    });
    userRepo.getTimeEntries(userStore.id).then(setTimeEntries);

  }, [userStore, userRepo]);

  const handleSubmitHours = handleSubmit(async (data) => {
    if (!userStore) return;
    setIsSubmittingHours(true);
    try {
      await userRepo.createTimeEntry(userStore.id, {
        projectId: data.projectId,
        date: data.date,
        hours: Number(data.hours),
        comment: data.comment ?? "",
      });
      const updatedTimeEntries = await userRepo.getTimeEntries(userStore.id);
      setTimeEntries(updatedTimeEntries);
      reset({ projectId: data.projectId, date: today, hours: "", comment: "" });
    } catch {

    } finally {
      setIsSubmittingHours(false);
    }
  });

  return {
    user: userStore,
    roleBadge,
    projects,
    timeEntries,
    weeklyHours,
    maxHours,
    totalHours,
    projectColorMap,

    errors,
    isSubmittingHours,
    handleSubmitHours,
    register,
  }
}
