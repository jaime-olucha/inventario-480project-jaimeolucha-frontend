import { Toast } from "@/ui/components/molecules/toast/Toast";
import { useLoginPage } from "./useLoginPage";
import logoWhite from "@/ui/assets/logo-480/480dev_white.webp";
import "./LoginPage.scss";

export const LoginPage = () => {
  const {
    sessionMessage,
    closeSessionMessage,
    toast, closeToast,
    form: { register, handleSubmit, formState: { errors, isSubmitting } },
    onSubmit,
  } = useLoginPage();

  return (
    <section className="login-page">
      <div className="login-page_header">
        <img src={logoWhite} alt="Logo 480DEV" />
        <h1>Gestión de Proyectos</h1>
        <p>Ingresa con tu correo corporativo</p>
      </div>

      {sessionMessage && (
        <Toast message={sessionMessage.message} type={sessionMessage.type} onClose={closeSessionMessage} />
      )}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={closeToast} />
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
  );
};
