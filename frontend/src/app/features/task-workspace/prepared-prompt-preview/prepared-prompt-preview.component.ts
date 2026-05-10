import { Component, input } from '@angular/core';

@Component({
  selector: 'app-prepared-prompt-preview',
  templateUrl: './prepared-prompt-preview.component.html',
})
export class PreparedPromptPreviewComponent {
  readonly preparedPrompt = input.required<string>();
}
