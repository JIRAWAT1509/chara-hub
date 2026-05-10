import { Component, input, output } from '@angular/core';

import { PromptTemplate, WorkMode } from '../../../core/models';

@Component({
  selector: 'app-prompt-template-panel',
  templateUrl: './prompt-template-panel.component.html',
})
export class PromptTemplatePanelComponent {
  readonly promptTemplatesLoading = input.required<boolean>();
  readonly promptTemplateCount = input.required<number>();
  readonly availablePromptTemplates = input.required<readonly PromptTemplate[]>();
  readonly selectedTemplate = input<PromptTemplate | null>(null);
  readonly selectedTemplateId = input.required<string>();
  readonly appliedTemplate = input<PromptTemplate | null>(null);
  readonly templateMessage = input.required<string>();
  readonly templateMessageIsError = input.required<boolean>();
  readonly workModeLabels = input.required<Record<WorkMode, string>>();
  readonly templateApplyDisabled = input.required<boolean>();

  readonly templatesRefreshed = output<void>();
  readonly templateSelected = output<string>();
  readonly templateApplied = output<void>();
  readonly templateCleared = output<void>();
}
