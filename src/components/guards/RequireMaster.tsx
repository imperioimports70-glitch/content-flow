import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { useAgencia } from "@/providers/AgenciaProvider";

export function RequireMaster({ children }: { children: ReactNode }) {
  const { perfil, loading } = useAgencia();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Carregando…
      </div>
    );
  }

  if (perfil?.role !== "master") {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
