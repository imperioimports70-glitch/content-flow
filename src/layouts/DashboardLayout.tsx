import { Outlet } from "react-router-dom";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { useAgencia } from "@/providers/AgenciaProvider";

const DashboardLayout = () => {
  const { loading, error, perfil } = useAgencia();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Carregando sua agência…
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 p-6 text-center">
        <p className="text-destructive text-sm">{error}</p>
        <p className="text-muted-foreground text-xs max-w-md">
          Confirme se as Edge Functions estão deployadas e se o schema foi aplicado no Supabase.
        </p>
      </div>
    );
  }

  if (!perfil) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-sm text-muted-foreground">
        Não foi possível carregar seu perfil. Tente sair e entrar novamente.
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
