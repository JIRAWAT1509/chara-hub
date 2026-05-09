export const PROVIDER_TYPES = ['WEB', 'CODING_TOOL', 'COMPANY_GROUNDED', 'LOCAL'] as const;

export type ProviderType = (typeof PROVIDER_TYPES)[number];

export type ProviderId = 'chatgpt' | 'claude' | 'microsoft_copilot' | 'codex' | 'claude_code' | string;

export interface Provider {
  id: ProviderId;
  name: string;
  provider_type: ProviderType;
  handoff_url: string | null;
  is_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProviderRecommendation {
  id: string;
  task_id: string;
  primary_provider_id: ProviderId;
  alternative_provider_ids: ProviderId[];
  confidence: number;
  reason: string;
  created_at: string;
}

