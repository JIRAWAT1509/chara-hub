import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the auth shell', async () => {
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('AI work starts here.');
    expect(compiled.querySelector('button[type="submit"]')?.textContent).toContain('Sign in');
  });

  it('should enable task actions when the task form becomes valid', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance as unknown as {
      auth: { configReady: { set: (value: boolean) => void } };
      taskForm: {
        controls: {
          rawPrompt: { setValue: (value: string) => void };
        };
      };
      taskReadyToSave: () => boolean;
      handoffReady: () => boolean;
    };

    fixture.detectChanges();

    expect(app.taskReadyToSave()).toBe(false);
    expect(app.handoffReady()).toBe(false);

    app.auth.configReady.set(true);
    app.taskForm.controls.rawPrompt.setValue(
      'Fix an Angular form validation issue with the smallest safe patch.',
    );

    expect(app.taskReadyToSave()).toBe(true);
    expect(app.handoffReady()).toBe(true);
  });
});
