import { Component, input, output } from '@angular/core';

import { RecentTask } from '../../core/tasks/task-persistence.service';
import {
  TASK_CATEGORY_LABELS,
  TASK_STATUS_LABELS,
  WORK_MODE_LABELS,
  WorkMode,
} from '../../core/models';

export type DashboardShortcut = 'new-task' | 'templates' | 'history' | 'settings';

@Component({
  selector: 'app-dashboard-summary',
  templateUrl: './dashboard-summary.component.html',
})
export class DashboardSummaryComponent {
  readonly defaultWorkMode = input.required<WorkMode>();
  readonly activeWorkflowStatus = input.required<string>();
  readonly recentTaskCount = input.required<number>();
  readonly visibleTaskCount = input.required<number>();
  readonly sentTaskCount = input.required<number>();
  readonly preparedTaskCount = input.required<number>();
  readonly availableTemplateCount = input.required<number>();
  readonly templateCount = input.required<number>();
  readonly latestTask = input<RecentTask | null>(null);
  readonly shortcutSelected = output<DashboardShortcut>();

  protected readonly workModeLabels = WORK_MODE_LABELS;
  protected readonly taskCategoryLabels = TASK_CATEGORY_LABELS;
  protected readonly taskStatusLabels = TASK_STATUS_LABELS;
}
