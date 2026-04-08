# CI/CD — ContentFlow.ai

## Netlify (frontend)

- Build: `pnpm run build`
- Publish: `dist`
- Variáveis: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (sem secrets de service role).
- SPA: `netlify.toml` redireciona rotas para `index.html`.

## Supabase (backend)

Ordem recomendada:

1. Aplicar migrations em `supabase/migrations/` (SQL Editor, CLI ou MCP Supabase `apply_migration`).
2. Configurar secrets das Edge Functions no painel Supabase:
   - `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `PUBLIC_APP_URL`
   - `BYOK_MASTER_KEY_B64` (32 bytes em base64)
   - `OPENAI_API_KEY` (chave da plataforma para `usar_chave_plataforma`)
   - `BREVO_API_KEY`, `BREVO_SENDER_EMAIL` (opcional)
3. Deploy das funções em `supabase/functions/*` (CLI `supabase functions deploy` ou MCP `deploy_edge_function`).
4. Stripe: apontar webhook para `https://<ref>.supabase.co/functions/v1/stripe-webhook` (JWT desativado nessa função).

## Gates locais / CI

- `pnpm run lint`
- `pnpm run test`
- `pnpm run build`
- E2E: subir `pnpm dev` na porta 3000 e rodar `pnpm run test:e2e`.
