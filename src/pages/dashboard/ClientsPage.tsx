import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAgencia } from "@/providers/AgenciaProvider";
import { useClienteWorkspace } from "@/providers/ClienteWorkspaceProvider";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

const schema = z.object({
  nome: z.string().min(2, "Nome obrigatório"),
  segmento: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const ClientsPage = () => {
  const supabase = getSupabaseBrowserClient();
  const { agencia, refetch: refetchPerfilAgencia } = useAgencia();
  const { refetchClientes } = useClienteWorkspace();
  const [list, setList] = useState<{ id: number; nome: string; segmento: string | null }[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", segmento: "" },
  });

  const load = async () => {
    if (!agencia?.id) return;
    setLoading(true);
    const { data, error } = await supabase
      .from("clientes_workspace")
      .select("id, nome, segmento")
      .eq("agencia_id", agencia.id)
      .order("nome");
    if (error) {
      toast.error(error.message);
    } else {
      setList(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [agencia?.id]);

  const onSubmit = async (values: FormValues) => {
    if (!agencia?.id) return;
    const { error } = await supabase.from("clientes_workspace").insert({
      agencia_id: agencia.id,
      nome: values.nome,
      segmento: values.segmento || null,
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cliente criado");
    form.reset();
    await load();
    await refetchClientes();
    void refetchPerfilAgencia();
  };

  const remove = async (id: number) => {
    const { error } = await supabase.from("clientes_workspace").delete().eq("id", id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Cliente removido");
    await load();
    await refetchClientes();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-title-md text-foreground">Meus clientes (workspaces)</h1>

      <section className="card-surface rounded-xl p-6 space-y-4">
        <h2 className="text-label">Novo cliente</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Nome</FormLabel>
                  <FormControl>
                    <Input className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
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
            <div className="md:col-span-2">
              <Button type="submit">Adicionar</Button>
            </div>
          </form>
        </Form>
      </section>

      <section className="card-surface rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Lista</h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="text-left text-label border-b border-border">
                <th className="px-5 py-3">Nome</th>
                <th className="px-5 py-3">Segmento</th>
                <th className="px-5 py-3 w-16" />
              </tr>
            </thead>
            <tbody>
              {list.map((c) => (
                <tr key={c.id} className="border-b border-border last:border-0">
                  <td className="px-5 py-3 text-sm text-foreground">{c.nome}</td>
                  <td className="px-5 py-3 text-sm text-muted-foreground">{c.segmento ?? "—"}</td>
                  <td className="px-5 py-3 text-right">
                    <Button variant="ghost" size="icon" type="button" onClick={() => remove(c.id)} aria-label="Remover">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default ClientsPage;
