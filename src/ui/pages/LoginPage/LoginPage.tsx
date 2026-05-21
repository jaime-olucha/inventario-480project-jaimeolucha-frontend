import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useAuthStore } from '../../../infrastructure/store/auth.store'
import type { LoginFormData } from "./loginSchema";
import { loginSchema } from "./loginSchema";
import { useRepositories } from "../../../infrastructure/RepositoryContext/RepositoryContext";
import { Toast } from "../../components/molecules/toast/Toast";
import logoWhite from "../../assets/logo-480/480dev_white.webp";
import './LoginPage.scss';


export const LoginPage = () => {
  const setTokens = useAuthStore((state) => state.setTokens);
  const { auth } = useRepositories();
  const [sessionMessage] = useState<{ message: string; type: "success" | "error" } | null>(() => {
    const raw = sessionStorage.getItem('sessionMessage');
    sessionStorage.removeItem('sessionMessage');
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  });
  const [errorToast, setErrorToast] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting }
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await auth.login(data);
      setTokens(response.token, response.refreshToken);
    } catch {
      setErrorToast("Credenciales incorrectas. Inténtalo de nuevo.");
    }
  }

  return (
    <section className="login-page" >
      <div className="login-page_header">
        <img src={logoWhite} alt="Logo 480DEV" />
        <h1>Gestión de Proyectos</h1>
        <p>Ingresa con tu correo corporativo</p>
      </div>

      {sessionMessage && (
        <Toast message={sessionMessage.message} type={sessionMessage.type} onClose={() => { }} />
      )}
      {errorToast && (
        <Toast message={errorToast} type="error" onClose={() => setErrorToast(null)} />
      )}

      <form className="login-page_form" onSubmit={handleSubmit(onSubmit)}>
        <div>
          <label htmlFor="email" className="form_label">Correo Corporativo</label>
          <input type="email" id="email" className="form_input" placeholder="tu.correo@480.com" {...register("email")} />
          {errors.email && <p>{errors.email.message}</p>}
        </div>
        <div>
          <label htmlFor="password" className="form_label">Contraseña</label>
          <input type="password" id="password" className="form_input" placeholder="****" {...register("password")} />
          {errors.password && <p>{errors.password.message}</p>}
        </div>
        <button type="submit" className="form_btn" disabled={isSubmitting}>
          {isSubmitting ? "Entrando..." : "Iniciar Sesión"}
        </button>
      </form>
    </section>
  )
}
