Documento de Requisitos do Produto — Versão Final
1. VISÃO GERAL
O projeto é a construção de uma Plataforma de Gestão de Conteúdo com IA (SaaS Multi-tenant), denominada ContentFlow.ai, para agências e freelancers de Social Media gerenciarem múltiplos clientes de forma centralizada e automatizada.

A plataforma permite que agências (Tenants) se cadastrem, gerenciem seus clientes como workspaces isolados e utilizem IA (OpenAI/Claude) para geração de legendas, calendários editoriais e respostas de comentários, preservando a voz de cada marca.

Pilares do Produto:

Multi-tenancy Segura (RLS): Cada cliente da agência é um workspace isolado — dados nunca se cruzam

Modelo BYOK (Bring Your Own Key): A plataforma cobra a taxa de serviço; agências no plano Agência/White Label inserem sua própria chave API de LLM

Gestão Centralizada: Painéis separados para o Dono da Plataforma (Master), Admin da Agência (Tenant) e Colaboradores

2. METAS
Multi-tenancy Segura: Segregação estrita de dados entre workspaces de clientes usando RLS do Supabase

Monetização Recorrente: Stripe para assinaturas mensais (Starter R$97 / Agência R$247 / White Label R$497)

Geração de Conteúdo com IA: Integração real com OpenAI/Claude para geração de legendas, hashtags e respostas de comentários por cliente

Conversão via Tráfego Pago: Landing Page otimizada com Pricing claro, trial de 7 dias e CTA direto para Stripe Checkout

Segurança de Dados: Criptografia de chaves API, conformidade LGPD

Comunicação Automatizada: E-mails transacionais via Brevo (boas-vindas, alertas de limite, confirmação de pagamento)

3. STACK TECNOLÓGICA
Framework: React + Vite (base do protótipo Lovable)

Roteamento: React Router DOM (Client-Side)

Desenvolvimento: Cursor + VSCode

Banco de Dados: Supabase (PostgreSQL, Auth, RLS, Storage)

Pagamentos: Stripe (Assinaturas SaaS, Webhooks)

E-mails: Brevo (E-mails Transacionais)

IA/LLM: OpenAI/Claude via Chave BYOK + AI SDK

Hosting/CI/CD: Netlify (configurado para build Vite)

UI/Design: Shadcn/UI + Tailwind CSS + Lucide React + Recharts

4. PÁGINAS E FUNCIONALIDADES ESSENCIAIS
Landing Page / Pricing (Pública): Apresentação do produto, seção "Como Funciona", depoimentos, pricing em 3 planos, CTA para Stripe Checkout

Auth (Login/Cadastro): Cadastro cria automaticamente o Tenant da agência + perfil Admin. Login seguro via Supabase Auth

Dashboard Visão Geral (Colaborador): Métricas de posts agendados, comentários respondidos, clientes ativos e horas economizadas. Acesso liberado por assinatura ativa

Gerador de Conteúdo com IA (Tela Principal): Formulário de geração por cliente com seleção de rede social, tom de voz e quantidade de posts. Resultado editável inline com agendamento direto

Calendário Editorial por Cliente: Visualização mensal dos posts agendados por workspace

Respostas de Comentários com IA: Interface para responder comentários automaticamente com a voz da marca configurada

Relatórios por Cliente: Performance de posts, engajamento e uso de IA por workspace

Admin Dashboard Tenant (Agência): Configuração da identidade e voz de cada cliente, inserção de Chave API BYOK, gerenciamento de colaboradores (CRUD), gestão de assinatura via Stripe Portal

Dashboard Master (Dono da Plataforma): MRR, clientes ativos, churn, posts gerados, gráficos de crescimento e distribuição por plano, tabela de todos os tenants, logs de auditoria

Controle de Limites de Uso: Tracking automático de posts gerados e mensagens consumidas por tenant por mês, validação contra limites do plano

Sistema de Auditoria: Log de todas as ações administrativas (master e admin)

5. MODELO DE DADOS
Convenções: Chaves primárias id tipo int8 (Bigint Autonumeração). Timestamps: TIMESTAMPTZ

Tabela: planos

id: int8 (PK)

nome: String — ('Starter', 'Agência', 'White Label')

preco_mensal: Decimal(10,2) — (97.00 / 247.00 / 497.00)

