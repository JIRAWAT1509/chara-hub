export const TASK_CATEGORIES = [
  'GENERAL',
  'REASONING',
  'CODING_LOGICAL',
  'DOCUMENT_EMAIL',
  'COMPANY_GROUNDED'
] as const;

export type TaskCategory = (typeof TASK_CATEGORIES)[number];

export const TASK_CATEGORY_LABELS: Record<TaskCategory, string> = {
  GENERAL: 'General',
  REASONING: 'Reasoning',
  CODING_LOGICAL: 'Coding / Logical',
  DOCUMENT_EMAIL: 'Document / Email',
  COMPANY_GROUNDED: 'Company-grounded'
};

export const TASK_CATEGORY_DESCRIPTIONS: Record<TaskCategory, string> = {
  GENERAL: 'Everyday questions and casual usage',
  REASONING: 'Planning, comparison, analysis, and decisions',
  CODING_LOGICAL: 'Coding, debugging, architecture, and technical logic',
  DOCUMENT_EMAIL: 'Writing, rewriting, summarizing, and formal messages',
  COMPANY_GROUNDED: 'Microsoft 365, Teams, and internal company context'
};

