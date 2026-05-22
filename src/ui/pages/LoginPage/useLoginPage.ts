import { useState } from "react";
import { useForm, type UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/infrastructure/store/auth.store";
import { useRepositories } from "@/infrastructure/RepositoryContext/RepositoryContext";
import { useToast, type UseToastReturn } from "@/ui/hooks/useToast";
import { loginSchema, type LoginFormData } from "./loginSchema";
import type { ToastState } from "@/ui/hooks/useToast";

export interface UseLoginPageReturn extends UseToastReturn {
  sessionMessage: ToastState | null;
  closeSessionMessage: () => void;
  form: UseFormReturn<LoginFormData>;
  onSubmit: (data: LoginFormData) => Promise<void>;
}

export const useLoginPage = (): UseLoginPageReturn => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const { auth } = useRepositories();

  const [sessionMessage, setSessionMessage] = useState<ToastState | null>(() => {
    const raw = sessionStorage.getItem("sessionMessage");
    sessionStorage.removeItem("sessionMessage");
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });
  const closeSessionMessage = () => setSessionMessage(null);

  const { toast, showToast, closeToast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await auth.login(data);
      setTokens(response.token, response.refreshToken);
    } catch {
      showToast("Credenciales incorrectas. Inténtalo de nuevo.", "error");
    }
  };

  return {
    sessionMessage,
    closeSessionMessage,
    form,
    onSubmit,
    toast,
    showToast,
    closeToast,
  };
};
