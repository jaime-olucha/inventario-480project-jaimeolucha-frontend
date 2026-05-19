import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from "../../infrastructure/store/auth.store";
import { AppLayout } from "../layouts/AppLayout";
import { ROUTES } from "./routes";
import { ProtectedRoute } from "./ProtectedRoute";
import { SIDEBAR_ITEMS } from "../components/organisms/sidebar/sidebarConfig";
import { LoginPage } from "../pages/LoginPage/LoginPage";
import { ProjectDetailPage } from "../pages/Project/ProjectDetailPage/ProjectDetailPage";
import { ClientDetailPage } from "../pages/Client/ClientDetailPage/ClientDetailPage";
import { PersonalDetailPage } from "../pages/Personal/PersonalDetailPage/PersonalDetailPage";

export const AppRoutes = () => {
  const isAuthenticated = useAuthStore((store) => store.isAuthenticated);

  return (
    <Routes>
      <Route
        path={ROUTES.LOGIN}
        element={isAuthenticated ? <Navigate to={ROUTES.DASHBOARD} replace /> : <LoginPage />}
      />

      <Route
        path={ROUTES.DASHBOARD}
        element={isAuthenticated ? <AppLayout /> : <Navigate to={ROUTES.LOGIN} replace />}
      >
        {SIDEBAR_ITEMS.map(({ path, roles, page: Page }) => (
          <Route
            key={path}
            index={path === ROUTES.DASHBOARD}
            path={path !== ROUTES.DASHBOARD ? path : undefined}
            element={
              <ProtectedRoute allowedRoles={roles}>
                <Page />
              </ProtectedRoute>
            }
          />
        ))}

        <Route path={`${ROUTES.USER.LIST}/:id`} element={<PersonalDetailPage />} />
        <Route path={`${ROUTES.CLIENTS.LIST}/:id`} element={<ClientDetailPage />} />
        <Route path={`${ROUTES.PROJECTS.LIST}/:id`} element={<ProjectDetailPage />} />

        <Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
      </Route>

      <Route
        path="*"
        element={<Navigate to={isAuthenticated ? ROUTES.DASHBOARD : ROUTES.LOGIN} replace />}
      />
    </Routes>
  );
};
