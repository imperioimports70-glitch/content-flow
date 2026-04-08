/**
 * Tipos do schema ContentFlow (Supabase). Alinhar com migrations em supabase/migrations/.
 * Regenerar via MCP `generate_typescript_types` quando o schema remoto divergir.
 */

export type StatusAssinatura = "trial" | "active" | "past_due" | "canceled";
export type TomDeVoz = "profissional" | "descontraido" | "inspiracional" | "educativo";
export type RolePerfil = "master" | "admin" | "colaborador";
export type RedeSocial = "instagram" | "linkedin" | "tiktok" | "twitter";
export type StatusPost = "rascunho" | "agendado" | "publicado" | "cancelado";
export type StatusComentario = "pendente" | "aprovado" | "enviado";

export interface Database {
  public: {
    Tables: {
      planos: {
        Row: {
          id: number;
          nome: string;
          preco_mensal: string;
          max_clientes: number;
          max_posts_mes: number;
          byok_habilitado: boolean;
          marca_propria: boolean;
          stripe_price_id: string;
          features: Record<string, unknown>;
          is_active: boolean;
          cor: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          nome: string;
          preco_mensal: string;
          max_clientes: number;
          max_posts_mes: number;
          byok_habilitado?: boolean;
          marca_propria?: boolean;
          stripe_price_id: string;
          features?: Record<string, unknown>;
          is_active?: boolean;
          cor?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["planos"]["Insert"]>;
      };
      agencias: {
        Row: {
          id: number;
          nome: string;
          plano_id: number;
          stripe_customer_id: string | null;
          stripe_subscription_id: string | null;
          status_assinatura: StatusAssinatura;
          email: string | null;
          telefone: string | null;
          site: string | null;
          data_adesao: string | null;
          trial_ends_at: string | null;
          proxima_cobranca: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          nome: string;
          plano_id: number;
          stripe_customer_id?: string | null;
          stripe_subscription_id?: string | null;
          status_assinatura?: StatusAssinatura;
          email?: string | null;
          telefone?: string | null;
          site?: string | null;
          data_adesao?: string | null;
          trial_ends_at?: string | null;
          proxima_cobranca?: string | null;
          is_active?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["agencias"]["Insert"]>;
      };
      clientes_workspace: {
        Row: {
          id: number;
          agencia_id: number;
          nome: string;
          segmento: string | null;
          sobre_marca: string | null;
          tom_de_voz: TomDeVoz | null;
          palavras_proibidas: string | null;
          instrucoes_ia: string | null;
          chave_api_llm: string | null;
          usar_chave_plataforma: boolean;
          is_active: boolean;
          logo_url: string | null;
          cor_primaria: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          agencia_id: number;
          nome: string;
          segmento?: string | null;
          sobre_marca?: string | null;
          tom_de_voz?: TomDeVoz | null;
          palavras_proibidas?: string | null;
          instrucoes_ia?: string | null;
          chave_api_llm?: string | null;
          usar_chave_plataforma?: boolean;
          is_active?: boolean;
          logo_url?: string | null;
          cor_primaria?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["clientes_workspace"]["Insert"]>;
      };
      perfis: {
        Row: {
          id: string;
          agencia_id: number | null;
          role: RolePerfil;
          email: string | null;
          nome_completo: string | null;
          cargo: string | null;
          status: string;
          ultimo_acesso: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          agencia_id?: number | null;
          role?: RolePerfil;
          email?: string | null;
          nome_completo?: string | null;
          cargo?: string | null;
          status?: string;
          ultimo_acesso?: string | null;
          avatar_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["perfis"]["Insert"]>;
      };
      posts: {
        Row: {
          id: number;
          agencia_id: number;
          cliente_id: number;
          criado_por: string | null;
          rede_social: RedeSocial;
          legenda: string;
          hashtags: unknown;
          tom_usado: string | null;
          status: StatusPost;
          agendado_para: string | null;
          publicado_em: string | null;
          tokens_usados: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          agencia_id: number;
          cliente_id: number;
          criado_por?: string | null;
          rede_social: RedeSocial;
          legenda: string;
          hashtags?: unknown;
          tom_usado?: string | null;
          status?: StatusPost;
          agendado_para?: string | null;
          publicado_em?: string | null;
          tokens_usados?: number;
        };
        Update: Partial<Database["public"]["Tables"]["posts"]["Insert"]>;
      };
      comentarios: {
        Row: {
          id: number;
          agencia_id: number;
          cliente_id: number;
          comentario_original: string | null;
          resposta_gerada: string | null;
          rede_social: string | null;
          status: StatusComentario;
          tokens_usados: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          agencia_id: number;
          cliente_id: number;
          comentario_original?: string | null;
          resposta_gerada?: string | null;
          rede_social?: string | null;
          status?: StatusComentario;
          tokens_usados?: number;
        };
        Update: Partial<Database["public"]["Tables"]["comentarios"]["Insert"]>;
      };
      uso_recursos: {
        Row: {
          id: number;
          agencia_id: number;
          mes_referencia: string;
          posts_gerados: number;
          tokens_consumidos: number;
          clientes_ativos: number;
          colaboradores_ativos: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: never;
          agencia_id: number;
          mes_referencia: string;
          posts_gerados?: number;
          tokens_consumidos?: number;
          clientes_ativos?: number;
          colaboradores_ativos?: number;
        };
        Update: Partial<Database["public"]["Tables"]["uso_recursos"]["Insert"]>;
      };
      auditoria: {
        Row: {
          id: number;
          user_id: string | null;
          agencia_id: number | null;
          acao: string;
          entidade_tipo: string | null;
          entidade_id: number | null;
          detalhes: Record<string, unknown> | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: never;
          user_id?: string | null;
          agencia_id?: number | null;
          acao: string;
          entidade_tipo?: string | null;
          entidade_id?: number | null;
          detalhes?: Record<string, unknown> | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["auditoria"]["Insert"]>;
      };
      stripe_events: {
        Row: {
          id: string;
          stripe_event_id: string;
          type: string;
          payload: Record<string, unknown>;
          processed_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          stripe_event_id: string;
          type: string;
          payload: Record<string, unknown>;
          processed_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["stripe_events"]["Insert"]>;
      };
      usage_throttle: {
        Row: {
          agencia_id: number;
          window_start: string;
          request_count: number;
        };
        Insert: {
          agencia_id: number;
          window_start: string;
          request_count?: number;
        };
        Update: Partial<Database["public"]["Tables"]["usage_throttle"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_auth_agencia_id: { Args: Record<string, never>; Returns: number | null };
      is_master_user: { Args: Record<string, never>; Returns: boolean };
      check_and_increment_rate_limit: {
        Args: { p_agencia_id: number; p_max_per_minute?: number };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
  };
}
