import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
  const authHeader = req.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error: userErr,
  } = await userClient.auth.getUser();
  if (userErr || !user) {
    return new Response(JSON.stringify({ error: "Usuário inválido" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: existing } = await admin.from("perfis").select("id").eq("id", user.id).maybeSingle();
  if (existing) {
    return new Response(JSON.stringify({ ok: true, provisioned: false }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: starter, error: planoErr } = await admin
    .from("planos")
    .select("id")
    .eq("nome", "Starter")
    .limit(1)
    .maybeSingle();

  if (planoErr || !starter) {
    return new Response(JSON.stringify({ error: "Plano Starter não encontrado" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const nomeAgencia =
    (typeof user.user_metadata?.nome_agencia === "string" && user.user_metadata.nome_agencia) ||
    "Minha agência";
  const trialEnds = new Date();
  trialEnds.setDate(trialEnds.getDate() + 7);

  const { data: agencia, error: agErr } = await admin
    .from("agencias")
    .insert({
      nome: nomeAgencia,
      plano_id: starter.id,
      status_assinatura: "trial",
      trial_ends_at: trialEnds.toISOString(),
      data_adesao: new Date().toISOString(),
      email: user.email ?? null,
    })
    .select("id")
    .single();

  if (agErr || !agencia) {
    return new Response(JSON.stringify({ error: agErr?.message ?? "Falha ao criar agência" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const nomeCompleto =
    typeof user.user_metadata?.nome_completo === "string" ? user.user_metadata.nome_completo : null;

  const { error: pErr } = await admin.from("perfis").insert({
    id: user.id,
    agencia_id: agencia.id,
    role: "admin",
    email: user.email ?? null,
    nome_completo: nomeCompleto,
  });

  if (pErr) {
    return new Response(JSON.stringify({ error: pErr.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(
    JSON.stringify({ ok: true, provisioned: true, agencia_id: agencia.id }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
