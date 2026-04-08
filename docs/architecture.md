# Arquitetura — ContentFlow.ai

## Visão geral

- **Frontend:** Vite + React + React Router; UI com Shadcn/Radix/Tailwind.
- **Backend:** Supabase (Postgres + Auth + RLS). Operações sensíveis via **Edge Functions** com `service_role` nas secrets do projeto — nunca no bundle do Vite.
- **Pagamentos:** Stripe Checkout + Customer Portal + webhook (`create-checkout-session`, `create-portal-session`, `stripe-webhook`).
- **E-mail:** Brevo via Edge Function `send-email` (chave só no Supabase).

## Edge Functions (`supabase/functions`)

| Função | Papel |
|--------|--------|
| `provision-tenant` | Cria `agencias` + `perfis` após signup (JWT). |
| `create-checkout-session` | Stripe Checkout (JWT). |
| `create-portal-session` | Stripe Billing Portal (JWT). |
| `stripe-webhook` | Atualiza `agencias`; idempotência em `stripe_events` (**sem** JWT). |
| `store-byok-key` | Cifra e grava BYOK (AES-GCM + `BYOK_MASTER_KEY_B64`). |
| `invoke-llm` | Rate limit, assinatura, OpenAI, uso em `uso_recursos`. |
| `log-audit` | Insert em `auditoria` com JWT (RLS). |
| `send-email` | Disparo Brevo (JWT). |

## Multi-tenant

- Isolamento por **`agencia_id`** em todas as tabelas de domínio (PRD).
- Sub-tenant operacional: **`clientes_workspace`** por agência; o app deve sempre filtrar pelo **cliente (workspace) ativo** além de `agencia_id`.
- Função auxiliar no banco: `public.get_auth_agencia_id()` — retorna `perfis.agencia_id` do usuário autenticado (`auth.uid()`), com `SECURITY DEFINER` para avaliação de RLS sem recursão.

## Autenticação e perfis

- `auth.users` (Supabase Auth) usa **UUID** como `id`.
- Tabela **`perfis`**: `id` = `auth.users.id` (1:1). O PRD cita `int8` para várias entidades; para compatibilidade com Auth, **perfis e referências a usuário** usam **UUID**.
- **Master da plataforma:** `role = master` com leitura global via `is_master_user()` nas políticas RLS (migration `stripe_events_master_rls_throttle`).

## Fluxo de cadastro (Épico 1)

1. Usuário faz `signUp` no client com Supabase Auth.
2. Edge Function **`provision-tenant`** cria `agencias` + `perfis` (`role = admin`) com `service_role`.
3. Cliente passa a ler dados somente dentro da própria agência via RLS.

## BYOK e chaves LLM (Épicos 4+)

- Coluna `clientes_workspace.chave_api_llm`: armazenamento criptografado (pgcrypto / Vault); **nunca** exposta em SELECT para o frontend.
- Escrita/leitura de segredo apenas em Edge Function (ex.: `store-byok-key`, `invoke-llm`).
- **Gating:** assinatura ativa + (plano com chave da plataforma ou BYOK válido).

## Organização de código (alvo)

- `src/features/*` por domínio (auth, dashboard, gerador, clientes, etc.).
- `src/lib/supabase/client.ts` — cliente anon.
- `supabase/migrations/` — DDL e RLS versionados; deploy via MCP Supabase / CLI alinhado ao projeto.

## Variáveis de ambiente

- **Vite:** apenas `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em `.env.local` (já ignorado pelo git).
- **Edge Functions / Netlify (build):** secrets no painel Supabase; não duplicar `service_role` no frontend.
