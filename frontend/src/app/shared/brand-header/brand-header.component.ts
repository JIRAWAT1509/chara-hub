import { Component, input } from '@angular/core';

@Component({
  selector: 'app-brand-header',
  templateUrl: './brand-header.component.html',
})
export class BrandHeaderComponent {
  readonly configReady = input.required<boolean>();
}
