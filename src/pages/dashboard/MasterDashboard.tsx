import { useEffect, useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/lib/supabase/database.types";
import { toast } from "sonner";

type AgenciaRow = Database["public"]["Tables"]["agencias"]["Row"];
type PlanoRow = Database["public"]["Tables"]["planos"]["Row"];

interface AgenciaComPlano extends AgenciaRow {
  planos: PlanoRow | PlanoRow[] | null;
}

function planoNome(t: AgenciaComPlano): string {
  const p = t.planos;
  if (Array.isArray(p)) return p[0]?.nome ?? "—";
  return p?.nome ?? "—";
}

function planoPreco(t: AgenciaComPlano): number {
  const p = t.planos;
  const row = Array.isArray(p) ? p[0] : p;
  return row?.preco_mensal ? Number(row.preco_mensal) : 0;
}

const MasterDashboard = () => {
  const supabase = getSupabaseBrowserClient();
  const [tenants, setTenants] = useState<AgenciaComPlano[]>([]);
  const [auditoria, setAuditoria] = useState<Database["public"]["Tables"]["auditoria"]["Row"][]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      setLoading(true);
      const { data: ag, error: e1 } = await supabase.from("agencias").select("*, planos(*)").order("created_at", {
        ascending: false,
      });
      if (e1) {
        toast.error(e1.message);
      } else {
        setTenants((ag ?? []) as AgenciaComPlano[]);
      }
      const { data: aud, error: e2 } = await supabase
        .from("auditoria")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(30);
      if (e2) {
        toast.error(e2.message);
      } else {
        setAuditoria(aud ?? []);
      }
      setLoading(false);
    };
    void run();
  }, [supabase]);

  const kpis = useMemo(() => {
    const active = tenants.filter((t) => t.status_assinatura === "active" || t.status_assinatura === "trial").length;
    const mrr = tenants.reduce((acc, t) => {
      const preco = planoPreco(t);
      if (t.status_assinatura === "active") return acc + preco;
      return acc;
    }, 0);
    return [
      { label: "MRR estimado (ativos)", value: `R$ ${mrr.toFixed(2)}` },
      { label: "Tenants (total)", value: String(tenants.length) },
      { label: "Ativos + trial", value: String(active) },
      { label: "Carregado", value: loading ? "…" : "OK" },
    ];
  }, [tenants, loading]);

  const pieData = useMemo(() => {
    const map = new Map<string, number>();
    tenants.forEach((t) => {
      const n = planoNome(t);
      map.set(n, (map.get(n) ?? 0) + 1);
    });
    const colors = ["hsl(240, 4%, 46%)", "hsl(263, 85%, 58%)", "hsl(160, 84%, 39%)"];
    return Array.from(map.entries()).map(([name, value], i) => ({
      name,
      value,
      color: colors[i % colors.length],
    }));
  }, [tenants]);

  const barData = useMemo(() => {
    const byMonth = new Map<string, number>();
    tenants.forEach((t) => {
      const d = t.created_at ? new Date(t.created_at) : new Date();
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      byMonth.set(key, (byMonth.get(key) ?? 0) + 1);
    });
    return Array.from(byMonth.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-12)
      .map(([month, value]) => ({ month, value }));
  }, [tenants]);

  return (
    <div className="space-y-6">
      <h1 className="text-title-md text-foreground">Dashboard Master</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="card-surface p-5 rounded-xl">
            <p className="text-2xl font-semibold text-foreground">{k.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
        <div className="card-surface p-6 rounded-xl">
          <h2 className="text-sm font-medium text-foreground mb-6">Novos tenants por mês</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData.length ? barData : [{ month: "-", value: 0 }]}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Bar dataKey="value" fill="hsl(263, 85%, 58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-surface p-6 rounded-xl">
          <h2 className="text-sm font-medium text-foreground mb-6">Distribuição por plano</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData.length ? pieData : [{ name: "-", value: 1, color: "hsl(240, 4%, 46%)" }]}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                dataKey="value"
                paddingAngle={2}
              >
                {(pieData.length ? pieData : [{ name: "-", value: 1, color: "hsl(240, 4%, 46%)" }]).map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {pieData.map((p) => (
              <div key={p.name} className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                <span className="text-xs text-muted-foreground">{p.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="card-surface rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Tenants</h2>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-label border-b border-border">
              <th className="px-5 py-3">Nome</th>
              <th className="px-5 py-3">Plano</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Criado</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.id} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-sm text-foreground">{t.nome}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{planoNome(t)}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs px-2 py-1 rounded-md ${
                      t.status_assinatura === "canceled" ? "bg-destructive/10 text-destructive" : "bg-success/10 text-success"
                    }`}
                  >
                    {t.status_assinatura}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">
                  {t.created_at ? new Date(t.created_at).toLocaleDateString() : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-surface rounded-xl p-6">
        <h2 className="text-sm font-medium text-foreground mb-4">Log de auditoria (amostra)</h2>
        <div className="space-y-3">
          {auditoria.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum evento ainda.</p>
          ) : (
            auditoria.map((l) => (
              <div key={l.id} className="flex justify-between items-center py-2 border-b border-border last:border-0">
                <span className="text-sm text-muted-foreground">{l.acao}</span>
                <span className="text-xs text-text-disabled">
                  {l.created_at ? new Date(l.created_at).toLocaleString() : ""}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
