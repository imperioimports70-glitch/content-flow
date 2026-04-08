-- ContentFlow.ai — schema inicial (PRD) + RLS por agencia_id
-- Nota: perfis.id = auth.users.id (UUID); demais PKs numéricas conforme PRD.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums
CREATE TYPE public.status_assinatura AS ENUM ('trial', 'active', 'past_due', 'canceled');
CREATE TYPE public.tom_de_voz AS ENUM ('profissional', 'descontraido', 'inspiracional', 'educativo');
CREATE TYPE public.role_perfil AS ENUM ('master', 'admin', 'colaborador');
CREATE TYPE public.rede_social AS ENUM ('instagram', 'linkedin', 'tiktok', 'twitter');
CREATE TYPE public.status_post AS ENUM ('rascunho', 'agendado', 'publicado', 'cancelado');
CREATE TYPE public.status_comentario AS ENUM ('pendente', 'aprovado', 'enviado');

-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- planos
CREATE TABLE public.planos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL,
  preco_mensal numeric(10, 2) NOT NULL,
  max_clientes integer NOT NULL,
  max_posts_mes integer NOT NULL,
  byok_habilitado boolean NOT NULL DEFAULT false,
  marca_propria boolean NOT NULL DEFAULT false,
  stripe_price_id text NOT NULL UNIQUE,
  features jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  cor text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER planos_updated_at
  BEFORE UPDATE ON public.planos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- agencias
