export const TASK_STATUSES = ['DRAFT', 'PREPARED', 'SENT', 'ARCHIVED'] as const;

export type TaskStatus = (typeof TASK_STATUSES)[number];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  DRAFT: 'Draft',
  PREPARED: 'Prepared',
  SENT: 'Sent',
  ARCHIVED: 'Archived'
};

