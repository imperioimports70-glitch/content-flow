import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { useAuth } from "@/providers/AuthProvider";

type AgenciaRow = Database["public"]["Tables"]["agencias"]["Row"];
type PerfilRow = Database["public"]["Tables"]["perfis"]["Row"];
type PlanoRow = Database["public"]["Tables"]["planos"]["Row"];

export interface AgenciaContextValue {
  perfil: PerfilRow | null;
  agencia: AgenciaRow | null;
  plano: PlanoRow | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  ensureProvisioned: () => Promise<void>;
}

const AgenciaContext = createContext<AgenciaContextValue | null>(null);

export function AgenciaProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const supabase = getSupabaseBrowserClient();
  const [perfil, setPerfil] = useState<PerfilRow | null>(null);
  const [agencia, setAgencia] = useState<AgenciaRow | null>(null);
  const [plano, setPlano] = useState<PlanoRow | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setPerfil(null);
      setAgencia(null);
      setPlano(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const perfilRes = await supabase.from("perfis").select("*").eq("id", user.id).maybeSingle();
    if (perfilRes.error) {
      setError(perfilRes.error.message);
      setLoading(false);
      return;
    }
    let perfilRow = perfilRes.data;

    if (!perfilRow && session?.access_token) {
      const { error: fnError } = await supabase.functions.invoke("provision-tenant", {
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
      if (fnError) {
        setError(fnError.message);
        setLoading(false);
        return;
      }
      const retry = await supabase.from("perfis").select("*").eq("id", user.id).maybeSingle();
      if (retry.error) {
        setError(retry.error.message);
        setLoading(false);
        return;
      }
      perfilRow = retry.data;
    }

    if (!perfilRow) {
      setPerfil(null);
      setAgencia(null);
      setPlano(null);
      setLoading(false);
      return;
    }

    setPerfil(perfilRow);

    if (perfilRow.agencia_id == null) {
      setAgencia(null);
      setPlano(null);
      setLoading(false);
      return;
    }

    const { data: agRow, error: ae } = await supabase
      .from("agencias")
      .select("*")
      .eq("id", perfilRow.agencia_id)
      .maybeSingle();

    if (ae) {
      setError(ae.message);
      setLoading(false);
      return;
    }
    setAgencia(agRow);

    if (agRow?.plano_id) {
      const { data: planoRow } = await supabase.from("planos").select("*").eq("id", agRow.plano_id).maybeSingle();
      setPlano(planoRow);
    } else {
      setPlano(null);
    }
    setLoading(false);
  }, [supabase, user]);

  useEffect(() => {
    void load();
  }, [load]);

  const ensureProvisioned = useCallback(async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.access_token) return;
    const { error: fnError } = await supabase.functions.invoke("provision-tenant", {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (fnError) {
      setError(fnError.message);
      return;
    }
    await load();
  }, [supabase, load]);

  const value = useMemo<AgenciaContextValue>(
    () => ({
      perfil,
      agencia,
      plano,
      loading,
      error,
      refetch: load,
      ensureProvisioned,
    }),
    [perfil, agencia, plano, loading, error, load, ensureProvisioned],
  );

  return <AgenciaContext.Provider value={value}>{children}</AgenciaContext.Provider>;
}

export function useAgencia(): AgenciaContextValue {
  const ctx = useContext(AgenciaContext);
  if (!ctx) throw new Error("useAgencia deve ser usado dentro de AgenciaProvider");
  return ctx;
}
