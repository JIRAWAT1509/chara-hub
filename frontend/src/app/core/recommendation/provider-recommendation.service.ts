import { Injectable } from '@angular/core';

import { ProviderId, TaskCategory, WorkMode } from '../models';

export interface ProviderRecommendationPreview {
  primaryProviderId: ProviderId;
  primaryProviderName: string;
  alternativeProviderIds: ProviderId[];
  alternativeProviderNames: string[];
  confidence: number;
  confidenceLabel: string;
  reason: string;
  categoryReason: string;
  workModeReason: string;
  primaryProviderStrengths: string[];
  primaryProviderWeakFit: string;
  alternativeSummaries: ProviderAlternativeSummary[];
  handoffKind: 'URL' | 'MANUAL';
}

interface ProviderOption {
  id: ProviderId;
  name: string;
  strengths: string[];
  weakFit: string;
  handoffKind: 'URL' | 'MANUAL';
}

export interface ProviderAlternativeSummary {
  providerId: ProviderId;
  providerName: string;
  summary: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProviderRecommendationService {
  private readonly providers: Record<string, ProviderOption> = {
    chatgpt: {
      id: 'chatgpt',
      name: 'ChatGPT',
      strengths: ['General help', 'Reasoning', 'Mixed tasks', 'Flexible conversation'],
      weakFit: 'Weak when the task requires private company context.',
      handoffKind: 'URL',
    },
    claude: {
      id: 'claude',
      name: 'Claude',
      strengths: ['Writing', 'Editing', 'Summarization', 'Long-context reasoning'],
      weakFit: 'Weak for repository execution or machine-local actions.',
      handoffKind: 'URL',
    },
    microsoft_copilot: {
      id: 'microsoft_copilot',
      name: 'Microsoft Copilot / Teams AI',
      strengths: ['Microsoft 365', 'Teams context', 'Company-grounded work'],
      weakFit: 'Weak for personal coding repo work outside Microsoft 365 context.',
      handoffKind: 'URL',
    },
    codex: {
      id: 'codex',
      name: 'Codex',
      strengths: ['Coding', 'Debugging', 'Codebase-aware work', 'Implementation planning'],
      weakFit: 'Weak for general writing or Microsoft 365-grounded work.',
      handoffKind: 'MANUAL',
    },
    claude_code: {
      id: 'claude_code',
      name: 'Claude Code',
      strengths: ['Coding', 'Debugging', 'Project-aware work'],
      weakFit: 'Weak for general non-coding tasks or Microsoft 365-grounded work.',
      handoffKind: 'MANUAL',
    },
  };

  recommend(category: TaskCategory, workMode: WorkMode): ProviderRecommendationPreview {
    const providerIds = this.providerOrder(category, workMode);
    const [primaryProviderId, ...alternativeProviderIds] = providerIds;
    const primary = this.providers[primaryProviderId];
    const confidence = this.confidence(category, workMode);
    const categoryReason = this.categoryReason(category);
    const workModeReason = this.workModeReason(workMode);

    return {
      primaryProviderId,
      primaryProviderName: primary.name,
      alternativeProviderIds,
      alternativeProviderNames: alternativeProviderIds.map((id) => this.providers[id].name),
      confidence,
      confidenceLabel: this.confidenceLabel(confidence),
      reason: this.reason(primary.name, categoryReason, workModeReason),
      categoryReason,
      workModeReason,
      primaryProviderStrengths: primary.strengths,
      primaryProviderWeakFit: primary.weakFit,
      alternativeSummaries: alternativeProviderIds.map((id) => ({
        providerId: id,
        providerName: this.providers[id].name,
        summary: this.alternativeSummary(id, category),
      })),
      handoffKind: primary.handoffKind,
    };
  }

  private providerOrder(category: TaskCategory, workMode: WorkMode): ProviderId[] {
    if (category === 'CODING_LOGICAL') {
      return workMode === 'CHARA'
        ? ['chatgpt', 'codex', 'claude_code']
        : ['codex', 'claude_code', 'chatgpt'];
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

  private confidenceLabel(confidence: number): string {
    if (confidence >= 0.85) {
      return 'Strong match';
    }

    if (confidence >= 0.7) {
      return 'Good match';
    }

    if (confidence >= 0.5) {
      return 'Mixed match';
    }

    return 'Low confidence';
  }

  private categoryReason(category: TaskCategory): string {
    const reasons: Record<TaskCategory, string> = {
      GENERAL: 'General tasks fit a flexible general-purpose assistant.',
      REASONING: 'Reasoning tasks benefit from planning and comparison support.',
      CODING_LOGICAL: 'Coding tasks benefit from project-aware implementation support.',
      DOCUMENT_EMAIL: 'Writing tasks benefit from strong tone and revision quality.',
      COMPANY_GROUNDED: 'Company-grounded tasks need Microsoft 365 or internal context.',
    };

    return reasons[category];
  }

  private workModeReason(workMode: WorkMode): string {
    if (workMode === 'CHARA_RUSHING') {
      return 'Rushing mode favors the shortest useful handoff with minimal back-and-forth.';
    }

    if (workMode === 'CHARA_WORK') {
      return 'Work mode favors structured output, reasoning, and implementation-safe prompts.';
    }

    return 'Casual mode favors a lighter general-purpose handoff.';
  }

  private reason(providerName: string, categoryReason: string, workModeReason: string): string {
    return `${providerName} is recommended. ${categoryReason} ${workModeReason}`;
  }

  private alternativeSummary(providerId: ProviderId, category: TaskCategory): string {
    if (providerId === 'chatgpt') {
      return category === 'CODING_LOGICAL'
        ? 'Useful for explaining code issues or getting a second opinion.'
        : 'Useful as a flexible general-purpose fallback.';
    }

    if (providerId === 'claude') {
      return 'Useful when tone, long context, or document quality matters.';
    }

    if (providerId === 'microsoft_copilot') {
      return 'Useful when the task needs Microsoft 365 or Teams context.';
    }

    if (providerId === 'codex') {
      return 'Useful when the task needs repository-aware implementation work.';
    }

    if (providerId === 'claude_code') {
      return 'Useful for project-aware coding and debugging in a local workflow.';
    }

    return 'Useful as an alternative handoff target.';
  }
}
