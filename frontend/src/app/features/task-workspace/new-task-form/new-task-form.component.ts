import { Component, input } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import {
  TaskCategory,
  WorkMode,
} from '../../../core/models';

@Component({
  selector: 'app-new-task-form',
  imports: [ReactiveFormsModule],
  templateUrl: './new-task-form.component.html',
})
export class NewTaskFormComponent {
  readonly taskForm = input.required<FormGroup>();
  readonly promptCharacterCount = input.required<number>();
  readonly workModes = input.required<readonly WorkMode[]>();
  readonly workModeLabels = input.required<Record<WorkMode, string>>();
  readonly taskCategories = input.required<readonly TaskCategory[]>();
  readonly taskCategoryLabels = input.required<Record<TaskCategory, string>>();
}
