# Go-Live — Checklist ContentFlow.ai

## Pré-deploy

- [ ] `stripe_price_id` reais configurados na tabela `planos` (modo live).
- [ ] Secrets Stripe live (`STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`) nas Edge Functions.
- [ ] `PUBLIC_APP_URL` = URL de produção (Netlify).
- [ ] `BYOK_MASTER_KEY_B64` definido e **não** reutilizar chave de desenvolvimento.
- [ ] `OPENAI_API_KEY` de produção (limite e faturamento revisados).
- [ ] Brevo: domínio/remetente verificados; `BREVO_SENDER_EMAIL` correto.
- [ ] Supabase: políticas RLS revisadas; backup automático habilitado.
- [ ] Usuário `master` criado manualmente (`perfis.role = master`, `agencia_id` nulo se aplicável).

## Deploy

- [ ] Migrations aplicadas antes do tráfego.
- [ ] Edge Functions deployadas com a mesma versão do repositório.
- [ ] Netlify build verde com variáveis `VITE_*`.

## Pós-deploy

- [ ] Smoke: login, provisionamento, seleção de cliente, gerador (ambiente de staging primeiro).
- [ ] Webhook Stripe: evento de teste recebido e `stripe_events` idempotente.
- [ ] Monitoramento: logs Supabase + Netlify nas primeiras horas.
- [ ] Plano de rollback: tag Git + anotação da migration revertida se necessário.
- [ ] Comunicação ao time: janela de deploy e canal de incidentes.
