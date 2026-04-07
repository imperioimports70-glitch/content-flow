import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus } from "lucide-react";

const team = [
  { name: "Carolina M.", email: "carolina@agencia.com", role: "Admin" },
  { name: "Lucas S.", email: "lucas@agencia.com", role: "Editor" },
  { name: "Ana P.", email: "ana@agencia.com", role: "Colaborador" },
];

const BrandSettings = () => {
  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-title-md text-foreground">Configurações da Marca</h1>

      {/* Brand Identity */}
      <section className="card-surface rounded-xl p-6 space-y-5">
        <h2 className="text-label">Identidade da Marca</h2>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Nome da marca</label>
            <Input defaultValue="Studio Design" className="bg-background" />
          </div>
          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Segmento</label>
            <Input defaultValue="Design & Branding" className="bg-background" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Sobre a marca</label>
          <Textarea defaultValue="Estúdio de design focado em identidade visual para startups e empresas de tecnologia." className="bg-background min-h-[80px]" />
        </div>
      </section>

      {/* AI Settings */}
      <section className="card-surface rounded-xl p-6 space-y-5">
        <h2 className="text-label">Configurações de IA</h2>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Tom de voz padrão</label>
          <Select defaultValue="professional">
            <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="professional">Profissional</SelectItem>
              <SelectItem value="casual">Descontraído</SelectItem>
              <SelectItem value="inspirational">Inspiracional</SelectItem>
              <SelectItem value="educational">Educativo</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Palavras proibidas</label>
          <Input placeholder="Separe por vírgulas" className="bg-background" />
        </div>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">Instruções customizadas para IA</label>
          <Textarea placeholder="Instruções adicionais para personalizar a geração de conteúdo..." className="bg-background min-h-[80px]" />
        </div>
      </section>

      {/* BYOK */}
      <section className="card-surface rounded-xl p-6 space-y-5">
        <h2 className="text-label">Chave API (BYOK)</h2>
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">OpenAI API Key</label>
          <Input type="password" placeholder="sk-..." className="bg-background" />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Usar chave da plataforma</span>
          <Switch defaultChecked />
        </div>
      </section>

      {/* Team */}
      <section className="card-surface rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-label">Equipe</h2>
          <Button variant="ghost" size="sm"><Plus className="w-3 h-3 mr-1" />Adicionar</Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-label border-b border-border">
              <th className="pb-3">Nome</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Cargo</th>
              <th className="pb-3"></th>
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.email} className="border-b border-border last:border-0">
                <td className="py-3 text-sm text-foreground">{m.name}</td>
                <td className="py-3 text-sm text-muted-foreground">{m.email}</td>
                <td className="py-3 text-sm text-muted-foreground">{m.role}</td>
                <td className="py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Subscription */}
      <section className="card-surface rounded-xl p-6 space-y-4">
        <h2 className="text-label">Assinatura</h2>
        <div className="flex items-center gap-4">
          <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded">Plano Agência</span>
          <span className="text-sm text-muted-foreground">R$247/mês</span>
        </div>
        <Button variant="ghost">Gerenciar no Stripe</Button>
      </section>
    </div>
  );
};

export default BrandSettings;
