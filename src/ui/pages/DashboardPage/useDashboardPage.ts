import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useUserStore } from "@/infrastructure/store/user.store";
import { getErrorMessage } from "@/infrastructure/helpers/getErrorMessage";
import { getProjectColorMap } from "@/infrastructure/helpers/getProjectColorMap";
import { getRoleBadge } from "@/infrastructure/helpers/getRoleBadge";
import { today, getWeeklyHours } from "@/infrastructure/helpers/getTime";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import type { UserProject } from "@/domain/models/User/UserProject";
import type { UserTimeEntry } from "@/domain/models/User/UserTimeEntry";

const timeEntrySchema = z.object({
  projectId: z.string().min(1, "Selecciona un proyecto"),
  date: z.string().min(1, "La fecha es obligatoria"),
  hours: z.string().refine((value) => Number(value) > 0, { message: "Introduce un número de horas válido" }),
  comment: z.string().optional(),
});

type TimeEntryForm = z.infer<typeof timeEntrySchema>;

export interface UseDashboardPageReturn extends UseToastReturn {
  user: ReturnType<typeof useUserStore<ReturnType<typeof useUserStore>>>;
  roleBadge: string | null;
  projects: UserProject[];
  weeklyHours: ReturnType<typeof getWeeklyHours>;
  maxHours: number;
  totalHours: number;
  projectColorMap: ReturnType<typeof getProjectColorMap>;
  errors: ReturnType<typeof useForm<TimeEntryForm>>["formState"]["errors"];
  isSubmittingHours: boolean;
  handleSubmitHours: ReturnType<typeof useForm<TimeEntryForm>>["handleSubmit"];
  register: ReturnType<typeof useForm<TimeEntryForm>>["register"];
}

export const useDashboardPage = () => {
  const userStore = useUserStore((store) => store.user);
  const { user: userRepo } = useRepositories();
  const [projects, setProjects] = useState<UserProject[]>([]);
  const [timeEntries, setTimeEntries] = useState<UserTimeEntry[]>([]);
  const [isSubmittingHours, setIsSubmittingHours] = useState(false);

  const { toast, showToast, closeToast } = useToast();

  const weeklyHours = getWeeklyHours(timeEntries);
  const totalHours = weeklyHours.reduce((sum, day) => sum + day.total, 0);
  const maxHours = Math.max(...weeklyHours.map((d) => d.total), 1);
  const roleBadge = getRoleBadge(userStore?.role);
  const projectColorMap = getProjectColorMap(projects);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<TimeEntryForm>({
    resolver: zodResolver(timeEntrySchema),
    defaultValues: { projectId: "", date: today, hours: "", comment: "" },
  });

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
      showToast("Horas registradas correctamente.", "success");
    } catch (error) {
      showToast(getErrorMessage(error, "No se pudieron registrar las horas."));
    } finally {
      setIsSubmittingHours(false);
    }
  });

  useEffect(() => {
    if (!userStore) return;
    userRepo.getProjects(userStore.id).then((userProjects) => {
      setProjects(userProjects);
      setValue("projectId", String(userProjects[0]?.id ?? ""));
    });
    userRepo.getTimeEntries(userStore.id).then(setTimeEntries);
  }, [userStore, userRepo]);

  return {
    user: userStore,
    roleBadge,
    projects,
    weeklyHours,
    maxHours,
    totalHours,
    projectColorMap,
    errors,
    isSubmittingHours,
    handleSubmitHours,
    register,
    toast,
    showToast,
    closeToast,
  };
};
