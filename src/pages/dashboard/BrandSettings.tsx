import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Trash2, Plus, CreditCard, ExternalLink } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useAgencia } from "@/providers/AgenciaProvider";
import { useClienteWorkspace } from "@/providers/ClienteWorkspaceProvider";
import { startStripeCheckout, openStripePortal } from "@/lib/stripe-client";
import type { Database } from "@/lib/supabase/database.types";
import { toast } from "sonner";

type TomDeVoz = NonNullable<Database["public"]["Tables"]["clientes_workspace"]["Row"]["tom_de_voz"]>;

const marcaSchema = z.object({
  nome: z.string().min(2),
  segmento: z.string().optional(),
  sobre_marca: z.string().optional(),
  tom_de_voz: z.enum(["profissional", "descontraido", "inspiracional", "educativo"]).optional(),
  palavras_proibidas: z.string().optional(),
  instrucoes_ia: z.string().optional(),
});

const byokSchema = z.object({
  apiKey: z.string().min(10, "Cole uma chave válida"),
});

type MarcaValues = z.infer<typeof marcaSchema>;

const BrandSettings = () => {
  const supabase = getSupabaseBrowserClient();
  const { session } = useAuth();
  const { agencia, plano } = useAgencia();
  const { clienteAtivo, clienteAtivoId, refetchClientes } = useClienteWorkspace();
  const [planos, setPlanos] = useState<Database["public"]["Tables"]["planos"]["Row"][]>([]);
  const [team, setTeam] = useState<Database["public"]["Tables"]["perfis"]["Row"][]>([]);
  const [checkoutLoading, setCheckoutLoading] = useState<number | null>(null);

  const marcaForm = useForm<MarcaValues>({
    resolver: zodResolver(marcaSchema),
    defaultValues: {
      nome: "",
      segmento: "",
      sobre_marca: "",
      tom_de_voz: "profissional",
      palavras_proibidas: "",
      instrucoes_ia: "",
    },
  });

  const byokForm = useForm<z.infer<typeof byokSchema>>({
    resolver: zodResolver(byokSchema),
    defaultValues: { apiKey: "" },
  });

  const [usarPlataforma, setUsarPlataforma] = useState(true);

  useEffect(() => {
    void (async () => {
      const { data } = await supabase.from("planos").select("*").eq("is_active", true).order("preco_mensal");
      setPlanos(data ?? []);
    })();
  }, [supabase]);

  useEffect(() => {
    void (async () => {
      if (!agencia?.id) return;
      const { data } = await supabase.from("perfis").select("*").eq("agencia_id", agencia.id);
      setTeam(data ?? []);
    })();
  }, [agencia?.id, supabase]);

  useEffect(() => {
    if (!clienteAtivo) return;
    marcaForm.reset({
      nome: clienteAtivo.nome,
      segmento: clienteAtivo.segmento ?? "",
      sobre_marca: clienteAtivo.sobre_marca ?? "",
      tom_de_voz: (clienteAtivo.tom_de_voz as TomDeVoz | null) ?? "profissional",
      palavras_proibidas: clienteAtivo.palavras_proibidas ?? "",
      instrucoes_ia: clienteAtivo.instrucoes_ia ?? "",
    });
    setUsarPlataforma(clienteAtivo.usar_chave_plataforma);
  }, [clienteAtivo, marcaForm]);

  const salvarMarca = marcaForm.handleSubmit(async (values) => {
    if (!clienteAtivoId) {
      toast.error("Selecione um cliente no header");
      return;
    }
    const { error } = await supabase
      .from("clientes_workspace")
      .update({
        nome: values.nome,
        segmento: values.segmento || null,
        sobre_marca: values.sobre_marca || null,
        tom_de_voz: values.tom_de_voz ?? null,
        palavras_proibidas: values.palavras_proibidas || null,
        instrucoes_ia: values.instrucoes_ia || null,
        usar_chave_plataforma: usarPlataforma,
      })
      .eq("id", clienteAtivoId);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Marca atualizada");
    await refetchClientes();
  });

  const salvarByok = byokForm.handleSubmit(async (values) => {
    if (!session?.access_token || !clienteAtivoId) {
      toast.error("Sessão ou cliente inválido");
      return;
    }
    const { error } = await supabase.functions.invoke("store-byok-key", {
      body: {
        cliente_id: clienteAtivoId,
        api_key: values.apiKey,
        usar_chave_plataforma: usarPlataforma,
      },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Chave armazenada com segurança no servidor");
    byokForm.reset({ apiKey: "" });
    await refetchClientes();
  });

  const checkout = async (planoId: number) => {
    if (!session?.access_token) return;
    setCheckoutLoading(planoId);
    const res = await startStripeCheckout(supabase, session.access_token, { planoId });
    setCheckoutLoading(null);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    window.location.href = res.url;
  };

  const portal = async () => {
    if (!session?.access_token) return;
    const res = await openStripePortal(supabase, session.access_token);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    window.location.href = res.url;
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-title-md text-foreground">Configurações da Marca</h1>

      {!clienteAtivoId && (
        <p className="text-sm text-destructive">Selecione um cliente no header para editar a marca.</p>
      )}

      <section className="card-surface rounded-xl p-6 space-y-5">
        <h2 className="text-label">Identidade da Marca</h2>
        <Form {...marcaForm}>
          <form onSubmit={salvarMarca} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <FormField
                control={marcaForm.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Nome da marca</FormLabel>
                    <FormControl>
                      <Input className="bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={marcaForm.control}
                name="segmento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs text-muted-foreground">Segmento</FormLabel>
                    <FormControl>
                      <Input className="bg-background" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={marcaForm.control}
              name="sobre_marca"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Sobre a marca</FormLabel>
                  <FormControl>
                    <Textarea className="bg-background min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={marcaForm.control}
              name="tom_de_voz"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Tom de voz padrão</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-background">
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="profissional">Profissional</SelectItem>
                      <SelectItem value="descontraido">Descontraído</SelectItem>
                      <SelectItem value="inspiracional">Inspiracional</SelectItem>
                      <SelectItem value="educativo">Educativo</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={marcaForm.control}
              name="palavras_proibidas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Palavras proibidas</FormLabel>
                  <FormControl>
                    <Input placeholder="Separe por vírgulas" className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={marcaForm.control}
              name="instrucoes_ia"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Instruções customizadas para IA</FormLabel>
                  <FormControl>
                    <Textarea className="bg-background min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <span className="text-sm text-muted-foreground">Usar chave da plataforma (OpenAI)</span>
              <Switch checked={usarPlataforma} onCheckedChange={setUsarPlataforma} />
            </div>
            <Button type="submit" disabled={!clienteAtivoId}>
              Salvar identidade
            </Button>
          </form>
        </Form>
      </section>

      <section className="card-surface rounded-xl p-6 space-y-5">
        <h2 className="text-label">Chave API (BYOK)</h2>
        <p className="text-xs text-muted-foreground">
          A chave é enviada apenas para a Edge Function e cifrada no servidor. Ela não aparece de volta no app.
        </p>
        <Form {...byokForm}>
          <form onSubmit={salvarByok} className="space-y-4">
            <FormField
              control={byokForm.control}
              name="apiKey"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">OpenAI API Key</FormLabel>
                  <FormControl>
                    <Input type="password" autoComplete="off" placeholder="sk-..." className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={!clienteAtivoId}>
              Armazenar chave com segurança
            </Button>
          </form>
        </Form>
      </section>

      <section className="card-surface rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-label">Equipe</h2>
          <Button variant="ghost" size="sm" type="button" disabled>
            <Plus className="w-3 h-3 mr-1" />
            Adicionar (convites em breve)
          </Button>
        </div>
        <table className="w-full">
          <thead>
            <tr className="text-left text-label border-b border-border">
              <th className="pb-3">Nome</th>
              <th className="pb-3">Email</th>
              <th className="pb-3">Papel</th>
              <th className="pb-3" />
            </tr>
          </thead>
          <tbody>
            {team.map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0">
                <td className="py-3 text-sm text-foreground">{m.nome_completo ?? "—"}</td>
                <td className="py-3 text-sm text-muted-foreground">{m.email}</td>
                <td className="py-3 text-sm text-muted-foreground">{m.role}</td>
                <td className="py-3 text-right">
                  <Button variant="ghost" size="icon" className="h-8 w-8" type="button" disabled>
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card-surface rounded-xl p-6 space-y-4">
        <h2 className="text-label">Assinatura</h2>
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-xs font-medium bg-primary/10 text-primary px-3 py-1 rounded">{plano?.nome ?? "Plano"}</span>
          <span className="text-sm text-muted-foreground">
            Status: {agencia?.status_assinatura ?? "—"} · Trial até:{" "}
            {agencia?.trial_ends_at ? new Date(agencia.trial_ends_at).toLocaleDateString() : "—"}
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {planos.map((p) => (
            <Button
              key={p.id}
              variant="secondary"
              size="sm"
              type="button"
              disabled={checkoutLoading !== null}
              onClick={() => void checkout(p.id)}
            >
              <CreditCard className="w-3 h-3 mr-1" />
              {checkoutLoading === p.id ? "…" : `Assinar ${p.nome}`}
            </Button>
          ))}
        </div>
        <Button variant="outline" type="button" onClick={() => void portal()}>
          <ExternalLink className="w-3 h-3 mr-1" />
          Gerenciar no Stripe
        </Button>
        <p className="text-xs text-muted-foreground">
          Configure <code className="text-foreground">stripe_price_id</code> real em cada plano no Supabase para o checkout funcionar.
        </p>
      </section>
    </div>
  );
};

export default BrandSettings;
