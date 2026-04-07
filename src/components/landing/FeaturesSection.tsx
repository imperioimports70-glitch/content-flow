import { Sparkles, Calendar, MessageSquare, Hash, BarChart3, Shield } from "lucide-react";

const features = [
  { icon: Sparkles, title: "Gerador de Legendas com IA", desc: "Crie legendas únicas para cada cliente, respeitando tom de voz e identidade da marca." },
  { icon: Calendar, title: "Calendário Editorial Visual", desc: "Visualize e organize posts por cliente em um calendário drag-and-drop intuitivo." },
  { icon: MessageSquare, title: "Resposta Automática de Comentários", desc: "IA responde comentários mantendo a personalidade da marca do cliente." },
  { icon: Hash, title: "Biblioteca de Hashtags", desc: "Hashtags segmentadas por nicho e cliente, sempre atualizadas para máximo alcance." },
  { icon: BarChart3, title: "Relatório de Desempenho", desc: "Métricas detalhadas por cliente com insights acionáveis gerados por IA." },
  { icon: Shield, title: "Isolamento Multi-tenant", desc: "Cada workspace é completamente isolado. Dados, configurações e acessos separados." },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 section-divider">
      <div className="container">
        <h2 className="text-heading text-foreground text-center mb-4">Funcionalidades</h2>
        <p className="text-body text-muted-foreground text-center mb-16 max-w-2xl mx-auto">
          Tudo que sua agência precisa para escalar a produção de conteúdo sem aumentar a equipe.
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div key={f.title} className="card-surface p-6 rounded-xl space-y-4">
              <f.icon className="w-5 h-5 text-primary" />
              <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
