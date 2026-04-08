import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useClienteWorkspace } from "@/providers/ClienteWorkspaceProvider";
import type { Database } from "@/lib/supabase/database.types";
import { toast } from "sonner";

type PostRow = Database["public"]["Tables"]["posts"]["Row"];

const CalendarPage = () => {
  const supabase = getSupabaseBrowserClient();
  const { clienteAtivoId } = useClienteWorkspace();
  const [posts, setPosts] = useState<PostRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const run = async () => {
      if (!clienteAtivoId) {
        setPosts([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("posts")
        .select("*")
        .eq("cliente_id", clienteAtivoId)
        .order("agendado_para", { ascending: true, nullsFirst: false });
      if (error) {
        toast.error(error.message);
      } else {
        setPosts(data ?? []);
      }
      setLoading(false);
    };
    void run();
  }, [clienteAtivoId, supabase]);

  return (
    <div className="space-y-6">
      <h1 className="text-title-md text-foreground">Calendário editorial</h1>
      <p className="text-sm text-muted-foreground">
        Posts do cliente ativo com data de agendamento ou criação recente.
      </p>
      <div className="card-surface rounded-xl overflow-hidden">
        {loading ? (
          <p className="p-6 text-sm text-muted-foreground">Carregando…</p>
        ) : posts.length === 0 ? (
          <p className="p-6 text-sm text-muted-foreground">Nenhum post ainda. Gere conteúdo e salve como agendado.</p>
        ) : (
          <ul className="divide-y divide-border">
            {posts.map((p) => (
              <li key={p.id} className="px-5 py-4 flex flex-col gap-1">
                <span className="text-xs text-muted-foreground">
                  {p.agendado_para
                    ? new Date(p.agendado_para).toLocaleString()
                    : new Date(p.created_at).toLocaleDateString()}{" "}
                  · {p.rede_social} · {p.status}
                </span>
                <p className="text-sm text-foreground line-clamp-2">{p.legenda}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default CalendarPage;
