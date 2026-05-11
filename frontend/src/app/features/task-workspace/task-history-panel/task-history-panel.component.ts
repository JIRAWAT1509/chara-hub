import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import { RecentTask } from '../../../core/tasks/task-persistence.service';
import {
  TaskCategory,
  TaskStatus,
  WorkMode,
} from '../../../core/models';

@Component({
  selector: 'app-task-history-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './task-history-panel.component.html',
})
export class TaskHistoryPanelComponent {
  readonly historyFilterForm = input.required<FormGroup>();
  readonly recentTasks = input.required<readonly RecentTask[]>();
  readonly filteredRecentTasks = input.required<readonly RecentTask[]>();
  readonly recentTasksLoading = input.required<boolean>();
  readonly selectedTaskId = input<string | null>(null);
  readonly taskCategories = input.required<readonly TaskCategory[]>();
  readonly taskCategoryLabels = input.required<Record<TaskCategory, string>>();
  readonly workModes = input.required<readonly WorkMode[]>();
  readonly workModeLabels = input.required<Record<WorkMode, string>>();
  readonly taskStatuses = input.required<readonly TaskStatus[]>();
  readonly taskStatusLabels = input.required<Record<TaskStatus, string>>();

  readonly recentTasksRefreshed = output<void>();
  readonly historyFiltersCleared = output<void>();
  readonly taskViewed = output<RecentTask>();
  readonly taskReused = output<RecentTask>();
}
