const logos = ["Agência Pulse", "DigitalMKT", "SocialBR", "Midia.Pro", "ConteúdoLab"];

const SocialProofSection = () => {
  return (
    <section className="py-16 bg-card section-divider">
      <div className="container">
        <p className="text-center text-sm text-muted-foreground mb-10">
          Usado por agências em todo o Brasil
        </p>
        <div className="flex flex-wrap justify-center gap-12">
          {logos.map((name) => (
            <span key={name} className="text-lg font-semibold text-text-disabled tracking-tight">
              {name}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default SocialProofSection;
