import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Copy, RefreshCw, Calendar } from "lucide-react";
import { SubscriptionGate } from "@/components/guards/SubscriptionGate";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { useAgencia } from "@/providers/AgenciaProvider";
import { useClienteWorkspace } from "@/providers/ClienteWorkspaceProvider";
import type { Database } from "@/lib/supabase/database.types";
import { toast } from "sonner";

type RedeSocial = Database["public"]["Tables"]["posts"]["Row"]["rede_social"];

const tomMap: Record<string, string> = {
  profissional: "profissional",
  descontraido: "descontraido",
  inspiracional: "inspiracional",
  educativo: "educativo",
};

const ContentGeneratorInner = () => {
  const supabase = getSupabaseBrowserClient();
  const { session } = useAuth();
  const { agencia, perfil } = useAgencia();
  const { clienteAtivoId, clienteAtivo } = useClienteWorkspace();
  const [rede, setRede] = useState<RedeSocial>("instagram");
  const [tomUi, setTomUi] = useState("profissional");
  const [tema, setTema] = useState("");
  const [qtd, setQtd] = useState("3");
  const [loading, setLoading] = useState(false);
  const [posts, setPosts] = useState<{ legenda: string; hashtags: string[] }[]>([]);

  const gerar = async () => {
    if (!session?.access_token) {
      toast.error("Sessão inválida");
      return;
    }
    if (!clienteAtivoId) {
      toast.error("Selecione um cliente no header");
      return;
    }
    setLoading(true);
    const prompt = `Gere ${qtd} legendas curtas para a rede ${rede}. Tema: ${tema || "conteúdo geral da marca"}. Tom: ${tomUi}. Responda apenas JSON {"legendas": string[], "hashtags": string[]} com legendas em português.`;
    const { data, error } = await supabase.functions.invoke("invoke-llm", {
      body: {
        cliente_id: clienteAtivoId,
        prompt,
        rede_social: rede,
      },
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const legendas = (data as { legendas?: string[] })?.legendas ?? [];
    const hashtags = (data as { hashtags?: string[] })?.hashtags ?? [];
    const combined = legendas.map((legenda, i) => ({
      legenda,
      hashtags: i === 0 ? hashtags : hashtags.slice(0, 5),
    }));
    setPosts(combined);

    if (agencia?.id && perfil?.id) {
      for (const p of combined) {
        await supabase.from("posts").insert({
          agencia_id: agencia.id,
          cliente_id: clienteAtivoId,
          criado_por: perfil.id,
          rede_social: rede,
          legenda: p.legenda,
          hashtags: p.hashtags,
          tom_usado: tomMap[tomUi] ?? tomUi,
          status: "rascunho",
        });
      }
      toast.success("Rascunhos salvos em Posts");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-title-md text-foreground">Gerador de Conteúdo com IA</h1>
      {clienteAtivo && (
        <p className="text-sm text-muted-foreground">
          Cliente ativo: <strong>{clienteAtivo.nome}</strong>
        </p>
      )}
      <div className="grid lg:grid-cols-[2fr_3fr] gap-0 card-surface rounded-xl overflow-hidden">
        <div className="p-6 border-r border-border space-y-5">
          <div className="space-y-2">
            <label className="text-label">Rede Social</label>
            <Select value={rede} onValueChange={(v) => setRede(v as RedeSocial)}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instagram">Instagram</SelectItem>
                <SelectItem value="linkedin">LinkedIn</SelectItem>
                <SelectItem value="tiktok">TikTok</SelectItem>
                <SelectItem value="twitter">Twitter</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-label">Tema ou produto desta semana</label>
            <Textarea
              placeholder="Descreva o tema, produto ou serviço..."
              className="bg-background min-h-[100px]"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <label className="text-label">Tom de voz</label>
            <Select value={tomUi} onValueChange={setTomUi}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="profissional">Profissional</SelectItem>
                <SelectItem value="descontraido">Descontraído</SelectItem>
                <SelectItem value="inspiracional">Inspiracional</SelectItem>
                <SelectItem value="educativo">Educativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-label">Quantidade de posts</label>
            <Select value={qtd} onValueChange={setQtd}>
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="3">3 posts</SelectItem>
                <SelectItem value="5">5 posts</SelectItem>
                <SelectItem value="10">10 posts</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" size="lg" onClick={() => void gerar()} disabled={loading}>
            {loading ? "Gerando…" : "Gerar conteúdo"}
          </Button>
        </div>
        <div className="p-6">
          {posts.length === 0 ? (
            <div className="h-full flex items-center justify-center min-h-[200px]">
              <p className="text-sm text-text-disabled">Os posts gerados aparecem aqui</p>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-label mb-4">{posts.length} posts gerados</p>
              {posts.map((post, idx) => (
                <div key={idx} className="bg-background border border-border rounded-lg p-4 space-y-3">
                  <p className="text-sm text-foreground leading-relaxed">{post.legenda}</p>
                  <div className="flex flex-wrap gap-2">
                    {post.hashtags.map((h) => (
                      <span key={h} className="text-xs px-2 py-1 rounded-md bg-elevation text-muted-foreground">
                        {h}
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button variant="ghost" size="sm" type="button">
                      <Calendar className="w-3 h-3 mr-1" />
                      Agendar
                    </Button>
                    <Button variant="ghost" size="sm" type="button">
                      <RefreshCw className="w-3 h-3 mr-1" />
                      Regenerar
                    </Button>
                    <Button variant="ghost" size="sm" type="button" onClick={() => navigator.clipboard.writeText(post.legenda)}>
                      <Copy className="w-3 h-3 mr-1" />
                      Copiar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ContentGenerator = () => (
  <SubscriptionGate>
    <ContentGeneratorInner />
  </SubscriptionGate>
);

export default ContentGenerator;
