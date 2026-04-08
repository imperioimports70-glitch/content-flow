

## Plano de Melhorias: Transição Suave, Preços e Acessibilidade

### 1. Transição suave na navegação
Criar um componente ou hook que adiciona um delay com loading state antes de redirecionar. Ao clicar em links de navegação (CTAs, botões da nav), mostrar um breve estado de carregamento (~600ms) antes de navegar — dando sensação de robustez.

- Criar um hook `useDelayedNavigate` que usa `useNavigate` + `setTimeout`
- Substituir `<Link>` nos botões CTA por `onClick` com navegação delayed
- Aplicar nos botões da Landing Page (Hero, Pricing, Nav)

### 2. Reduzir preços
- Starter: R$97 → R$47/mês
- Agência: R$247 → R$97/mês
- White Label: R$497 → R$197/mês

### 3. Acessibilidade de cores
- `text-text-disabled` (#3F3F46) é difícil de ler sobre fundo escuro. Ajustar para ~#52525B (zinc-600) nos itens não incluídos da tabela de preços
- `text-muted-foreground` (#71717A) está ok — contraste suficiente
- Verificar que botões ghost tenham contraste adequado

### Arquivos a editar
- `src/hooks/useDelayedNavigate.ts` — novo hook
- `src/components/landing/PricingSection.tsx` — preços + navegação delayed + cor acessível
- `src/components/landing/HeroSection.tsx` — navegação delayed nos CTAs
- `src/components/landing/LandingNav.tsx` — navegação delayed nos botões
- `src/index.css` — ajustar `--text-disabled` para valor mais legível

