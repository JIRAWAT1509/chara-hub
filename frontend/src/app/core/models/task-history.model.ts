import { ProviderId } from './provider.model';

export const TASK_HISTORY_EVENT_TYPES = [
  'CREATED',
  'CLASSIFIED',
  'TEMPLATE_APPLIED',
  'COPIED_PROMPT',
  'OPENED_PROVIDER',
  'ARCHIVED'
] as const;

export type TaskHistoryEventType = (typeof TASK_HISTORY_EVENT_TYPES)[number];

export interface TaskHistory {
  id: string;
  task_id: string;
  event_type: TaskHistoryEventType;
  provider_id: ProviderId | null;
  details: Record<string, unknown>;
  created_at: string;
}

