import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function getKeyMaterial(): Uint8Array {
  const b64 = Deno.env.get("BYOK_MASTER_KEY_B64");
  if (!b64) throw new Error("BYOK_MASTER_KEY_B64 ausente");
  const raw = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  if (raw.length !== 32) {
    throw new Error("BYOK_MASTER_KEY_B64 deve decodificar para 32 bytes");
  }
  return raw;
}

async function encryptSecret(plaintext: string): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await crypto.subtle.importKey(
    "raw",
    getKeyMaterial(),
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt"],
  );
  const enc = new TextEncoder();
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext),
  );
  const combined = new Uint8Array(iv.length + cipher.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(cipher), iv.length);
  let bin = "";
  combined.forEach((b) => {
    bin += String.fromCharCode(b);
  });
  return btoa(bin);
}

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
  } = await userClient.auth.getUser();
  if (!user) {
    return new Response(JSON.stringify({ error: "Não autorizado" }), {
      status: 401,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let body: { cliente_id: number; api_key: string; usar_chave_plataforma?: boolean };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.cliente_id || !body.api_key?.trim()) {
    return new Response(JSON.stringify({ error: "cliente_id e api_key obrigatórios" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: perfil } = await admin.from("perfis").select("agencia_id").eq("id", user.id).maybeSingle();
  if (!perfil?.agencia_id) {
    return new Response(JSON.stringify({ error: "Sem agência" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: cliente } = await admin
    .from("clientes_workspace")
    .select("id, agencia_id")
    .eq("id", body.cliente_id)
    .maybeSingle();

  if (!cliente || cliente.agencia_id !== perfil.agencia_id) {
    return new Response(JSON.stringify({ error: "Cliente inválido" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let encrypted: string;
  try {
    encrypted = await encryptSecret(body.api_key.trim());
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { error: up } = await admin
    .from("clientes_workspace")
    .update({
      chave_api_llm: encrypted,
      usar_chave_plataforma: body.usar_chave_plataforma ?? false,
    })
    .eq("id", body.cliente_id);

  if (up) {
    return new Response(JSON.stringify({ error: up.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
