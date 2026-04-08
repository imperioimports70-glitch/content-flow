import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAgencia } from "@/providers/AgenciaProvider";
import { hasActiveSubscription } from "@/lib/subscription";

interface SubscriptionGateProps {
  children: ReactNode;
}

/**
 * Bloqueia conteúdo quando não há assinatura/trial válidos (exceto usuário master).
 */
export function SubscriptionGate({ children }: SubscriptionGateProps) {
  const { agencia, perfil, loading } = useAgencia();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 text-sm text-muted-foreground">
        Verificando assinatura…
      </div>
    );
  }

  if (perfil?.role === "master") {
    return <>{children}</>;
  }

  if (hasActiveSubscription(agencia)) {
    return <>{children}</>;
  }

  return (
    <div className="max-w-lg mx-auto card-surface rounded-xl p-8 text-center space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Assinatura necessária</h2>
      <p className="text-sm text-muted-foreground">
        Ative um plano ou renove seu trial para usar o gerador de conteúdo e recursos de IA.
      </p>
      <Button asChild>
        <Link to="/dashboard/settings">Ir para assinatura</Link>
      </Button>
    </div>
  );
}
