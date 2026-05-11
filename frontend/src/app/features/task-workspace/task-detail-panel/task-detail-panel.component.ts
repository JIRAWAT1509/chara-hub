import { Component, input, output } from '@angular/core';

import { TaskDetail } from '../../../core/tasks/task-persistence.service';
import {
  ProviderId,
  TaskCategory,
  TaskStatus,
  WorkMode,
} from '../../../core/models';

const PROVIDER_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  microsoft_copilot: 'Microsoft Copilot / Teams AI',
  codex: 'Codex',
  claude_code: 'Claude Code',
};

const TASK_HISTORY_EVENT_LABELS: Record<string, string> = {
  CREATED: 'Created',
  CLASSIFIED: 'Classified',
  TEMPLATE_APPLIED: 'Template applied',
  COPIED_PROMPT: 'Copied prompt',
  OPENED_PROVIDER: 'Opened provider',
  ARCHIVED: 'Archived',
};

@Component({
  selector: 'app-task-detail-panel',
  templateUrl: './task-detail-panel.component.html',
})
export class TaskDetailPanelComponent {
  readonly selectedTaskDetail = input<TaskDetail | null>(null);
  readonly taskDetailLoading = input.required<boolean>();
  readonly taskDetailMessage = input.required<string>();
  readonly taskCategoryLabels = input.required<Record<TaskCategory, string>>();
  readonly workModeLabels = input.required<Record<WorkMode, string>>();
  readonly taskStatusLabels = input.required<Record<TaskStatus, string>>();

  readonly taskDetailClosed = output<void>();

  providerName(providerId: ProviderId | null): string {
    if (!providerId) {
      return 'No provider';
    }

    return PROVIDER_NAMES[providerId] ?? providerId;
  }

  historyEventLabel(eventType: string): string {
    return TASK_HISTORY_EVENT_LABELS[eventType] ?? eventType;
  }

  formatDateTime(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }
}
