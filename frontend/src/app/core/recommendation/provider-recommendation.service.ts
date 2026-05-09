import { Injectable } from '@angular/core';

import { ProviderId, TaskCategory, WorkMode } from '../models';

export interface ProviderRecommendationPreview {
  primaryProviderId: ProviderId;
  primaryProviderName: string;
  alternativeProviderIds: ProviderId[];
  alternativeProviderNames: string[];
  confidence: number;
  reason: string;
}

interface ProviderOption {
  id: ProviderId;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProviderRecommendationService {
  private readonly providers: Record<string, ProviderOption> = {
    chatgpt: { id: 'chatgpt', name: 'ChatGPT' },
    claude: { id: 'claude', name: 'Claude' },
    microsoft_copilot: { id: 'microsoft_copilot', name: 'Microsoft Copilot / Teams AI' },
    codex: { id: 'codex', name: 'Codex' },
    claude_code: { id: 'claude_code', name: 'Claude Code' }
  };

  recommend(category: TaskCategory, workMode: WorkMode): ProviderRecommendationPreview {
    const providerIds = this.providerOrder(category, workMode);
    const [primaryProviderId, ...alternativeProviderIds] = providerIds;
    const primary = this.providers[primaryProviderId];

    return {
      primaryProviderId,
      primaryProviderName: primary.name,
      alternativeProviderIds,
      alternativeProviderNames: alternativeProviderIds.map((id) => this.providers[id].name),
      confidence: this.confidence(category, workMode),
      reason: this.reason(category, workMode, primary.name)
    };
  }

  private providerOrder(category: TaskCategory, workMode: WorkMode): ProviderId[] {
    if (category === 'CODING_LOGICAL') {
      return workMode === 'CHARA' ? ['chatgpt', 'codex', 'claude_code'] : ['codex', 'claude_code', 'chatgpt'];
    }

    if (category === 'DOCUMENT_EMAIL') {
      return ['claude', 'chatgpt', 'microsoft_copilot'];
    }

    if (category === 'COMPANY_GROUNDED') {
      return ['microsoft_copilot', 'chatgpt', 'claude'];
    }

    if (category === 'REASONING') {
      return workMode === 'CHARA_WORK' ? ['chatgpt', 'claude'] : ['chatgpt', 'claude'];
    }

    return ['chatgpt', 'claude'];
  }

  private confidence(category: TaskCategory, workMode: WorkMode): number {
    if (category === 'CODING_LOGICAL' && workMode !== 'CHARA') {
      return 0.9;
    }

    if (category === 'COMPANY_GROUNDED' || category === 'DOCUMENT_EMAIL') {
      return 0.84;
    }

    return 0.76;
  }

  private reason(category: TaskCategory, workMode: WorkMode, providerName: string): string {
    const workModeReason = workMode === 'CHARA_RUSHING'
      ? 'The urgent mode favors direct handoff.'
      : 'The selected work mode keeps the prompt style aligned.';

    const categoryReasons: Record<TaskCategory, string> = {
      GENERAL: 'General tasks fit a flexible general-purpose assistant.',
      REASONING: 'Reasoning tasks benefit from planning and comparison support.',
      CODING_LOGICAL: 'Coding tasks benefit from project-aware implementation support.',
      DOCUMENT_EMAIL: 'Writing tasks benefit from strong tone and revision quality.',
      COMPANY_GROUNDED: 'Company-grounded tasks need Microsoft 365 or internal context.'
    };

    return `${providerName} is recommended. ${categoryReasons[category]} ${workModeReason}`;
  }
}

