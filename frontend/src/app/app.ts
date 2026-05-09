import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { AuthMode, AuthService } from './core/auth/auth.service';

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly auth = inject(AuthService);
  protected readonly mode = signal<AuthMode>('sign-in');
  protected readonly message = signal('');
  protected readonly messageIsError = signal(false);

  protected readonly authForm = this.formBuilder.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected readonly submitLabel = computed(() =>
    this.mode() === 'sign-in' ? 'Sign in' : 'Create account'
  );

  protected readonly modeToggleLabel = computed(() =>
    this.mode() === 'sign-in' ? 'Create account' : 'Use existing account'
  );

  protected setMode(mode: AuthMode): void {
    this.mode.set(mode);
    this.message.set('');
    this.messageIsError.set(false);
  }

  protected async submit(): Promise<void> {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      this.message.set('Check the form fields.');
      this.messageIsError.set(true);
      return;
    }

    const value = this.authForm.getRawValue();
    const result = this.mode() === 'sign-in'
      ? await this.auth.signIn(value.email, value.password)
      : await this.auth.signUp(value.email, value.password, value.displayName);

    this.message.set(result.message);
    this.messageIsError.set(!result.ok);
  }

  protected async signOut(): Promise<void> {
    await this.auth.signOut();
    this.message.set('');
    this.messageIsError.set(false);
  }
}

