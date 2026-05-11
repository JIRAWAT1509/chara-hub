import { Component, input, output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';

import {
  ProviderId,
  ProviderPreference,
  TaskCategory,
  WorkMode,
} from '../../../core/models';

export type WorkModeScope = WorkMode | 'ANY';

export interface ProviderPreferenceMove {
  providerId: ProviderId;
  direction: -1 | 1;
}

const PROVIDER_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  microsoft_copilot: 'Microsoft Copilot / Teams AI',
  codex: 'Codex',
  claude_code: 'Claude Code',
};

@Component({
  selector: 'app-workflow-settings-panel',
  imports: [ReactiveFormsModule],
  templateUrl: './workflow-settings-panel.component.html',
})
export class WorkflowSettingsPanelComponent {
  readonly settingsForm = input.required<FormGroup>();
  readonly providerPreferenceForm = input.required<FormGroup>();
  readonly workModes = input.required<readonly WorkMode[]>();
  readonly workModeLabels = input.required<Record<WorkMode, string>>();
  readonly taskCategories = input.required<readonly TaskCategory[]>();
  readonly taskCategoryLabels = input.required<Record<TaskCategory, string>>();
  readonly workModeScopes = input.required<readonly WorkModeScope[]>();
  readonly currentDefaultWorkMode = input<WorkMode | null>(null);
  readonly authLoading = input.required<boolean>();
  readonly settingsSaving = input.required<boolean>();
  readonly settingsMessage = input.required<string>();
  readonly settingsMessageIsError = input.required<boolean>();
  readonly providerPreferencesLoading = input.required<boolean>();
  readonly providerPreferenceSaving = input.required<boolean>();
  readonly providerPreferenceOrder = input.required<readonly ProviderId[]>();
  readonly selectedProviderPreference = input<ProviderPreference | null>(null);
  readonly providerPreferenceHasChanges = input.required<boolean>();
  readonly providerPreferenceMessage = input.required<string>();
  readonly providerPreferenceMessageIsError = input.required<boolean>();

  readonly defaultWorkModeSaved = output<void>();
  readonly providerPreferencesRefreshed = output<void>();
  readonly providerPreferenceMoved = output<ProviderPreferenceMove>();
  readonly providerPreferenceOrderReset = output<void>();
  readonly providerPreferenceSaved = output<void>();

  providerName(providerId: ProviderId): string {
    return PROVIDER_NAMES[providerId] ?? providerId;
  }

  workModeScopeLabel(workModeScope: WorkModeScope): string {
    return workModeScope === 'ANY' ? 'Any mode' : this.workModeLabels()[workModeScope];
  }
}
