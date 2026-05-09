import { Injectable, inject } from '@angular/core';

import { AuthService } from '../auth/auth.service';
import { ClassificationResult } from '../classification/task-classifier.service';
import { ProviderRecommendationPreview } from '../recommendation/provider-recommendation.service';
import { ProviderId, Task, TaskCategory, TaskHistoryEventType, WorkMode } from '../models';

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

export interface RecordTaskHistoryEventInput {
  taskId: string;
  eventType: Extract<TaskHistoryEventType, 'COPIED_PROMPT' | 'OPENED_PROVIDER'>;
  providerId: ProviderId;
  details?: Record<string, unknown>;
  markTaskSent?: boolean;
}

export interface RecentTask {
  id: string;
  title: string | null;
  raw_prompt: string;
  category: TaskCategory;
  work_mode: WorkMode;
  status: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root',
})
export class TaskPersistenceService {
  private readonly auth = inject(AuthService);

  async saveTask(input: SaveTaskInput): Promise<SaveTaskResult> {
    const client = this.auth.supabaseClient;
    const userId = this.auth.user()?.id;

    if (!client || !userId) {
      return {
        ok: false,
        message: 'Sign in and configure Supabase before saving.',
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
      matched_signals: input.classification.matchedSignals,
    };

    const { data: task, error: taskError } = await client
      .from('tasks')
      .insert(taskInsert)
      .select('id')
      .single();

    if (taskError || !task) {
      return {
        ok: false,
        message: taskError?.message ?? 'Task was not saved.',
      };
    }

    const taskId = task.id as string;

    const { error: recommendationError } = await client.from('provider_recommendations').insert({
      task_id: taskId,
      primary_provider_id: input.recommendation.primaryProviderId,
      alternative_provider_ids: input.recommendation.alternativeProviderIds,
      confidence: input.recommendation.confidence,
      reason: input.recommendation.reason,
    });

    if (recommendationError) {
      return {
        ok: false,
        taskId,
        message: `Task saved, but recommendation failed: ${recommendationError.message}`,
      };
    }

    const { error: historyError } = await client.from('task_history').insert([
      {
        task_id: taskId,
        event_type: 'CREATED',
        details: {
          source: 'new_task_workspace',
        },
      },
      {
        task_id: taskId,
        event_type: 'CLASSIFIED',
        details: {
          detectedCategory: input.classification.category,
          selectedCategory: input.category,
          confidence: input.classification.confidence,
          matchedSignals: input.classification.matchedSignals,
        },
      },
    ]);

    if (historyError) {
      return {
        ok: false,
        taskId,
        message: `Task saved, but history failed: ${historyError.message}`,
      };
    }

    return {
      ok: true,
      taskId,
      message: 'Task saved.',
    };
  }

  async loadRecentTasks(limit = 5): Promise<RecentTask[]> {
    const client = this.auth.supabaseClient;
    const userId = this.auth.user()?.id;

    if (!client || !userId) {
      return [];
    }

    const { data, error } = await client
      .from('tasks')
      .select('id,title,raw_prompt,category,work_mode,status,created_at')
      .eq('user_profile_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data as Pick<
      Task,
      'id' | 'title' | 'raw_prompt' | 'category' | 'work_mode' | 'status' | 'created_at'
    >[];
  }

  async recordTaskHistoryEvent(input: RecordTaskHistoryEventInput): Promise<SaveTaskResult> {
    const client = this.auth.supabaseClient;
    const userId = this.auth.user()?.id;

    if (!client || !userId) {
      return {
        ok: false,
        message: 'Sign in and configure Supabase before recording handoff history.',
      };
    }

    const { error: historyError } = await client.from('task_history').insert({
      task_id: input.taskId,
      event_type: input.eventType,
      provider_id: input.providerId,
      details: input.details ?? {},
    });

    if (historyError) {
      return {
        ok: false,
        taskId: input.taskId,
        message: historyError.message,
      };
    }

    if (input.markTaskSent) {
      const { error: statusError } = await client
        .from('tasks')
        .update({ status: 'SENT' })
        .eq('id', input.taskId)
        .eq('user_profile_id', userId);

      if (statusError) {
        return {
          ok: false,
          taskId: input.taskId,
          message: `History recorded, but task status failed: ${statusError.message}`,
        };
      }
    }

    return {
      ok: true,
      taskId: input.taskId,
      message: 'Handoff history recorded.',
    };
  }
}
