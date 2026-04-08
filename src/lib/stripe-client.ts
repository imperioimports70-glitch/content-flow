import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

export async function startStripeCheckout(
  supabase: SupabaseClient<Database>,
  accessToken: string,
  input: { planoId?: number; priceId?: string },
): Promise<{ url: string } | { error: string }> {
  const { data, error } = await supabase.functions.invoke("create-checkout-session", {
    body: input,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) {
    return { error: error.message };
  }
  const url = (data as { url?: string })?.url;
  if (!url) {
    return { error: "Resposta sem URL de checkout" };
  }
  return { url };
}

export async function openStripePortal(
  supabase: SupabaseClient<Database>,
  accessToken: string,
): Promise<{ url: string } | { error: string }> {
  const { data, error } = await supabase.functions.invoke("create-portal-session", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) {
    return { error: error.message };
  }
  const url = (data as { url?: string })?.url;
  if (!url) {
    return { error: "Resposta sem URL do portal" };
  }
  return { url };
}
