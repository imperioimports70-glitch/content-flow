const steps = [
  {
    num: "01",
    title: "Cadastre cada cliente",
    desc: "Cada cliente opera como um workspace isolado com dados, marca e configurações independentes.",
  },
  {
    num: "02",
    title: "Configure a identidade da marca",
    desc: "Defina tom de voz, palavras-chave e instruções de IA uma única vez. A IA respeita cada marca.",
  },
  {
    num: "03",
    title: "Gere e agende conteúdo",
    desc: "Crie posts para todos os clientes com um clique. Agende, revise e publique direto da plataforma.",
  },
];

const HowItWorksSection = () => {
  return (
    <section id="como-funciona" className="py-24 section-divider">
      <div className="container">
        <h2 className="text-heading text-foreground text-center mb-16">Como funciona</h2>
        <div className="grid md:grid-cols-3 gap-12">
          {steps.map((step) => (
            <div key={step.num} className="space-y-4">
              <span className="text-[48px] font-bold text-border leading-none">{step.num}</span>
              <h3 className="text-title-md text-foreground">{step.title}</h3>
              <p className="text-body text-muted-foreground">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
