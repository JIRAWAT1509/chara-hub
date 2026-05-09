import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { AuthMode, AuthService } from './core/auth/auth.service';
import { TaskClassifierService } from './core/classification/task-classifier.service';
import { ProviderRecommendationService } from './core/recommendation/provider-recommendation.service';
import { RecentTask, TaskPersistenceService } from './core/tasks/task-persistence.service';
import {
  TASK_CATEGORIES,
  TASK_CATEGORY_LABELS,
  WORK_MODES,
  WORK_MODE_LABELS,
  TaskCategory,
  WorkMode
} from './core/models';

interface TaskDraftValue {
  title: string;
  rawPrompt: string;
  workMode: WorkMode;
  category: TaskCategory;
}

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private readonly formBuilder = inject(FormBuilder);
  private readonly classifier = inject(TaskClassifierService);
  private readonly recommender = inject(ProviderRecommendationService);
  private readonly taskPersistence = inject(TaskPersistenceService);
  protected readonly auth = inject(AuthService);
  protected readonly mode = signal<AuthMode>('sign-in');
  protected readonly message = signal('');
  protected readonly messageIsError = signal(false);
  protected readonly taskSaveMessage = signal('');
  protected readonly taskSaveIsError = signal(false);
  protected readonly taskSaving = signal(false);
  protected readonly recentTasks = signal<RecentTask[]>([]);
  protected readonly recentTasksLoading = signal(false);
  protected readonly workModes = WORK_MODES;
  protected readonly workModeLabels = WORK_MODE_LABELS;
  protected readonly taskCategories = TASK_CATEGORIES;
  protected readonly taskCategoryLabels = TASK_CATEGORY_LABELS;

  protected readonly authForm = this.formBuilder.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  });

  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: [''],
    rawPrompt: ['', [Validators.required, Validators.minLength(6)]],
    workMode: ['CHARA_WORK' as WorkMode],
    category: ['CODING_LOGICAL' as TaskCategory]
  });

  private readonly taskValue = toSignal(
    this.taskForm.valueChanges.pipe(startWith(this.taskForm.getRawValue())),
    {
      initialValue: this.taskForm.getRawValue()
    }
  );

  private readonly taskDraft = computed<TaskDraftValue>(() => {
    const task = this.taskValue();

    return {
      title: task.title ?? '',
      rawPrompt: task.rawPrompt ?? '',
      workMode: task.workMode ?? 'CHARA_WORK',
      category: task.category ?? 'CODING_LOGICAL'
    };
  });

  protected readonly classification = computed(() => {
    const task = this.taskDraft();

    return this.classifier.classify({
      rawPrompt: task.rawPrompt,
      workMode: task.workMode
    });
  });

  protected readonly recommendation = computed(() => {
    const task = this.taskDraft();

    return this.recommender.recommend(task.category, task.workMode);
  });

  protected readonly preparedPrompt = computed(() => {
    const task = this.taskDraft();

    if (!task.rawPrompt.trim()) {
      return '';
    }

    return [
      `Work mode: ${this.workModeLabels[task.workMode]}`,
      `Category: ${this.taskCategoryLabels[task.category]}`,
      `Recommended provider: ${this.recommendation().primaryProviderName}`,
      '',
      'Task:',
      task.rawPrompt.trim()
    ].join('\n');
  });

  protected readonly submitLabel = computed(() =>
    this.mode() === 'sign-in' ? 'Sign in' : 'Create account'
  );

  protected readonly modeToggleLabel = computed(() =>
    this.mode() === 'sign-in' ? 'Create account' : 'Use existing account'
  );

  constructor() {
    effect(() => {
      if (this.auth.signedIn()) {
        void this.loadRecentTasks();
      } else {
        this.recentTasks.set([]);
      }
    });
  }

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

  protected useDetectedCategory(): void {
    this.taskForm.controls.category.setValue(this.classification().category);
  }

  protected async saveTask(): Promise<void> {
    if (this.taskForm.invalid || !this.preparedPrompt()) {
      this.taskForm.markAllAsTouched();
      this.taskSaveMessage.set('Write a task before saving.');
      this.taskSaveIsError.set(true);
      return;
    }

    const task = this.taskDraft();
    this.taskSaving.set(true);

    try {
      const result = await this.taskPersistence.saveTask({
        title: task.title,
        rawPrompt: task.rawPrompt,
        preparedPrompt: this.preparedPrompt(),
        workMode: task.workMode,
        category: task.category,
        classification: this.classification(),
        recommendation: this.recommendation()
      });

      this.taskSaveMessage.set(result.message);
      this.taskSaveIsError.set(!result.ok);

      if (result.ok) {
        await this.loadRecentTasks();
      }
    } finally {
      this.taskSaving.set(false);
    }
  }

  protected async loadRecentTasks(): Promise<void> {
    this.recentTasksLoading.set(true);

    try {
      this.recentTasks.set(await this.taskPersistence.loadRecentTasks());
    } finally {
      this.recentTasksLoading.set(false);
    }
  }
}

