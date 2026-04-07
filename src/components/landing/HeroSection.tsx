import { Button } from "@/components/ui/button";
import { useDelayedNavigate } from "@/hooks/useDelayedNavigate";
import { Loader2 } from "lucide-react";

const HeroSection = () => {
  const { delayedNavigate, isNavigating } = useDelayedNavigate();

  return (
    <section className="relative pt-32 pb-24 gradient-hero">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <p className="text-label">Plataforma de conteúdo com IA para agências</p>
            <h1 className="text-title-xl text-foreground">
              Gerencie o conteúdo de todos os seus clientes com IA. Em minutos, não em horas.
            </h1>
            <p className="text-body text-muted-foreground max-w-lg">
              ContentFlow.ai automatiza a criação de legendas, calendários editoriais e respostas de comentários para cada cliente, preservando a voz de cada marca.
            </p>
            <div className="flex gap-4">
              <Button
                size="lg"
                disabled={isNavigating}
                onClick={() => delayedNavigate("/auth/register")}
              >
                {isNavigating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Criar conta grátis"}
              </Button>
              <Button variant="ghost" size="lg" asChild>
                <a href="#como-funciona">Ver como funciona</a>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Teste grátis por 7 dias. Sem cartão de crédito.
            </p>
          </div>
          <div className="hidden lg:block">
            <div className="card-surface p-1 rounded-xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
                <span className="w-3 h-3 rounded-full bg-destructive/60" />
                <span className="w-3 h-3 rounded-full bg-warning/60" />
                <span className="w-3 h-3 rounded-full bg-success/60" />
                <span className="flex-1 text-center text-xs text-muted-foreground">contentflow.ai/dashboard</span>
              </div>
              <div className="bg-background rounded-b-lg p-6 space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  {["Posts Agendados", "Comentários", "Clientes"].map((label, i) => (
                    <div key={i} className="card-surface p-4 rounded-lg">
                      <p className="text-2xl font-semibold text-foreground">{[42, 128, 8][i]}</p>
                      <p className="text-xs text-muted-foreground mt-1">{label}</p>
                    </div>
                  ))}
                </div>
                <div className="card-surface p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-foreground font-medium">Próximos Posts</span>
                    <span className="text-xs text-muted-foreground">Hoje</span>
                  </div>
                  {[
                    { client: "Studio Design", network: "Instagram", status: "Agendado" },
                    { client: "Tech Corp", network: "LinkedIn", status: "Rascunho" },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-2 border-t border-border">
                      <span className="text-sm text-foreground">{row.client}</span>
                      <span className="text-xs text-muted-foreground">{row.network}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-md ${row.status === "Agendado" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
                        {row.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
