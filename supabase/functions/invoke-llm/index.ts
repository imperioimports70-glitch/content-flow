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

async function decryptSecret(payload: string): Promise<string> {
  const buf = Uint8Array.from(atob(payload), (c) => c.charCodeAt(0));
  const iv = buf.slice(0, 12);
  const data = buf.slice(12);
  const key = await crypto.subtle.importKey(
    "raw",
    getKeyMaterial(),
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"],
  );
  const dec = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, data);
  return new TextDecoder().decode(dec);
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

  let body: {
    cliente_id: number;
    prompt: string;
    rede_social?: string;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "JSON inválido" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  if (!body.cliente_id || !body.prompt?.trim()) {
    return new Response(JSON.stringify({ error: "cliente_id e prompt obrigatórios" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const admin = createClient(supabaseUrl, serviceKey);

  const { data: perfil } = await admin.from("perfis").select("agencia_id, role").eq("id", user.id).maybeSingle();
  if (!perfil?.agencia_id) {
    return new Response(JSON.stringify({ error: "Sem agência" }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: allowed, error: rlErr } = await admin.rpc("check_and_increment_rate_limit", {
    p_agencia_id: perfil.agencia_id,
    p_max_per_minute: 100,
  });

  if (rlErr || allowed !== true) {
    return new Response(JSON.stringify({ error: "Limite de requisições (100/min) excedido" }), {
      status: 429,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: agencia } = await admin
    .from("agencias")
    .select("status_assinatura, trial_ends_at, plano_id")
    .eq("id", perfil.agencia_id)
    .single();

  const now = new Date();
  const trialOk =
    agencia?.status_assinatura === "trial" &&
    agencia.trial_ends_at &&
    new Date(agencia.trial_ends_at) > now;
  const activeOk = agencia?.status_assinatura === "active";
  if (perfil.role !== "master" && !trialOk && !activeOk) {
    return new Response(JSON.stringify({ error: "Assinatura inativa" }), {
      status: 402,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const { data: plano } = await admin.from("planos").select("byok_habilitado").eq("id", agencia?.plano_id ?? 0).maybeSingle();

  const { data: cliente } = await admin
    .from("clientes_workspace")
    .select("nome, instrucoes_ia, chave_api_llm, usar_chave_plataforma")
    .eq("id", body.cliente_id)
    .eq("agencia_id", perfil.agencia_id)
    .maybeSingle();

  if (!cliente) {
    return new Response(JSON.stringify({ error: "Cliente não encontrado" }), {
      status: 404,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  let apiKey: string | null = null;
  if (!cliente.usar_chave_plataforma && cliente.chave_api_llm) {
    if (!plano?.byok_habilitado) {
      return new Response(JSON.stringify({ error: "Plano não permite BYOK" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    try {
      apiKey = await decryptSecret(cliente.chave_api_llm);
    } catch {
      return new Response(JSON.stringify({ error: "Falha ao ler chave BYOK" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  } else {
    apiKey = Deno.env.get("OPENAI_API_KEY") ?? null;
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Chave da plataforma não configurada" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
  }

  const system = cliente.instrucoes_ia?.trim()
    ? cliente.instrucoes_ia
    : `Você gera legendas curtas para ${body.rede_social ?? "redes sociais"} da marca ${cliente.nome}. Responda só com JSON {"legendas": string[], "hashtags": string[]}.`;

  const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: system },
        { role: "user", content: body.prompt },
      ],
      temperature: 0.7,
    }),
  });

  const json = await openaiRes.json();
  if (!openaiRes.ok) {
    return new Response(JSON.stringify({ error: json.error?.message ?? "OpenAI error" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  const text = json.choices?.[0]?.message?.content ?? "";
  let parsed: { legendas?: string[]; hashtags?: string[] };
  try {
    parsed = JSON.parse(text) as { legendas?: string[]; hashtags?: string[] };
  } catch {
    parsed = { legendas: [text], hashtags: [] };
  }

  const tokens = json.usage?.total_tokens ?? 0;
  const postCount = Array.isArray(parsed.legendas) ? parsed.legendas.length : 1;

  const mes = new Date();
  const mesRef = `${mes.getUTCFullYear()}-${String(mes.getUTCMonth() + 1).padStart(2, "0")}-01`;

  const { data: uso } = await admin
    .from("uso_recursos")
    .select("id, tokens_consumidos, posts_gerados")
    .eq("agencia_id", perfil.agencia_id)
    .eq("mes_referencia", mesRef)
    .maybeSingle();

  if (uso) {
    await admin
      .from("uso_recursos")
      .update({
        tokens_consumidos: Number(uso.tokens_consumidos ?? 0) + tokens,
        posts_gerados: Number(uso.posts_gerados ?? 0) + postCount,
      })
      .eq("id", uso.id);
  } else {
    await admin.from("uso_recursos").insert({
      agencia_id: perfil.agencia_id,
      mes_referencia: mesRef,
      tokens_consumidos: tokens,
      posts_gerados: postCount,
    });
  }

  return new Response(
    JSON.stringify({
      legendas: parsed.legendas ?? [],
      hashtags: parsed.hashtags ?? [],
      tokens_usados: tokens,
    }),
    { headers: { ...corsHeaders, "Content-Type": "application/json" } },
  );
});
