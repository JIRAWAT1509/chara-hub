import { Component, input, output } from '@angular/core';

import { ProviderId } from '../../../core/models';

export interface ProviderHandoffView {
  providerId: ProviderId;
  providerName: string;
  url: string | null;
  manualText: string;
}

@Component({
  selector: 'app-handoff-panel',
  templateUrl: './handoff-panel.component.html',
})
export class HandoffPanelComponent {
  readonly preparedPrompt = input.required<string>();
  readonly providerHandoff = input.required<ProviderHandoffView>();
  readonly handoffReady = input.required<boolean>();
  readonly hasActiveSavedTask = input.required<boolean>();
  readonly handoffMessage = input.required<string>();
  readonly handoffIsError = input.required<boolean>();

  readonly preparedPromptCopied = output<void>();
  readonly recommendedProviderOpened = output<void>();
}
