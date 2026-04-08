import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";
import Stripe from "https://esm.sh/stripe@17.4.0?target=deno";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, stripe-signature",
};

function mapStripeStatus(
  s: string,
): "trial" | "active" | "past_due" | "canceled" {
  switch (s) {
    case "active":
    case "trialing":
      return "active";
    case "past_due":
      return "past_due";
    case "canceled":
    case "unpaid":
      return "canceled";
    default:
      return "active";
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!stripeSecret || !webhookSecret) {
    return new Response("Config ausente", { status: 500 });
  }

  const stripe = new Stripe(stripeSecret, {
    httpClient: Stripe.createFetchHttpClient(),
  });

  const body = await req.text();
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new Response("No signature", { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch {
    return new Response("Invalid signature", { status: 400 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const admin = createClient(supabaseUrl, serviceKey);

  const { error: dup } = await admin.from("stripe_events").insert({
    stripe_event_id: event.id,
    type: event.type,
    payload: event as unknown as Record<string, unknown>,
  });
  if (dup?.code === "23505") {
    return new Response(JSON.stringify({ received: true, duplicate: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const agenciaId = session.metadata?.agencia_id
        ? Number(session.metadata.agencia_id)
        : session.client_reference_id
          ? Number(session.client_reference_id)
          : NaN;
      if (Number.isFinite(agenciaId) && session.customer) {
        const subId =
          typeof session.subscription === "string"
            ? session.subscription
            : session.subscription?.id ?? null;
        await admin
          .from("agencias")
          .update({
            stripe_customer_id: String(session.customer),
            stripe_subscription_id: subId,
            status_assinatura: "active",
          })
          .eq("id", agenciaId);
      }
    }

    if (event.type.startsWith("customer.subscription.")) {
      const sub = event.data.object as Stripe.Subscription;
      const customerId = String(sub.customer);
      const { data: rows } = await admin
        .from("agencias")
        .select("id")
        .eq("stripe_customer_id", customerId)
        .limit(1);
      const aid = rows?.[0]?.id;
      if (aid) {
        await admin
          .from("agencias")
          .update({
            stripe_subscription_id: sub.id,
            status_assinatura: mapStripeStatus(sub.status),
            proxima_cobranca: sub.current_period_end
              ? new Date(sub.current_period_end * 1000).toISOString()
              : null,
          })
          .eq("id", aid);
      }
    }
  } catch (e) {
    console.error(e);
    return new Response(JSON.stringify({ error: String(e) }), { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
