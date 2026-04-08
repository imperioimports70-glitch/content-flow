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

  const { data: agencia } = await admin
    .from("agencias")
    .select("stripe_customer_id")
    .eq("id", perfil.agencia_id)
    .maybeSingle();

  if (!agencia?.stripe_customer_id) {
    return new Response(JSON.stringify({ error: "Cliente Stripe não vinculado" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const appUrl = Deno.env.get("PUBLIC_APP_URL") ?? "http://localhost:3000";
  const params = new URLSearchParams();
  params.append("customer", agencia.stripe_customer_id);
  params.append("return_url", `${appUrl}/dashboard/settings`);

  const res = await fetch("https://api.stripe.com/v1/billing_portal/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${stripeSecret}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const portal = await res.json();
  if (!res.ok) {
    return new Response(JSON.stringify({ error: portal.error?.message ?? "Stripe error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ url: portal.url }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
