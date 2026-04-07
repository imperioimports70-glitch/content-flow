import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Cell, PieChart, Pie } from "recharts";

const barData = [
  { month: "Mai", value: 12 }, { month: "Jun", value: 18 }, { month: "Jul", value: 22 },
  { month: "Ago", value: 28 }, { month: "Set", value: 35 }, { month: "Out", value: 42 },
  { month: "Nov", value: 48 }, { month: "Dez", value: 52 }, { month: "Jan", value: 58 },
  { month: "Fev", value: 64 }, { month: "Mar", value: 71 }, { month: "Abr", value: 78 },
];

const pieData = [
  { name: "Starter", value: 45, color: "hsl(240, 4%, 46%)" },
  { name: "Agência", value: 38, color: "hsl(263, 85%, 58%)" },
  { name: "White Label", value: 17, color: "hsl(160, 84%, 39%)" },
];

const kpis = [
  { label: "MRR Total", value: "R$18.420" },
  { label: "Clientes Ativos", value: "78" },
  { label: "Churn do Mês", value: "2,3%" },
  { label: "Posts Gerados", value: "12.847" },
];

const tenants = [
  { name: "Agência Pulse", plan: "White Label", status: "Ativo", joined: "12/01/2025", lastAccess: "Hoje" },
  { name: "DigitalMKT", plan: "Agência", status: "Ativo", joined: "03/03/2025", lastAccess: "Ontem" },
  { name: "SocialBR", plan: "Starter", status: "Ativo", joined: "15/06/2025", lastAccess: "Há 3 dias" },
  { name: "ConteúdoLab", plan: "Agência", status: "Cancelado", joined: "01/09/2025", lastAccess: "Há 15 dias" },
];

const logs = [
  { action: "Novo tenant criado: FitLife", time: "07/04/2026 14:32" },
  { action: "Upgrade de plano: SocialBR → Agência", time: "06/04/2026 09:15" },
  { action: "Cancelamento: ConteúdoLab", time: "05/04/2026 18:40" },
  { action: "Novo tenant criado: Midia.Pro", time: "04/04/2026 11:22" },
];

const MasterDashboard = () => {
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
          <h2 className="text-sm font-medium text-foreground mb-6">Crescimento de Assinantes</h2>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={barData}>
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(240, 4%, 46%)" }} axisLine={false} tickLine={false} />
              <Bar dataKey="value" fill="hsl(263, 85%, 58%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card-surface p-6 rounded-xl">
          <h2 className="text-sm font-medium text-foreground mb-6">Distribuição por Plano</h2>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={2}>
                {pieData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-4">
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
              <th className="px-5 py-3">Adesão</th>
              <th className="px-5 py-3">Último Acesso</th>
            </tr>
          </thead>
          <tbody>
            {tenants.map((t) => (
              <tr key={t.name} className="border-b border-border last:border-0">
                <td className="px-5 py-3 text-sm text-foreground">{t.name}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{t.plan}</td>
                <td className="px-5 py-3">
                  <span className={`text-xs px-2 py-1 rounded-md ${t.status === "Ativo" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
                    {t.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{t.joined}</td>
                <td className="px-5 py-3 text-sm text-muted-foreground">{t.lastAccess}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-surface rounded-xl p-6">
        <h2 className="text-sm font-medium text-foreground mb-4">Log de Auditoria</h2>
        <div className="space-y-3">
          {logs.map((l, i) => (
            <div key={i} className="flex justify-between items-center py-2 border-b border-border last:border-0">
              <span className="text-sm text-muted-foreground">{l.action}</span>
              <span className="text-xs text-text-disabled">{l.time}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MasterDashboard;
