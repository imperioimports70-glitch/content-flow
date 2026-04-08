import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

function assertClientConfig(): { url: string; anonKey: string } {
  if (!url || !anonKey) {
    throw new Error(
      "Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY em .env.local (veja .env.example).",
    );
  }
  return { url, anonKey };
}

let browserClient: SupabaseClient<Database> | null = null;

/**
 * Cliente Supabase para o browser. Usa apenas a chave anon — nunca service_role aqui.
 * Lógica sensível (webhooks, BYOK, billing) fica em Edge Functions.
 */
export function getSupabaseBrowserClient(): SupabaseClient<Database> {
  if (browserClient) return browserClient;
  const cfg = assertClientConfig();
  browserClient = createClient<Database>(cfg.url, cfg.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
  return browserClient;
}
