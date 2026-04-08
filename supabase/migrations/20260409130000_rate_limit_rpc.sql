-- Incremento atômico de rate limit por agência (janela de 1 minuto). Chamado via service_role nas Edge Functions.

CREATE OR REPLACE FUNCTION public.check_and_increment_rate_limit(
  p_agencia_id bigint,
  p_max_per_minute integer DEFAULT 100
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  w timestamptz := date_trunc('minute', now());
  new_count integer;
BEGIN
  INSERT INTO public.usage_throttle (agencia_id, window_start, request_count)
  VALUES (p_agencia_id, w, 1)
  ON CONFLICT (agencia_id, window_start)
  DO UPDATE SET request_count = public.usage_throttle.request_count + 1
  RETURNING request_count INTO new_count;

  RETURN new_count <= p_max_per_minute;
END;
$$;

REVOKE ALL ON FUNCTION public.check_and_increment_rate_limit(bigint, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_and_increment_rate_limit(bigint, integer) TO service_role;
