/**
 * Deploy de todas as Edge Functions em supabase/functions/.
 * Pré-requisitos: `npx supabase login` (ou SUPABASE_ACCESS_TOKEN) e `npx supabase link --project-ref <ref>`.
 */
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const functions = [
  "provision-tenant",
  "create-checkout-session",
  "create-portal-session",
  { name: "stripe-webhook", extraArgs: ["--no-verify-jwt"] },
  "store-byok-key",
  "invoke-llm",
  "log-audit",
  "send-email",
];

for (const def of functions) {
  const name = typeof def === "string" ? def : def.name;
  const extra = typeof def === "string" ? [] : def.extraArgs ?? [];
  const cmd = ["npx", "supabase", "functions", "deploy", name, ...extra].join(" ");
  console.log(`\n→ ${cmd}\n`);
  execSync(cmd, { stdio: "inherit", cwd: root, env: process.env });
}

console.log("\n✓ Deploy de todas as funções concluído.\n");
