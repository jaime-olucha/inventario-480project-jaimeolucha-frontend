import { Navigate } from "react-router-dom";
import { useUserStore } from "@/infrastructure/store/user.store";
import type { SystemRole } from "@/domain/value-objects/SystemRole";
import { ROUTES } from "./routes";

interface PropsProtectedRoute {
  allowedRoles: SystemRole[];
  children: React.ReactElement;
}

export function ProtectedRoute({ allowedRoles, children }: PropsProtectedRoute) {
  const user = useUserStore((store) => store.user);
  const isInitialized = useUserStore((store) => store.isInitialized);

  if (!isInitialized) return null;

  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }

  return children;
}
