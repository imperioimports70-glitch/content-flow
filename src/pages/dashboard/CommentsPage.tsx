import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAgencia } from "@/providers/AgenciaProvider";
import { useClienteWorkspace } from "@/providers/ClienteWorkspaceProvider";
import type { Database } from "@/lib/supabase/database.types";
import { toast } from "sonner";

type ComentarioRow = Database["public"]["Tables"]["comentarios"]["Row"];

const schema = z.object({
  comentario_original: z.string().min(1, "Obrigatório"),
  rede_social: z.string().min(1),
  resposta_gerada: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const CommentsPage = () => {
  const supabase = getSupabaseBrowserClient();
  const { agencia } = useAgencia();
  const { clienteAtivoId } = useClienteWorkspace();
  const [rows, setRows] = useState<ComentarioRow[]>([]);
  const [loading, setLoading] = useState(true);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { comentario_original: "", rede_social: "instagram", resposta_gerada: "" },
  });

  const load = async () => {
    if (!clienteAtivoId) {
      setRows([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("comentarios")
      .select("*")
      .eq("cliente_id", clienteAtivoId)
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, [clienteAtivoId]);

  const onSubmit = async (values: FormValues) => {
    if (!agencia?.id || !clienteAtivoId) return;
    const { error } = await supabase.from("comentarios").insert({
      agencia_id: agencia.id,
      cliente_id: clienteAtivoId,
      comentario_original: values.comentario_original,
      rede_social: values.rede_social,
      resposta_gerada: values.resposta_gerada || null,
      status: "pendente",
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Comentário registrado");
    form.reset({ comentario_original: "", rede_social: values.rede_social, resposta_gerada: "" });
    await load();
  };

  return (
    <div className="space-y-8 max-w-3xl">
      <h1 className="text-title-md text-foreground">Comentários</h1>

      <section className="card-surface rounded-xl p-6 space-y-4">
        <h2 className="text-label">Novo registro</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="rede_social"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Rede</FormLabel>
                  <FormControl>
                    <Input className="bg-background" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comentario_original"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Comentário original</FormLabel>
                  <FormControl>
                    <Textarea className="bg-background min-h-[80px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="resposta_gerada"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground">Rascunho de resposta (opcional)</FormLabel>
                  <FormControl>
                    <Textarea className="bg-background min-h-[60px]" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Salvar</Button>
          </form>
        </Form>
      </section>

      <section className="card-surface rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h2 className="text-sm font-medium text-foreground">Histórico</h2>
        </div>
        {loading ? (
          <p className="p-5 text-sm text-muted-foreground">Carregando…</p>
        ) : (
          <ul className="divide-y divide-border">
            {rows.map((r) => (
              <li key={r.id} className="px-5 py-4 space-y-1">
                <span className="text-xs text-muted-foreground">
                  {r.rede_social} · {r.status}
                </span>
                <p className="text-sm text-foreground">{r.comentario_original}</p>
                {r.resposta_gerada && (
                  <p className="text-sm text-muted-foreground border-l-2 border-primary pl-3">{r.resposta_gerada}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
};

export default CommentsPage;
