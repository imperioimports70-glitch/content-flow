import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAgencia } from "@/providers/AgenciaProvider";
import type { Database } from "@/lib/supabase/database.types";
import { toast } from "sonner";

type UsoRow = Database["public"]["Tables"]["uso_recursos"]["Row"];

const ReportsPage = () => {
  const supabase = getSupabaseBrowserClient();
  const { agencia } = useAgencia();
  const [rows, setRows] = useState<UsoRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!agencia?.id) {
        setRows([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("uso_recursos")
        .select("*")
        .eq("agencia_id", agencia.id)
        .order("mes_referencia", { ascending: false })
        .limit(12);
      if (error) toast.error(error.message);
      else setRows(data ?? []);
      setLoading(false);
    };
    void run();
  }, [agencia?.id, supabase]);

  return (
    <div className="space-y-6">
      <h1 className="text-title-md text-foreground">Relatórios de uso</h1>
      <p className="text-sm text-muted-foreground">Tokens e posts gerados por mês (agência).</p>
      <div className="card-surface rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Carregando…</p>
        ) : rows.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Sem dados de uso ainda.</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-label border-b border-border">
                <th className="px-5 py-3">Mês</th>
                <th className="px-5 py-3">Posts</th>
                <th className="px-5 py-3">Tokens</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm text-foreground">{r.mes_referencia}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{r.posts_gerados}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{r.tokens_consumidos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
