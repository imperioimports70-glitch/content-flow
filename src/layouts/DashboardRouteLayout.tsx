import { Outlet } from "react-router-dom";
import { RequireAuth } from "@/components/guards/RequireAuth";
import { AgenciaProvider } from "@/providers/AgenciaProvider";
import { ClienteWorkspaceProvider } from "@/providers/ClienteWorkspaceProvider";

/**
 * Protege /dashboard/* e injeta contexto de agência + workspace (cliente) ativo.
 */
export function DashboardRouteLayout() {
  return (
    <RequireAuth>
      <AgenciaProvider>
        <ClienteWorkspaceProvider>
          <Outlet />
        </ClienteWorkspaceProvider>
      </AgenciaProvider>
    </RequireAuth>
  );
}
