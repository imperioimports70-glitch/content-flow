import { Button } from "@/components/ui/button";
import { Check, Minus, Loader2 } from "lucide-react";
import { useDelayedNavigate } from "@/hooks/useDelayedNavigate";

interface Plan {
  name: string;
  price: string;
  desc: string;
  highlight?: boolean;
  features: { label: string; included: boolean }[];
}

const plans: Plan[] = [
  {
    name: "Starter",
    price: "R$47",
    desc: "Para freelancers começando",
    features: [
      { label: "3 clientes", included: true },
      { label: "30 posts/mês com IA", included: true },
      { label: "Calendário editorial", included: true },
      { label: "Relatórios completos", included: false },
      { label: "BYOK API", included: false },
      { label: "Marca própria", included: false },
    ],
  },
  {
    name: "Agência",
    price: "R$97",
    desc: "Para agências em crescimento",
    highlight: true,
    features: [
      { label: "15 clientes", included: true },
      { label: "Posts ilimitados com IA", included: true },
      { label: "Calendário editorial", included: true },
      { label: "Relatórios completos", included: true },
      { label: "BYOK API", included: true },
      { label: "Marca própria", included: false },
    ],
  },
  {
    name: "White Label",
    price: "R$197",
    desc: "Para agências enterprise",
    features: [
      { label: "Clientes ilimitados", included: true },
      { label: "Posts ilimitados com IA", included: true },
      { label: "Calendário editorial", included: true },
      { label: "Relatórios completos", included: true },
      { label: "BYOK API", included: true },
      { label: "Marca própria + suporte prioritário", included: true },
    ],
  },
];

const PricingSection = () => {
  const { delayedNavigate, isNavigating } = useDelayedNavigate();

  return (
    <section className="py-24 section-divider">
      <div className="container">
        <h2 className="text-heading text-foreground text-center mb-4">Planos</h2>
        <p className="text-body text-muted-foreground text-center mb-16">
          Escolha o plano ideal para o tamanho da sua operação.
        </p>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`card-surface p-6 rounded-xl flex flex-col ${plan.highlight ? "border-primary/40 relative" : ""}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-medium bg-primary text-primary-foreground px-3 py-1 rounded-full">
                  Mais escolhido
                </span>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-3xl font-bold text-foreground">{plan.price}</span>
                <span className="text-sm text-muted-foreground">/mês</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-3 text-sm">
                    {f.included ? (
                      <Check className="w-4 h-4 text-success shrink-0" />
                    ) : (
                      <Minus className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground"}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.highlight ? "default" : "ghost"}
                className="w-full"
                disabled={isNavigating}
                onClick={() => delayedNavigate("/auth/register")}
              >
                {isNavigating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Começar agora"}
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
