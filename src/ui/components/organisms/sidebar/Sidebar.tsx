import { Link, NavLink } from "react-router-dom";
import { LogOut, PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import logoFull from "@/ui/assets/logo-480/480dev_white.webp";
import logoIcon from "@/ui/assets/logo-480/480_white.webp";
import { SIDEBAR_ITEMS } from "./sidebarConfig";
import { ROUTES } from "@/ui/routes/routes";
import { LogoUser } from "@/ui/components/atoms/logoUser/LogoUser";
import { useSidebar } from "./useSidebar";

export function Sidebar() {
  const { expanded, roleBadge, user, handleLogout, handleToggleExpanded } = useSidebar();

  return (
    <aside className={cn(
      "relative flex flex-col bg-white border-r border-sidebar-border",
      "transition-all duration-200 ease-linear",
      expanded ? "w-64" : "w-16"
    )}>
      <button
        onClick={handleToggleExpanded}
        className="absolute -right-9 top-4 z-10 p-2 text-gray-500 hover:text-gray-700 transition-colors"
      >
        <PanelLeft className="h-5 w-5 transition-transform duration-200" />
      </button>

      <div className="flex items-center justify-center h-20 border-sidebar-border">
        {expanded
          ? <img src={logoFull} alt="480DEV" className="h-8" />
          : <img src={logoIcon} alt="480" className="w-15 p-0 m-0" />
        }
      </div>

      <Link
        to={user ? ROUTES.USER.BY_ID(user.id) : '#'}
        className={cn(
          "flex items-center gap-3 py-3 mx-2 my-2 rounded-xl border-sidebar-border transition-colors bg-gray-50 hover:bg-gray-200",
          expanded ? "px-3" : "justify-center px-0 bg-transparent"
        )}
      >
        <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center font-bold text-black">
          <LogoUser user={user ?? undefined} />
        </div>
        {expanded && (
          <div className="flex flex-col min-w-0">
            <span className="font-semibold text-sm leading-tight">
              {user?.name} {user?.surname}
            </span>
            <span className="text-xs text-text-secondary mt-0.5">
              {roleBadge}
            </span>
          </div>
        )}
      </Link>

      <nav className="flex-1 px-2 py-4">
        <ul className="space-y-1">
          {SIDEBAR_ITEMS
            .filter((item) => user?.role != null && item.roles.includes(user.role))
            .map((item) => (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  title={!expanded ? item.label : undefined}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    !expanded && "justify-center",
                    isActive
                      ? "bg-primary text-black"
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {expanded && <span>{item.label}</span>}
                </NavLink>
              </li>
            ))}
        </ul>
      </nav>

      <div className="p-2 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className={cn(
            "flex w-full items-center gap-3 rounded-xl px-3 p-2.5 text-sm font-medium transition-colors text-red-600 hover:bg-red-100",
            !expanded && "justify-center w-full"
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {expanded && <span>Cerrar sesión</span>}
        </button>
      </div>
    </aside>
  );
}
