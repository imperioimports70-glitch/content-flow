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

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeSecret) {
    return new Response(JSON.stringify({ error: "STRIPE_SECRET_KEY não configurada" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
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
  } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey);
  const { data: perfil } = await admin.from("perfis").select("agencia_id").eq("id", user.id).maybeSingle();
  if (!perfil?.agencia_id) {
    return new Response(JSON.stringify({ error: "Perfil sem agência" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { price_id?: string; plano_id?: number };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let priceId = body.price_id;
  if (!priceId && body.plano_id) {
    const { data: plano } = await admin.from("planos").select("stripe_price_id").eq("id", body.plano_id).maybeSingle();
    priceId = plano?.stripe_price_id ?? undefined;
  }
  if (!priceId || priceId.includes("placeholder")) {
    return new Response(
      JSON.stringify({
        error: "Defina stripe_price_id real no plano ou envie price_id (modo teste Stripe).",
      }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  const appUrl = Deno.env.get("PUBLIC_APP_URL") ?? "http://localhost:3000";

  const { data: agencia } = await admin.from("agencias").select("id, stripe_customer_id").eq("id", perfil.agencia_id).single();

  const params = new URLSearchParams();
  params.append("mode", "subscription");
  params.append("success_url", `${appUrl}/dashboard/settings?checkout=success`);
  params.append("cancel_url", `${appUrl}/dashboard/settings?checkout=cancel`);
  params.append("line_items[0][price]", priceId);
  params.append("line_items[0][quantity]", "1");
  params.append("client_reference_id", String(perfil.agencia_id));
  params.append("metadata[agencia_id]", String(perfil.agencia_id));

  let customerId = agencia?.stripe_customer_id;
  if (!customerId) {
    params.append("customer_email", user.email ?? "");
  } else {
    params.append("customer", customerId);
  }

  const res = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const session = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: session.error?.message ?? "Stripe error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ url: session.url }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
