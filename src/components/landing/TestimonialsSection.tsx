const testimonials = [
  {
    name: "Carolina M.",
    role: "Diretora de Conteúdo",
    agency: "Agência Pulse",
    initial: "C",
    text: "Reduzi de 4 horas para 30 minutos a produção semanal de conteúdo para 12 clientes. A IA entende o tom de cada marca.",
    result: "Redução de 80% no tempo de produção",
  },
  {
    name: "Rafael S.",
    role: "Social Media Freelancer",
    agency: "Autônomo",
    initial: "R",
    text: "Consigo gerenciar 20 clientes sozinho. O calendário editorial e as legendas geradas são excelentes.",
    result: "3x mais clientes sem contratar",
  },
  {
    name: "Juliana T.",
    role: "CEO",
    agency: "DigitalMKT",
    initial: "J",
    text: "O isolamento multi-tenant é perfeito. Cada cliente tem seu workspace com dados completamente separados.",
    result: "Zero incidentes de dados cruzados",
  },
];

const TestimonialsSection = () => {
  return (
    <section className="py-24 section-divider">
      <div className="container">
        <h2 className="text-heading text-foreground text-center mb-16">O que dizem nossos clientes</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="card-surface p-6 rounded-xl flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-elevation flex items-center justify-center text-sm font-semibold text-foreground">
                    {t.initial}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}, {t.agency}</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">&ldquo;{t.text}&rdquo;</p>
              </div>
              <p className="text-sm font-medium text-success mt-6">{t.result}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;
