import { Component, inject } from '@angular/core';

import { BackendStatusService } from '../../core/backend/backend-status.service';

@Component({
  selector: 'app-build-context-panel',
  templateUrl: './build-context-panel.component.html',
})
export class BuildContextPanelComponent {
  protected readonly backendStatus = inject(BackendStatusService);

  constructor() {
    void this.backendStatus.loadStatus();
  }
}
