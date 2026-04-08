import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  Sparkles,
  Calendar,
  MessageSquare,
  BarChart3,
  Settings,
  Shield,
} from "lucide-react";
import { useAgencia } from "@/providers/AgenciaProvider";

const menuItems = [
  { label: "Visão Geral", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Meus Clientes", icon: Users, path: "/dashboard/clients" },
  { label: "Gerador de Conteúdo", icon: Sparkles, path: "/dashboard/content" },
  { label: "Calendário", icon: Calendar, path: "/dashboard/calendar" },
  { label: "Comentários", icon: MessageSquare, path: "/dashboard/comments" },
  { label: "Relatórios", icon: BarChart3, path: "/dashboard/reports" },
  { label: "Configurações", icon: Settings, path: "/dashboard/settings" },
];

const DashboardSidebar = () => {
  const location = useLocation();
  const { perfil, plano } = useAgencia();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  return (
    <aside className="w-[220px] shrink-0 h-screen sticky top-0 bg-card border-r border-border flex flex-col">
      <div className="px-5 py-4 border-b border-border">
        <Link to="/dashboard" className="text-base font-semibold text-foreground tracking-tight">
          ContentFlow.ai
        </Link>
      </div>
      <nav className="flex-1 py-4 space-y-1 px-3 overflow-y-auto">
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                active
                  ? "bg-elevation text-foreground border-l-2 border-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-elevation"
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
        {perfil?.role === "master" && (
          <Link
            to="/dashboard/master"
            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
              isActive("/dashboard/master")
                ? "bg-elevation text-foreground border-l-2 border-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-elevation"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Master</span>
          </Link>
        )}
      </nav>
      <div className="px-5 py-4 border-t border-border space-y-3">
        <span className="inline-block text-xs font-medium bg-primary/10 text-primary px-2 py-1 rounded">
          {plano?.nome ?? "Plano"}
        </span>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-md bg-elevation flex items-center justify-center text-xs font-semibold text-foreground">
            {(perfil?.nome_completo ?? perfil?.email ?? "U").charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-foreground truncate">{perfil?.nome_completo ?? perfil?.email ?? "—"}</span>
        </div>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
