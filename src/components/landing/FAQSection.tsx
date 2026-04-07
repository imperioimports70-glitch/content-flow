import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "Como funciona o período de teste gratuito?",
    a: "Você tem 7 dias para testar todas as funcionalidades do plano Agência. Não pedimos cartão de crédito. Ao final do período, escolha o plano que melhor se adequa.",
  },
  {
    q: "Posso usar minha própria chave de API da OpenAI?",
    a: "Sim. No plano Agência e White Label, você pode configurar sua própria chave (BYOK) para ter controle total sobre custos e limites da IA.",
  },
  {
    q: "Os dados dos meus clientes ficam seguros?",
    a: "Cada cliente opera em um workspace completamente isolado com Row-Level Security. Não há cruzamento de dados entre workspaces.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim. Todos os planos são mensais sem fidelidade. Cancele quando quiser diretamente no painel de configurações.",
  },
  {
    q: "O que acontece se eu ultrapassar o limite de clientes do meu plano?",
    a: "Você receberá uma notificação para fazer upgrade. Seus clientes existentes continuam funcionando normalmente.",
  },
];

const FAQSection = () => {
  return (
    <section className="py-24 section-divider">
      <div className="container max-w-2xl">
        <h2 className="text-heading text-foreground text-center mb-16">Perguntas frequentes</h2>
        <Accordion type="single" collapsible className="space-y-2">
          {faqs.map((faq, i) => (
            <AccordionItem key={i} value={`faq-${i}`} className="border border-border rounded-xl px-6 data-[state=open]:bg-card">
              <AccordionTrigger className="text-sm font-medium text-foreground hover:no-underline py-4">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="text-sm text-muted-foreground pb-4">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
};

export default FAQSection;
