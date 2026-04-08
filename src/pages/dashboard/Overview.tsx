import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAgencia } from "@/providers/AgenciaProvider";
import { useClienteWorkspace } from "@/providers/ClienteWorkspaceProvider";

const Overview = () => {
  const supabase = getSupabaseBrowserClient();
  const { agencia } = useAgencia();
  const { clienteAtivoId, clienteAtivo } = useClienteWorkspace();
  const [scheduled, setScheduled] = useState(0);
  const [comments, setComments] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!agencia?.id) {
        setLoading(false);
        return;
      }
      setLoading(true);
      let s = 0;
      let c = 0;
      if (clienteAtivoId) {
        const postsRes = await supabase
          .from("posts")
          .select("id", { count: "exact", head: true })
          .eq("cliente_id", clienteAtivoId)
          .eq("status", "agendado");
        s = postsRes.count ?? 0;
        const comRes = await supabase
          .from("comentarios")
          .select("id", { count: "exact", head: true })
          .eq("cliente_id", clienteAtivoId);
        c = comRes.count ?? 0;
      }
      setScheduled(s);
      setComments(c);
      setLoading(false);
    };
    void run();
  }, [agencia?.id, clienteAtivoId, supabase]);

  const metrics = [
    { label: "Posts agendados (cliente ativo)", value: loading ? "—" : String(scheduled), change: "", positive: true },
    { label: "Comentários (cliente ativo)", value: loading ? "—" : String(comments), change: "", positive: true },
    { label: "Cliente ativo", value: clienteAtivo?.nome ?? "—", change: "", positive: true },
    { label: "Status assinatura", value: agencia?.status_assinatura ?? "—", change: "", positive: true },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-title-md text-foreground">Visão Geral</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-surface p-5 rounded-xl">
            <p className="text-2xl font-semibold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            {m.change ? (
              <p className={`text-xs mt-2 ${m.positive ? "text-success" : "text-destructive"}`}>{m.change}</p>
            ) : null}
          </div>
        ))}
      </div>
      <div className="card-surface rounded-xl p-5">
        <h2 className="text-sm font-medium text-foreground mb-2">Resumo</h2>
        <p className="text-sm text-muted-foreground">
          Os números acima refletem o <strong>cliente selecionado no header</strong> e os dados reais do Supabase.
          Cadastre clientes em &quot;Meus Clientes&quot; e use o gerador para criar posts.
        </p>
      </div>
    </div>
  );
};

export default Overview;
