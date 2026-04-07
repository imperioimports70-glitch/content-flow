import { Badge } from "@/components/ui/badge";

const metrics = [
  { label: "Posts Agendados", value: "42", change: "+12%", positive: true },
  { label: "Comentários Respondidos", value: "128", change: "+8%", positive: true },
  { label: "Clientes Ativos", value: "8", change: "0%", positive: true },
  { label: "Horas Economizadas", value: "36h", change: "+24%", positive: true },
];

const posts = [
  { client: "Studio Design", network: "Instagram", date: "07/04/2026", status: "Agendado" },
  { client: "Tech Corp", network: "LinkedIn", date: "08/04/2026", status: "Rascunho" },
  { client: "Café Aroma", network: "Instagram", date: "08/04/2026", status: "Agendado" },
  { client: "FitLife", network: "TikTok", date: "09/04/2026", status: "Publicado" },
  { client: "Studio Design", network: "Twitter", date: "09/04/2026", status: "Rascunho" },
];

const activity = [
  { text: "Legenda gerada para Studio Design", time: "Há 5 min" },
  { text: "3 posts agendados para Café Aroma", time: "Há 20 min" },
  { text: "Comentário respondido em Tech Corp", time: "Há 1h" },
  { text: "Relatório semanal gerado", time: "Há 2h" },
  { text: "Novo cliente adicionado: FitLife", time: "Há 3h" },
];

const statusVariant = (status: string) => {
  switch (status) {
    case "Agendado": return "bg-primary/10 text-primary";
    case "Publicado": return "bg-success/10 text-success";
    default: return "bg-muted text-muted-foreground";
  }
};

const Overview = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-title-md text-foreground">Visão Geral</h1>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="card-surface p-5 rounded-xl">
            <p className="text-2xl font-semibold text-foreground">{m.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
            <p className={`text-xs mt-2 ${m.positive ? "text-success" : "text-destructive"}`}>{m.change}</p>
          </div>
        ))}
      </div>
      <div className="grid lg:grid-cols-[1fr_340px] gap-6">
        <div className="card-surface rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <h2 className="text-sm font-medium text-foreground">Próximos Posts</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-label border-b border-border">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Rede</th>
                <th className="px-5 py-3">Data</th>
                <th className="px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((p, i) => (
                <tr key={i} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm text-foreground">{p.client}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{p.network}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{p.date}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs px-2 py-1 rounded-md ${statusVariant(p.status)}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="card-surface rounded-xl p-5">
          <h2 className="text-sm font-medium text-foreground mb-4">Atividade Recente</h2>
          <div className="space-y-4">
            {activity.map((a, i) => (
              <div key={i} className="flex justify-between gap-4">
                <p className="text-sm text-muted-foreground">{a.text}</p>
                <span className="text-xs text-text-disabled whitespace-nowrap">{a.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
