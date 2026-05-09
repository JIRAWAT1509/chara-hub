import { Injectable } from '@angular/core';

import { TaskCategory, WorkMode } from '../models';

export interface ClassificationInput {
  rawPrompt: string;
  workMode: WorkMode;
}

export interface ClassificationResult {
  category: TaskCategory;
  confidence: number;
  matchedSignals: string[];
  reason: string;
}

interface CategoryScore {
  category: TaskCategory;
  score: number;
  matchedSignals: string[];
}

@Injectable({
  providedIn: 'root'
})
export class TaskClassifierService {
  classify(input: ClassificationInput): ClassificationResult {
    const normalizedPrompt = input.rawPrompt.trim().toLowerCase();

    if (!normalizedPrompt) {
      return {
        category: 'GENERAL',
        confidence: 0.2,
        matchedSignals: [],
        reason: 'No task text yet.'
      };
    }

    const scores: CategoryScore[] = [
      this.scoreCategory('GENERAL', normalizedPrompt, [
        'what is',
        'how do i',
        'explain',
        'help me understand',
        'idea',
        'recommend',
        'suggest',
        'คืออะไร',
        'ช่วยอธิบาย',
        'แนะนำ',
        'ถามหน่อย'
      ]),
      this.scoreCategory('REASONING', normalizedPrompt, [
        'analyze',
        'compare',
        'pros and cons',
        'tradeoff',
        'plan',
        'strategy',
        'roadmap',
        'prioritize',
        'which should',
        'best option',
        'decide',
        'evaluate',
        'วิเคราะห์',
        'เปรียบเทียบ',
        'ข้อดีข้อเสีย',
        'ควรเลือก'
      ]),
      this.scoreCategory('CODING_LOGICAL', normalizedPrompt, [
        'code',
        'bug',
        'fix',
        'debug',
        'refactor',
        'implement',
        'angular',
        '.net',
        'spring boot',
        'react',
        'vue',
        'flutter',
        'repo',
        'branch',
        'commit',
        'stack trace',
        'exception',
        'compile error',
        'runtime error',
        'แก้บั๊ก',
        'โค้ด',
        'error',
        'พัง',
        'ไล่ logic'
      ]),
      this.scoreCategory('DOCUMENT_EMAIL', normalizedPrompt, [
        'rewrite',
        'draft',
        'summarize',
        'polish',
        'tone',
        'email',
        'message',
        'reply',
        'formal',
        'professional',
        'document',
        'report',
        'minutes',
        'proposal',
        'เขียนเมล',
        'สรุป',
        'ปรับภาษา',
        'ทางการ',
        'สุภาพ'
      ]),
      this.scoreCategory('COMPANY_GROUNDED', normalizedPrompt, [
        'teams',
        'outlook',
        'sharepoint',
        'onedrive',
        'powerpoint',
        'excel',
        'meeting',
        'action items',
        'internal',
        'policy',
        'client',
        'company data',
        'my calendar',
        'work chat',
        'ประชุม',
        'งานบริษัท',
        'ลูกค้า',
        'ใน teams',
        'สรุป meeting'
      ])
    ];

    this.applyWorkModeBoost(scores, input.workMode);

    const sorted = scores.sort((a, b) => b.score - a.score);
    const winner = this.resolveTie(sorted);
    const runnerUp = sorted.find((score) => score.category !== winner.category);
    const gap = winner.score - (runnerUp?.score ?? 0);
    const confidence = this.calculateConfidence(winner.score, gap, input.rawPrompt);

    return {
      category: winner.category,
      confidence,
      matchedSignals: winner.matchedSignals,
      reason: this.buildReason(winner, confidence)
    };
  }

  private scoreCategory(category: TaskCategory, prompt: string, keywords: string[]): CategoryScore {
    const matchedSignals = keywords.filter((keyword) => prompt.includes(keyword));

    return {
      category,
      matchedSignals,
      score: matchedSignals.reduce((total, keyword) => total + this.keywordScore(keyword), 0)
    };
  }

  private keywordScore(keyword: string): number {
    if (keyword.includes(' ') || keyword.length >= 10) {
      return 3;
    }

    return 2;
  }

  private applyWorkModeBoost(scores: CategoryScore[], workMode: WorkMode): void {
    if (workMode === 'CHARA') {
      this.boost(scores, 'GENERAL', 1, 'work mode: Chara');
      return;
    }

    if (workMode === 'CHARA_WORK') {
      this.boost(scores, 'CODING_LOGICAL', 1, 'work mode: Chara-Work');
      this.boost(scores, 'REASONING', 1, 'work mode: Chara-Work');
      this.boost(scores, 'COMPANY_GROUNDED', 1, 'work mode: Chara-Work');
      return;
    }

    const strongest = [...scores].sort((a, b) => b.score - a.score)[0];
    strongest.score += 1;
    strongest.matchedSignals.push('work mode: Chara-Rushing');
  }

  private boost(scores: CategoryScore[], category: TaskCategory, amount: number, signal: string): void {
    const score = scores.find((item) => item.category === category);

    if (!score) {
      return;
    }

    score.score += amount;
    score.matchedSignals.push(signal);
  }

  private resolveTie(scores: CategoryScore[]): CategoryScore {
    const topScore = scores[0].score;
    const tied = scores.filter((score) => score.score === topScore);

    if (tied.length === 1) {
      return tied[0];
    }

    const priority: TaskCategory[] = [
      'COMPANY_GROUNDED',
      'CODING_LOGICAL',
      'DOCUMENT_EMAIL',
      'REASONING',
      'GENERAL'
    ];

    return priority.map((category) => tied.find((score) => score.category === category)).find(Boolean) ?? tied[0];
  }

  private calculateConfidence(score: number, gap: number, rawPrompt: string): number {
    if (score >= 5 && gap >= 3) {
      return 0.9;
    }

    if (score >= 4 && gap >= 2) {
      return 0.76;
    }

    if (score >= 3) {
      return 0.62;
    }

    if (score >= 1) {
      return rawPrompt.trim().length < 20 ? 0.38 : 0.48;
    }

    return 0.25;
  }

  private buildReason(winner: CategoryScore, confidence: number): string {
    if (!winner.matchedSignals.length) {
      return 'No strong signals were found, so this defaults to general routing.';
    }

    const confidenceLabel = confidence >= 0.8 ? 'strong' : confidence >= 0.6 ? 'good' : 'low';

    return `Detected ${confidenceLabel} ${winner.category} signals: ${winner.matchedSignals.slice(0, 4).join(', ')}.`;
  }
}

