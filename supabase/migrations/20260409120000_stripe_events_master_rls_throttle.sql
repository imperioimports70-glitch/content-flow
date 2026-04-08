-- Stripe idempotência, rate limit e RLS para role master (leitura global)

CREATE OR REPLACE FUNCTION public.is_master_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.perfis
    WHERE id = auth.uid() AND role = 'master'
  );
$$;

-- stripe_events (webhook idempotência)
CREATE TABLE public.stripe_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id text NOT NULL UNIQUE,
  type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  processed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.stripe_events ENABLE ROW LEVEL SECURITY;

-- Apenas service_role / bypass em Edge; sem políticas para authenticated (Edge usa service)
CREATE POLICY stripe_events_master_read
  ON public.stripe_events FOR SELECT
  TO authenticated
  USING (public.is_master_user());

-- usage_throttle (100 req/min por agência — Edge Functions com service_role)
CREATE TABLE public.usage_throttle (
  agencia_id bigint NOT NULL REFERENCES public.agencias (id) ON DELETE CASCADE,
  window_start timestamptz NOT NULL,
  request_count integer NOT NULL DEFAULT 0,
  PRIMARY KEY (agencia_id, window_start)
);

ALTER TABLE public.usage_throttle ENABLE ROW LEVEL SECURITY;

-- Substitui políticas de agencias
DROP POLICY IF EXISTS agencias_select_same ON public.agencias;
DROP POLICY IF EXISTS agencias_update_same ON public.agencias;

CREATE POLICY agencias_select_tenant_or_master
  ON public.agencias FOR SELECT
  TO authenticated
  USING (public.is_master_user() OR id = public.get_auth_agencia_id());

CREATE POLICY agencias_update_own_tenant
  ON public.agencias FOR UPDATE
  TO authenticated
  USING (id = public.get_auth_agencia_id() AND NOT public.is_master_user())
  WITH CHECK (id = public.get_auth_agencia_id());

-- clientes_workspace: master lê tudo; escrita só tenant (não master sem agência)
DROP POLICY IF EXISTS clientes_workspace_all_tenant ON public.clientes_workspace;

CREATE POLICY clientes_workspace_select
  ON public.clientes_workspace FOR SELECT
  TO authenticated
  USING (public.is_master_user() OR agencia_id = public.get_auth_agencia_id());

CREATE POLICY clientes_workspace_insert
  ON public.clientes_workspace FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

CREATE POLICY clientes_workspace_update
  ON public.clientes_workspace FOR UPDATE
  TO authenticated
  USING (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id())
  WITH CHECK (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

CREATE POLICY clientes_workspace_delete
  ON public.clientes_workspace FOR DELETE
  TO authenticated
  USING (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

-- posts
DROP POLICY IF EXISTS posts_all_tenant ON public.posts;

CREATE POLICY posts_select
  ON public.posts FOR SELECT
  TO authenticated
  USING (public.is_master_user() OR agencia_id = public.get_auth_agencia_id());

CREATE POLICY posts_insert
  ON public.posts FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

CREATE POLICY posts_update
  ON public.posts FOR UPDATE
  TO authenticated
  USING (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id())
  WITH CHECK (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

CREATE POLICY posts_delete
  ON public.posts FOR DELETE
  TO authenticated
  USING (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

-- comentarios
DROP POLICY IF EXISTS comentarios_all_tenant ON public.comentarios;

CREATE POLICY comentarios_select
  ON public.comentarios FOR SELECT
  TO authenticated
  USING (public.is_master_user() OR agencia_id = public.get_auth_agencia_id());

CREATE POLICY comentarios_insert
  ON public.comentarios FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

CREATE POLICY comentarios_update
  ON public.comentarios FOR UPDATE
  TO authenticated
  USING (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id())
  WITH CHECK (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

CREATE POLICY comentarios_delete
  ON public.comentarios FOR DELETE
  TO authenticated
  USING (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

-- uso_recursos
DROP POLICY IF EXISTS uso_recursos_all_tenant ON public.uso_recursos;

CREATE POLICY uso_recursos_select
  ON public.uso_recursos FOR SELECT
  TO authenticated
  USING (public.is_master_user() OR agencia_id = public.get_auth_agencia_id());

CREATE POLICY uso_recursos_insert
  ON public.uso_recursos FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

CREATE POLICY uso_recursos_update
  ON public.uso_recursos FOR UPDATE
  TO authenticated
  USING (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id())
  WITH CHECK (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

CREATE POLICY uso_recursos_delete
  ON public.uso_recursos FOR DELETE
  TO authenticated
  USING (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

-- auditoria
DROP POLICY IF EXISTS auditoria_select_tenant ON public.auditoria;
DROP POLICY IF EXISTS auditoria_insert_tenant ON public.auditoria;

CREATE POLICY auditoria_select
  ON public.auditoria FOR SELECT
  TO authenticated
  USING (public.is_master_user() OR agencia_id = public.get_auth_agencia_id());

CREATE POLICY auditoria_insert
  ON public.auditoria FOR INSERT
  TO authenticated
  WITH CHECK (NOT public.is_master_user() AND agencia_id = public.get_auth_agencia_id());

-- perfis: master vê todos
DROP POLICY IF EXISTS perfis_select_tenant ON public.perfis;

CREATE POLICY perfis_select
  ON public.perfis FOR SELECT
  TO authenticated
  USING (
    public.is_master_user()
    OR id = auth.uid()
    OR agencia_id = public.get_auth_agencia_id()
  );
