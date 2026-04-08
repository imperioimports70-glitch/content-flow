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
import { CLIENTE_WORKSPACE_PUBLIC_COLUMNS } from "@/lib/cliente-fields";
import { useAgencia } from "@/providers/AgenciaProvider";

const STORAGE_KEY = "contentflow.active_cliente_id";

type ClienteSafe = Pick<
  Database["public"]["Tables"]["clientes_workspace"]["Row"],
  | "id"
  | "agencia_id"
  | "nome"
  | "segmento"
  | "sobre_marca"
  | "tom_de_voz"
  | "palavras_proibidas"
  | "instrucoes_ia"
  | "usar_chave_plataforma"
  | "is_active"
  | "logo_url"
  | "cor_primaria"
  | "created_at"
  | "updated_at"
>;

interface ClienteWorkspaceContextValue {
  clientes: ClienteSafe[];
  clienteAtivoId: number | null;
  clienteAtivo: ClienteSafe | null;
  loading: boolean;
  setClienteAtivoId: (id: number) => void;
  refetchClientes: () => Promise<void>;
}

const ClienteWorkspaceContext = createContext<ClienteWorkspaceContextValue | null>(null);

export function ClienteWorkspaceProvider({ children }: { children: ReactNode }) {
  const { agencia } = useAgencia();
  const supabase = getSupabaseBrowserClient();
  const [clientes, setClientes] = useState<ClienteSafe[]>([]);
  const [clienteAtivoId, setClienteAtivoIdState] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const refetchClientes = useCallback(async () => {
    if (!agencia?.id) {
      setClientes([]);
      setClienteAtivoIdState(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes_workspace")
      .select(CLIENTE_WORKSPACE_PUBLIC_COLUMNS)
      .eq("agencia_id", agencia.id)
      .eq("is_active", true)
      .order("nome");
    if (error) {
      setClientes([]);
      setLoading(false);
      return;
    }
    const list = (data ?? []) as ClienteSafe[];
    setClientes(list);

    const stored = localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? Number.parseInt(stored, 10) : NaN;
    const valid = list.find((c) => c.id === parsed);
    const nextId = valid?.id ?? list[0]?.id ?? null;
    setClienteAtivoIdState(nextId);
    if (nextId != null) {
      localStorage.setItem(STORAGE_KEY, String(nextId));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    setLoading(false);
  }, [agencia?.id, supabase]);

  useEffect(() => {
    void refetchClientes();
  }, [refetchClientes]);

  const setClienteAtivoId = useCallback((id: number) => {
    setClienteAtivoIdState(id);
    localStorage.setItem(STORAGE_KEY, String(id));
  }, []);

  const clienteAtivo = useMemo(
    () => clientes.find((c) => c.id === clienteAtivoId) ?? null,
    [clientes, clienteAtivoId],
  );

  const value = useMemo<ClienteWorkspaceContextValue>(
    () => ({
      clientes,
      clienteAtivoId,
      clienteAtivo,
      loading,
      setClienteAtivoId,
      refetchClientes,
    }),
    [clientes, clienteAtivoId, clienteAtivo, loading, setClienteAtivoId, refetchClientes],
  );

  return (
    <ClienteWorkspaceContext.Provider value={value}>{children}</ClienteWorkspaceContext.Provider>
  );
}

export function useClienteWorkspace(): ClienteWorkspaceContextValue {
  const ctx = useContext(ClienteWorkspaceContext);
  if (!ctx) {
    throw new Error("useClienteWorkspace deve ser usado dentro de ClienteWorkspaceProvider");
  }
  return ctx;
}