CREATE TABLE public.agencias (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nome text NOT NULL,
  plano_id bigint NOT NULL REFERENCES public.planos (id),
  stripe_customer_id text UNIQUE,
  stripe_subscription_id text,
  status_assinatura public.status_assinatura NOT NULL DEFAULT 'trial',
  email text,
  telefone text,
  site text,
  data_adesao timestamptz,
  trial_ends_at timestamptz,
  proxima_cobranca timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX agencias_plano_id_idx ON public.agencias (plano_id);

CREATE TRIGGER agencias_updated_at
  BEFORE UPDATE ON public.agencias
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- clientes_workspace
CREATE TABLE public.clientes_workspace (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agencia_id bigint NOT NULL REFERENCES public.agencias (id) ON DELETE CASCADE,
  nome text NOT NULL,
  segmento text,
  sobre_marca text,
  tom_de_voz public.tom_de_voz,
  palavras_proibidas text,
  instrucoes_ia text,
  chave_api_llm text,
  usar_chave_plataforma boolean NOT NULL DEFAULT true,
  is_active boolean NOT NULL DEFAULT true,
  logo_url text,
  cor_primaria text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX clientes_workspace_agencia_id_idx ON public.clientes_workspace (agencia_id);

CREATE TRIGGER clientes_workspace_updated_at
  BEFORE UPDATE ON public.clientes_workspace
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- perfis (1:1 com auth.users)
CREATE TABLE public.perfis (
  id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  agencia_id bigint REFERENCES public.agencias (id) ON DELETE CASCADE,
  role public.role_perfil NOT NULL DEFAULT 'colaborador',
  email text,
  nome_completo text,
  cargo text,
  status text NOT NULL DEFAULT 'ativo',
  ultimo_acesso timestamptz,
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX perfis_agencia_id_idx ON public.perfis (agencia_id);

CREATE TRIGGER perfis_updated_at
  BEFORE UPDATE ON public.perfis
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Agência do usuário autenticado (após existir perfis; SECURITY DEFINER evita recursão em RLS)
CREATE OR REPLACE FUNCTION public.get_auth_agencia_id()
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT agencia_id FROM public.perfis WHERE id = auth.uid() LIMIT 1;
$$;

-- posts
CREATE TABLE public.posts (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agencia_id bigint NOT NULL REFERENCES public.agencias (id) ON DELETE CASCADE,
  cliente_id bigint NOT NULL REFERENCES public.clientes_workspace (id) ON DELETE CASCADE,
  criado_por uuid REFERENCES public.perfis (id) ON DELETE SET NULL,
  rede_social public.rede_social NOT NULL,
  legenda text NOT NULL,
  hashtags jsonb NOT NULL DEFAULT '[]'::jsonb,
  tom_usado text,
  status public.status_post NOT NULL DEFAULT 'rascunho',
  agendado_para timestamptz,
  publicado_em timestamptz,
  tokens_usados integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX posts_agencia_id_idx ON public.posts (agencia_id);
CREATE INDEX posts_cliente_id_idx ON public.posts (cliente_id);

CREATE TRIGGER posts_updated_at
  BEFORE UPDATE ON public.posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- comentarios
CREATE TABLE public.comentarios (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agencia_id bigint NOT NULL REFERENCES public.agencias (id) ON DELETE CASCADE,
  cliente_id bigint NOT NULL REFERENCES public.clientes_workspace (id) ON DELETE CASCADE,
  comentario_original text,
  resposta_gerada text,
  rede_social text,
  status public.status_comentario NOT NULL DEFAULT 'pendente',
  tokens_usados integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX comentarios_agencia_id_idx ON public.comentarios (agencia_id);
CREATE INDEX comentarios_cliente_id_idx ON public.comentarios (cliente_id);

CREATE TRIGGER comentarios_updated_at
  BEFORE UPDATE ON public.comentarios
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- uso_recursos
CREATE TABLE public.uso_recursos (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  agencia_id bigint NOT NULL REFERENCES public.agencias (id) ON DELETE CASCADE,
  mes_referencia date NOT NULL,
  posts_gerados integer NOT NULL DEFAULT 0,
  tokens_consumidos bigint NOT NULL DEFAULT 0,
  clientes_ativos integer NOT NULL DEFAULT 0,
  colaboradores_ativos integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (agencia_id, mes_referencia)
);

CREATE INDEX uso_recursos_agencia_id_idx ON public.uso_recursos (agencia_id);

CREATE TRIGGER uso_recursos_updated_at
  BEFORE UPDATE ON public.uso_recursos
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- auditoria
CREATE TABLE public.auditoria (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id uuid REFERENCES public.perfis (id) ON DELETE SET NULL,
  agencia_id bigint REFERENCES public.agencias (id) ON DELETE SET NULL,
  acao text NOT NULL,
  entidade_tipo text,
  entidade_id bigint,
  detalhes jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX auditoria_agencia_id_idx ON public.auditoria (agencia_id);

-- Seed planos (substituir stripe_price_id pelos IDs reais do Stripe ao integrar)
INSERT INTO public.planos (
  nome, preco_mensal, max_clientes, max_posts_mes, byok_habilitado, marca_propria, stripe_price_id, features, is_active, cor
) VALUES
  ('Starter', 97.00, 3, 30, false, false, 'price_starter_placeholder', '{}'::jsonb, true, '#7C3AED'),
  ('Agência', 247.00, 15, -1, true, false, 'price_agencia_placeholder', '{}'::jsonb, true, '#7C3AED'),
  ('White Label', 497.00, -1, -1, true, true, 'price_whitelabel_placeholder', '{}'::jsonb, true, '#7C3AED');

-- RLS
ALTER TABLE public.planos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_workspace ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comentarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.uso_recursos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.auditoria ENABLE ROW LEVEL SECURITY;

-- planos: leitura pública dos planos ativos (landing / pricing)
CREATE POLICY planos_select_public
  ON public.planos FOR SELECT
  TO anon, authenticated
  USING (is_active = true);

-- agencias: somente a própria agência
CREATE POLICY agencias_select_same
  ON public.agencias FOR SELECT
  TO authenticated
  USING (id = public.get_auth_agencia_id());

CREATE POLICY agencias_update_same
  ON public.agencias FOR UPDATE
  TO authenticated
  USING (id = public.get_auth_agencia_id())
  WITH CHECK (id = public.get_auth_agencia_id());

-- perfis: própria linha ou mesmo tenant (equipe)
CREATE POLICY perfis_select_tenant
  ON public.perfis FOR SELECT
  TO authenticated
  USING (
    id = auth.uid()
    OR agencia_id = public.get_auth_agencia_id()
  );

CREATE POLICY perfis_update_self
  ON public.perfis FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- clientes_workspace
CREATE POLICY clientes_workspace_all_tenant
  ON public.clientes_workspace FOR ALL
  TO authenticated
  USING (agencia_id = public.get_auth_agencia_id())
  WITH CHECK (agencia_id = public.get_auth_agencia_id());

-- posts
CREATE POLICY posts_all_tenant
  ON public.posts FOR ALL
  TO authenticated
  USING (agencia_id = public.get_auth_agencia_id())
  WITH CHECK (agencia_id = public.get_auth_agencia_id());

-- comentarios
CREATE POLICY comentarios_all_tenant
  ON public.comentarios FOR ALL
  TO authenticated
  USING (agencia_id = public.get_auth_agencia_id())
  WITH CHECK (agencia_id = public.get_auth_agencia_id());

-- uso_recursos
CREATE POLICY uso_recursos_all_tenant
  ON public.uso_recursos FOR ALL
  TO authenticated
  USING (agencia_id = public.get_auth_agencia_id())
  WITH CHECK (agencia_id = public.get_auth_agencia_id());

-- auditoria: somente eventos da própria agência
CREATE POLICY auditoria_select_tenant
  ON public.auditoria FOR SELECT
  TO authenticated
  USING (agencia_id = public.get_auth_agencia_id());

CREATE POLICY auditoria_insert_tenant
  ON public.auditoria FOR INSERT
  TO authenticated
  WITH CHECK (agencia_id = public.get_auth_agencia_id());
