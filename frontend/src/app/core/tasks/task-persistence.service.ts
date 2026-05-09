import { Injectable, inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { ClassificationResult } from '../classification/task-classifier.service';
import { ProviderRecommendationPreview } from '../recommendation/provider-recommendation.service';
import { TaskCategory, WorkMode } from '../models';

export interface SaveTaskInput {
  title: string;
  rawPrompt: string;
  preparedPrompt: string;
  workMode: WorkMode;
  category: TaskCategory;
  classification: ClassificationResult;
  recommendation: ProviderRecommendationPreview;
}

export interface SaveTaskResult {
  ok: boolean;
  message: string;
  taskId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TaskPersistenceService {
  private readonly auth = inject(AuthService);

  async saveTask(input: SaveTaskInput): Promise<SaveTaskResult> {
    const client = this.auth.supabaseClient;
    const userId = this.auth.user()?.id;

    if (!client || !userId) {
      return {
        ok: false,
        message: 'Sign in and configure Supabase before saving.'
      };
    }

    const taskInsert = {
      user_profile_id: userId,
      title: input.title.trim() || null,
      raw_prompt: input.rawPrompt.trim(),
      prepared_prompt: input.preparedPrompt,
      work_mode: input.workMode,
      category: input.category,
      status: 'PREPARED',
      detected_category: input.classification.category,
      selected_category: input.category,
      confidence: input.classification.confidence,
      matched_signals: input.classification.matchedSignals
    };

    const { data: task, error: taskError } = await client
      .from('tasks')
      .insert(taskInsert)
      .select('id')
      .single();

    if (taskError || !task) {
      return {
        ok: false,
        message: taskError?.message ?? 'Task was not saved.'
      };
    }

    const taskId = task.id as string;

    const { error: recommendationError } = await client
      .from('provider_recommendations')
      .insert({
        task_id: taskId,
        primary_provider_id: input.recommendation.primaryProviderId,
        alternative_provider_ids: input.recommendation.alternativeProviderIds,
        confidence: input.recommendation.confidence,
        reason: input.recommendation.reason
      });

    if (recommendationError) {
      return {
        ok: false,
        taskId,
        message: `Task saved, but recommendation failed: ${recommendationError.message}`
      };
    }

    const { error: historyError } = await client
      .from('task_history')
      .insert([
        {
          task_id: taskId,
          event_type: 'CREATED',
          details: {
            source: 'new_task_workspace'
          }
        },
        {
          task_id: taskId,
          event_type: 'CLASSIFIED',
          details: {
            detectedCategory: input.classification.category,
            selectedCategory: input.category,
            confidence: input.classification.confidence,
            matchedSignals: input.classification.matchedSignals
          }
        }
      ]);

    if (historyError) {
      return {
        ok: false,
        taskId,
        message: `Task saved, but history failed: ${historyError.message}`
      };
    }

    return {
      ok: true,
      taskId,
      message: 'Task saved.'
    };
  }
}

