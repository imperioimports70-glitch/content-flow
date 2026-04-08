import type { StatusAssinatura } from "@/lib/supabase/database.types";

export interface AgenciaSubscriptionInput {
  status_assinatura: StatusAssinatura;
  trial_ends_at: string | null;
}

/**
 * Assinatura válida para uso do produto: active ou trial ainda dentro do prazo.
 */
export function hasActiveSubscription(agencia: AgenciaSubscriptionInput | null): boolean {
  if (!agencia) return false;
  if (agencia.status_assinatura === "active") return true;
  if (agencia.status_assinatura === "trial" && agencia.trial_ends_at) {
    return new Date(agencia.trial_ends_at) > new Date();
  }
  return false;
}
