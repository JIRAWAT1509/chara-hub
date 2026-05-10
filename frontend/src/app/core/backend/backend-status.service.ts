import { Injectable, signal } from '@angular/core';

import { getBackendApiUrl } from '../config/app-config';

export interface BackendStatus {
  service: string;
  mode: string;
  ownsUserDataFlow: boolean;
  currentResponsibilities: string[];
  activationCriteria: string[];
  boundaries: string[];
}

export interface BackendStatusState {
  configured: boolean;
  loading: boolean;
  status: BackendStatus | null;
  message: string;
  isError: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BackendStatusService {
  private readonly backendApiUrl = getBackendApiUrl();

  readonly state = signal<BackendStatusState>({
    configured: Boolean(this.backendApiUrl),
    loading: false,
    status: null,
    message: this.backendApiUrl ? 'Backend not checked yet.' : 'Backend URL not configured.',
    isError: false,
  });

  async loadStatus(): Promise<void> {
    if (!this.backendApiUrl) {
      this.state.set({
        configured: false,
        loading: false,
        status: null,
        message: 'Backend URL not configured.',
        isError: false,
      });
      return;
    }

    this.state.update((state) => ({
      ...state,
      loading: true,
      message: 'Checking backend...',
      isError: false,
    }));

    try {
      const response = await fetch(`${this.backendApiUrl}/api/status`);

      if (!response.ok) {
        throw new Error(`Backend status failed with HTTP ${response.status}.`);
      }

      const status = (await response.json()) as BackendStatus;

      this.state.set({
        configured: true,
        loading: false,
        status,
        message: `${status.service} is ${status.mode}.`,
        isError: false,
      });
    } catch (error) {
      this.state.set({
        configured: true,
        loading: false,
        status: null,
        message: error instanceof Error ? error.message : 'Backend status could not be loaded.',
        isError: true,
      });
    }
  }
}