max_clientes: Integer — (3 / 15 / ilimitado = -1)

max_posts_mes: Integer — (30 / ilimitado = -1 / ilimitado = -1)

byok_habilitado: Boolean

marca_propria: Boolean

stripe_price_id: String (UNIQUE)

Demais: features JSONB, is_active, cor, created_at, updated_at

Tabela: agencias (Tenants)

id: int8 (PK)

nome: String (NOT NULL)

plano_id: int8 (FK → planos)

stripe_customer_id: String (UNIQUE)

stripe_subscription_id: String

status_assinatura: Enum ('trial', 'active', 'past_due', 'canceled')

Demais: email, telefone, site, data_adesao, trial_ends_at, proxima_cobranca, is_active, created_at, updated_at

Tabela: clientes_workspace (Clientes da Agência — sub-tenants)

id: int8 (PK)

agencia_id: int8 (FK → agencias — ESSENCIAL para RLS)

nome: String (NOT NULL)

segmento: String

sobre_marca: Text

tom_de_voz: Enum ('profissional', 'descontraido', 'inspiracional', 'educativo')

palavras_proibidas: Text

instrucoes_ia: Text (System prompt customizado da marca)

chave_api_llm: String (ENCRYPTED — BYOK)

usar_chave_plataforma: Boolean DEFAULT true

is_active: Boolean

Demais: logo_url, cor_primaria, created_at, updated_at

Tabela: perfis (Colaboradores da Agência)

id: int8 (PK, FK → auth.users)

agencia_id: int8 (FK → agencias — ESSENCIAL para RLS)

role: Enum ('master', 'admin', 'colaborador')

Demais: email, nome_completo, cargo, status, ultimo_acesso, avatar_url, created_at, updated_at

Tabela: posts (Conteúdo Gerado)

id: int8 (PK)

agencia_id: int8 (FK → agencias — RLS)

cliente_id: int8 (FK → clientes_workspace)

criado_por: int8 (FK → perfis)

rede_social: Enum ('instagram', 'linkedin', 'tiktok', 'twitter')

legenda: Text (NOT NULL)

hashtags: JSONB

tom_usado: String

status: Enum ('rascunho', 'agendado', 'publicado', 'cancelado')

agendado_para: TIMESTAMPTZ

publicado_em: TIMESTAMPTZ

Demais: tokens_usados, created_at, updated_at

Tabela: comentarios (Respostas Automáticas)

id: int8 (PK)

agencia_id: int8 (FK → agencias — RLS)

cliente_id: int8 (FK → clientes_workspace)

comentario_original: Text

resposta_gerada: Text

rede_social: String

status: Enum ('pendente', 'aprovado', 'enviado')

Demais: tokens_usados, created_at, updated_at

Tabela: uso_recursos (Controle de Limites)

id: int8 (PK)

agencia_id: int8 (FK → agencias — RLS)

mes_referencia: DATE (YYYY-MM-01)

posts_gerados: Integer DEFAULT 0

tokens_consumidos: Integer DEFAULT 0

Demais: clientes_ativos, colaboradores_ativos, created_at, updated_at

Tabela: auditoria (Logs Administrativos)

id: int8 (PK)

user_id: int8 (FK → perfis)

agencia_id: int8 (FK → agencias)

acao: String

entidade_tipo: String

entidade_id: int8

Demais: detalhes JSONB, ip_address, user_agent, created_at

6. SEGURANÇA E COMPLIANCE
Requisitos de Segurança:

Criptografia: Chaves API dos clientes (BYOK) criptografadas via pgcrypto/Supabase Vault — nunca expostas no frontend

RLS: Habilitado em todas as tabelas com agencia_id — isolamento estrito entre tenants

Auditoria: Todas as ações de admin e master logadas na tabela auditoria

Rate Limiting: 100 requests/minuto por agência via Upstash (pré-lançamento)

Validação de Entrada: Sanitização e validação com Zod em todos os inputs

Gating de Acesso: Chat/gerador de IA só liberado com assinatura ativa + chave BYOK válida (ou plataforma no plano correto)

Compliance:

LGPD (Lei Geral de Proteção de Dados)

PCI DSS via Stripe

SOC 2 Type II via Supabase e Netlify

- Alteração Mnaual