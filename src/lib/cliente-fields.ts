/**
 * Colunas seguras para SELECT no browser — nunca incluir chave_api_llm.
 */
export const CLIENTE_WORKSPACE_PUBLIC_COLUMNS =
  "id, agencia_id, nome, segmento, sobre_marca, tom_de_voz, palavras_proibidas, instrucoes_ia, usar_chave_plataforma, is_active, logo_url, cor_primaria, created_at, updated_at" as const;
