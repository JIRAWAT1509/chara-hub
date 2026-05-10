import { Component, input, output } from '@angular/core';

import { ClassificationResult } from '../../../core/classification/task-classifier.service';
import { ProviderRecommendationPreview } from '../../../core/recommendation/provider-recommendation.service';
import {
  ProviderPreference,
  TaskCategory,
  WorkMode,
} from '../../../core/models';

@Component({
  selector: 'app-task-routing-results',
  templateUrl: './task-routing-results.component.html',
})
export class TaskRoutingResultsComponent {
  readonly classification = input.required<ClassificationResult>();
  readonly recommendation = input.required<ProviderRecommendationPreview>();
  readonly activeRecommendationPreference = input<ProviderPreference | null>(null);
  readonly taskCategoryLabels = input.required<Record<TaskCategory, string>>();
  readonly workModeLabels = input.required<Record<WorkMode, string>>();
  readonly detectedCategorySelected = output<void>();
}
