import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";

/**
 * E-mails transacionais via Edge Function `send-email` (Brevo no servidor).
 * Nunca use API key Brevo no bundle Vite.
 */
export async function sendTransactionalEmail(
  supabase: SupabaseClient<Database>,
  accessToken: string,
  payload: { to?: string; subject: string; htmlContent: string },
): Promise<{ ok: true } | { error: string }> {
  const { error } = await supabase.functions.invoke("send-email", {
    body: payload,
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (error) {
    return { error: error.message };
  }
  return { ok: true };
}
