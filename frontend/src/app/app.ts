import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';

import { AuthMode, AuthService } from './core/auth/auth.service';
import { BackendStatusService } from './core/backend/backend-status.service';
import { TaskClassifierService } from './core/classification/task-classifier.service';
import { ProviderRecommendationService } from './core/recommendation/provider-recommendation.service';
import {
  RecentTask,
  TaskDetail,
  TaskPersistenceService,
} from './core/tasks/task-persistence.service';
import {
  TASK_CATEGORIES,
  TASK_CATEGORY_LABELS,
  TASK_STATUSES,
  TASK_STATUS_LABELS,
  WORK_MODES,
  WORK_MODE_LABELS,
  ProviderId,
  ProviderPreference,
  PromptTemplate,
  TaskCategory,
  TaskStatus,
  WorkMode,
} from './core/models';

interface TaskDraftValue {
  title: string;
  rawPrompt: string;
  workMode: WorkMode;
  category: TaskCategory;
}

interface ProviderHandoff {
  providerId: ProviderId;
  providerName: string;
  url: string | null;
  manualText: string;
}

type CategoryFilter = TaskCategory | 'ALL';
type WorkModeFilter = WorkMode | 'ALL';
type StatusFilter = TaskStatus | 'ALL';
type WorkModeScope = WorkMode | 'ANY';

const PROVIDER_HANDOFFS: Record<string, Pick<ProviderHandoff, 'url' | 'manualText'>> = {
  chatgpt: {
    url: 'https://chatgpt.com/',
    manualText: 'Open ChatGPT and paste the prepared prompt.',
  },
  claude: {
    url: 'https://claude.ai/',
    manualText: 'Open Claude and paste the prepared prompt.',
  },
  microsoft_copilot: {
    url: 'https://copilot.microsoft.com/',
    manualText: 'Open Microsoft Copilot or Teams AI and paste the prepared prompt.',
  },
  codex: {
    url: null,
    manualText: 'Use Codex from your local coding workflow and paste the prepared prompt there.',
  },
  claude_code: {
    url: null,
    manualText:
      'Use Claude Code from your local coding workflow and paste the prepared prompt there.',
  },
};

const PROVIDER_NAMES: Record<string, string> = {
  chatgpt: 'ChatGPT',
  claude: 'Claude',
  microsoft_copilot: 'Microsoft Copilot / Teams AI',
  codex: 'Codex',
  claude_code: 'Claude Code',
};

const PROVIDER_IDS: ProviderId[] = [
  'chatgpt',
  'claude',
  'microsoft_copilot',
  'codex',
  'claude_code',
];

const TASK_HISTORY_EVENT_LABELS: Record<string, string> = {
  CREATED: 'Created',
  CLASSIFIED: 'Classified',
  TEMPLATE_APPLIED: 'Template applied',
  COPIED_PROMPT: 'Copied prompt',
  OPENED_PROVIDER: 'Opened provider',
  ARCHIVED: 'Archived',
};

@Component({
  selector: 'app-root',
  imports: [ReactiveFormsModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly formBuilder = inject(FormBuilder);
  private readonly classifier = inject(TaskClassifierService);
  private readonly recommender = inject(ProviderRecommendationService);
  private readonly taskPersistence = inject(TaskPersistenceService);
  protected readonly backendStatus = inject(BackendStatusService);
  protected readonly auth = inject(AuthService);
  protected readonly mode = signal<AuthMode>('sign-in');
  protected readonly message = signal('');
  protected readonly messageIsError = signal(false);
  protected readonly taskSaveMessage = signal('');
  protected readonly taskSaveIsError = signal(false);
  protected readonly taskSaving = signal(false);
  protected readonly handoffMessage = signal('');
  protected readonly handoffIsError = signal(false);
  protected readonly handoffBusy = signal(false);
  protected readonly activeTaskId = signal<string | null>(null);
  protected readonly recentTasks = signal<RecentTask[]>([]);
  protected readonly recentTasksLoading = signal(false);
  protected readonly selectedTaskDetail = signal<TaskDetail | null>(null);
  protected readonly taskDetailLoading = signal(false);
  protected readonly taskDetailMessage = signal('');
  protected readonly promptTemplates = signal<PromptTemplate[]>([]);
  protected readonly promptTemplatesLoading = signal(false);
  protected readonly providerPreferences = signal<ProviderPreference[]>([]);
  protected readonly providerPreferencesLoading = signal(false);
  protected readonly providerPreferenceOrder = signal<ProviderId[]>([]);
  protected readonly providerPreferenceMessage = signal('');
  protected readonly providerPreferenceMessageIsError = signal(false);
  protected readonly providerPreferenceSaving = signal(false);
  protected readonly templateMessage = signal('');
  protected readonly templateMessageIsError = signal(false);
  protected readonly selectedTemplateId = signal('');
  protected readonly appliedTemplate = signal<PromptTemplate | null>(null);
  protected readonly settingsMessage = signal('');
  protected readonly settingsMessageIsError = signal(false);
  protected readonly settingsSaving = signal(false);
  protected readonly workModes = WORK_MODES;
  protected readonly workModeLabels = WORK_MODE_LABELS;
  protected readonly taskCategories = TASK_CATEGORIES;
  protected readonly taskCategoryLabels = TASK_CATEGORY_LABELS;
  protected readonly taskStatuses = TASK_STATUSES;
  protected readonly taskStatusLabels = TASK_STATUS_LABELS;
  protected readonly workModeScopes: WorkModeScope[] = ['ANY', ...WORK_MODES];

  protected readonly authForm = this.formBuilder.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  protected readonly taskForm = this.formBuilder.nonNullable.group({
    title: [''],
    rawPrompt: ['', [Validators.required, Validators.minLength(6)]],
    workMode: ['CHARA_WORK' as WorkMode],
    category: ['CODING_LOGICAL' as TaskCategory],
  });

  protected readonly historyFilterForm = this.formBuilder.nonNullable.group({
    search: [''],
    category: ['ALL' as CategoryFilter],
    workMode: ['ALL' as WorkModeFilter],
    status: ['ALL' as StatusFilter],
  });

  protected readonly settingsForm = this.formBuilder.nonNullable.group({
    defaultWorkMode: ['CHARA' as WorkMode],
  });

  protected readonly providerPreferenceForm = this.formBuilder.nonNullable.group({
    category: ['CODING_LOGICAL' as TaskCategory],
    workModeScope: ['CHARA_WORK' as WorkModeScope],
  });

  private readonly taskValue = toSignal(
    this.taskForm.valueChanges.pipe(startWith(this.taskForm.getRawValue())),
    {
      initialValue: this.taskForm.getRawValue(),
    },
  );

  private readonly taskDraft = computed<TaskDraftValue>(() => {
    const task = this.taskValue();

    return {
      title: task.title ?? '',
      rawPrompt: task.rawPrompt ?? '',
      workMode: task.workMode ?? 'CHARA_WORK',
      category: task.category ?? 'CODING_LOGICAL',
    };
  });

  private readonly historyFilterValue = toSignal(
    this.historyFilterForm.valueChanges.pipe(startWith(this.historyFilterForm.getRawValue())),
    {
      initialValue: this.historyFilterForm.getRawValue(),
    },
  );

  private readonly providerPreferenceValue = toSignal(
    this.providerPreferenceForm.valueChanges.pipe(
      startWith(this.providerPreferenceForm.getRawValue()),
    ),
    {
      initialValue: this.providerPreferenceForm.getRawValue(),
    },
  );

  protected readonly filteredRecentTasks = computed(() => {
    const filters = this.historyFilterValue();
    const search = (filters.search ?? '').trim().toLocaleLowerCase();
    const category = filters.category ?? 'ALL';
    const workMode = filters.workMode ?? 'ALL';
    const status = filters.status ?? 'ALL';

    return this.recentTasks().filter((task) => {
      const matchesSearch =
        !search ||
        [
          task.title ?? '',
          task.raw_prompt,
          this.taskCategoryLabels[task.category],
          this.workModeLabels[task.work_mode],
          this.taskStatusLabels[task.status],
        ]
          .join(' ')
          .toLocaleLowerCase()
          .includes(search);

      return (
        matchesSearch &&
        (category === 'ALL' || task.category === category) &&
        (workMode === 'ALL' || task.work_mode === workMode) &&
        (status === 'ALL' || task.status === status)
      );
    });
  });

  protected readonly latestRecentTask = computed(() => this.recentTasks()[0] ?? null);

  protected readonly sentTaskCount = computed(
    () => this.recentTasks().filter((task) => task.status === 'SENT').length,
  );

  protected readonly preparedTaskCount = computed(
    () => this.recentTasks().filter((task) => task.status === 'PREPARED').length,
  );

  protected readonly dashboardDefaultWorkMode = computed(() => {
    const profile = this.auth.profile();

    return profile?.default_work_mode ?? this.taskDraft().workMode;
  });

  protected readonly activeWorkflowStatus = computed(() => {
    if (this.hasActiveSavedTask()) {
      return 'Saved task active';
    }

    if (this.taskDraft().rawPrompt.trim()) {
      return 'Draft in progress';
    }

    return 'Ready for a task';
  });

  protected readonly promptCharacterCount = computed(
    () => this.taskDraft().rawPrompt.trim().length,
  );

  protected readonly taskReadyToSave = computed(() => {
    this.taskValue();

    return this.auth.configReady() && !this.taskSaving() && this.taskForm.valid;
  });

  protected readonly handoffReady = computed(() => {
    this.taskValue();

    return !this.handoffBusy() && this.taskForm.valid;
  });

  protected readonly hasActiveSavedTask = computed(() => Boolean(this.activeTaskId()));

  protected readonly availablePromptTemplates = computed(() => {
    const task = this.taskDraft();

    return this.promptTemplates().filter(
      (template) =>
        template.category === task.category &&
        (!template.work_mode || template.work_mode === task.workMode),
    );
  });

  protected readonly selectedTemplate = computed(() => {
    const selectedId = this.selectedTemplateId();

    return this.availablePromptTemplates().find((template) => template.id === selectedId) ?? null;
  });

  protected readonly selectedProviderPreference = computed(() => {
    const value = this.providerPreferenceValue();

    return (
      this.providerPreferences().find(
        (preference) =>
          preference.category === value.category &&
          (value.workModeScope === 'ANY'
            ? preference.work_mode === null
            : preference.work_mode === value.workModeScope),
      ) ?? null
    );
  });

  protected readonly providerPreferenceFallbackWorkMode = computed<WorkMode>(() => {
    const value = this.providerPreferenceValue();
    const workModeScope = value.workModeScope ?? 'CHARA_WORK';

    return workModeScope === 'ANY'
      ? this.settingsForm.getRawValue().defaultWorkMode
      : workModeScope;
  });

  protected readonly providerPreferenceBaselineOrder = computed(() => {
    const value = this.providerPreferenceValue();
    const category = value.category ?? 'CODING_LOGICAL';

    return (
      this.selectedProviderPreference()?.provider_order ??
      this.preferenceDefaultProviderOrder(category, this.providerPreferenceFallbackWorkMode())
    );
  });

  protected readonly providerPreferenceHasChanges = computed(
    () =>
      !this.sameProviderOrder(
        this.providerPreferenceOrder(),
        this.providerPreferenceBaselineOrder(),
      ),
  );

  protected readonly activeRecommendationPreference = computed(() => {
    const task = this.taskDraft();

    return this.findProviderPreference(task.category, task.workMode);
  });

  protected readonly classification = computed(() => {
    const task = this.taskDraft();

    return this.classifier.classify({
      rawPrompt: task.rawPrompt,
      workMode: task.workMode,
    });
  });

  protected readonly recommendation = computed(() => {
    const task = this.taskDraft();

    return this.recommender.recommend(
      task.category,
      task.workMode,
      this.activeRecommendationPreference()?.provider_order ?? null,
    );
  });

  protected readonly preparedPrompt = computed(() => {
    const task = this.taskDraft();

    if (!task.rawPrompt.trim()) {
      return '';
    }

    const appliedTemplate = this.appliedTemplate();

    if (appliedTemplate) {
      return this.renderTemplate(appliedTemplate.body, task);
    }

    return [
      `Work mode: ${this.workModeLabels[task.workMode]}`,
      `Category: ${this.taskCategoryLabels[task.category]}`,
      `Recommended provider: ${this.recommendation().primaryProviderName}`,
      '',
      'Task:',
      task.rawPrompt.trim(),
    ].join('\n');
  });

  protected readonly providerHandoff = computed<ProviderHandoff>(() => {
    const recommendation = this.recommendation();
    const handoff = PROVIDER_HANDOFFS[recommendation.primaryProviderId] ?? {
      url: null,
      manualText: `Open ${recommendation.primaryProviderName} manually and paste the prepared prompt.`,
    };

    return {
      providerId: recommendation.primaryProviderId,
      providerName: recommendation.primaryProviderName,
      url: handoff.url,
      manualText: handoff.manualText,
    };
  });

  protected readonly submitLabel = computed(() =>
    this.mode() === 'sign-in' ? 'Sign in' : 'Create account',
  );

  protected readonly modeToggleLabel = computed(() =>
    this.mode() === 'sign-in' ? 'Create account' : 'Use existing account',
  );

  constructor() {
    void this.backendStatus.loadStatus();

    this.taskForm.valueChanges.subscribe(() => {
      this.activeTaskId.set(null);
      this.handoffMessage.set('');
      this.handoffIsError.set(false);
    });

    this.providerPreferenceForm.valueChanges.subscribe(() => {
      this.providerPreferenceMessage.set('');
      this.providerPreferenceMessageIsError.set(false);
    });

    effect(() => {
      if (this.auth.signedIn()) {
        void this.loadRecentTasks();
        void this.loadPromptTemplates();
        void this.loadProviderPreferences();
      } else {
        this.recentTasks.set([]);
        this.promptTemplates.set([]);
        this.providerPreferences.set([]);
        this.providerPreferenceOrder.set([]);
        this.selectedTemplateId.set('');
        this.appliedTemplate.set(null);
        this.selectedTaskDetail.set(null);
      }
    });

    effect(() => {
      const profile = this.auth.profile();

      if (!profile) {
        return;
      }

      this.settingsForm.controls.defaultWorkMode.setValue(profile.default_work_mode, {
        emitEvent: false,
      });

      if (
        !this.taskDraft().rawPrompt.trim() &&
        this.taskForm.controls.workMode.value !== profile.default_work_mode
      ) {
        this.taskForm.controls.workMode.setValue(profile.default_work_mode, {
          emitEvent: false,
        });
      }
    });

    effect(() => {
      this.providerPreferenceOrder.set(this.providerPreferenceBaselineOrder());
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
    const result =
      this.mode() === 'sign-in'
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
        recommendation: this.recommendation(),
      });

      this.taskSaveMessage.set(result.message);
      this.taskSaveIsError.set(!result.ok);

      if (result.ok) {
        this.activeTaskId.set(result.taskId ?? null);
        await this.loadRecentTasks();

        if (result.taskId) {
          await this.recordAppliedTemplate(result.taskId);
          await this.loadTaskDetail(result.taskId);
        }
      }
    } finally {
      this.taskSaving.set(false);
    }
  }

  protected async copyPreparedPrompt(): Promise<void> {
    const prompt = this.preparedPrompt();

    if (!prompt) {
      this.taskForm.markAllAsTouched();
      this.handoffMessage.set('Write a task before copying the prepared prompt.');
      this.handoffIsError.set(true);
      return;
    }

    this.handoffBusy.set(true);

    try {
      await this.copyText(prompt);

      const taskId = this.activeTaskId();
      if (!taskId) {
        this.handoffMessage.set(
          'Prompt copied. Save the task first if you want this handoff recorded.',
        );
        this.handoffIsError.set(false);
        return;
      }

      const result = await this.taskPersistence.recordTaskHistoryEvent({
        taskId,
        eventType: 'COPIED_PROMPT',
        providerId: this.providerHandoff().providerId,
        markTaskSent: true,
        details: {
          source: 'new_task_workspace',
          promptLength: prompt.length,
        },
      });

      this.handoffMessage.set(
        result.ok
          ? 'Prompt copied and handoff recorded.'
          : `Prompt copied, but history failed: ${result.message}`,
      );
      this.handoffIsError.set(!result.ok);

      if (result.ok) {
        await this.loadRecentTasks();
        await this.loadTaskDetail(taskId);
      }
    } catch (error) {
      this.handoffMessage.set(
        error instanceof Error ? error.message : 'Prompt could not be copied.',
      );
      this.handoffIsError.set(true);
    } finally {
      this.handoffBusy.set(false);
    }
  }

  protected async openRecommendedProvider(): Promise<void> {
    const handoff = this.providerHandoff();

    if (!this.preparedPrompt()) {
      this.taskForm.markAllAsTouched();
      this.handoffMessage.set('Write a task before opening the provider.');
      this.handoffIsError.set(true);
      return;
    }

    if (!handoff.url) {
      this.handoffMessage.set(handoff.manualText);
      this.handoffIsError.set(false);
      return;
    }

    const openedWindow = window.open(handoff.url, '_blank');
    if (!openedWindow) {
      this.handoffMessage.set(
        'The browser blocked the provider tab. Allow popups or open it manually.',
      );
      this.handoffIsError.set(true);
      return;
    }

    openedWindow.opener = null;

    const taskId = this.activeTaskId();
    if (!taskId) {
      this.handoffMessage.set(
        `${handoff.providerName} opened. Save the task first if you want this handoff recorded.`,
      );
      this.handoffIsError.set(false);
      return;
    }

    this.handoffBusy.set(true);

    try {
      const result = await this.taskPersistence.recordTaskHistoryEvent({
        taskId,
        eventType: 'OPENED_PROVIDER',
        providerId: handoff.providerId,
        markTaskSent: true,
        details: {
          source: 'new_task_workspace',
          url: handoff.url,
        },
      });

      this.handoffMessage.set(
        result.ok
          ? `${handoff.providerName} opened and handoff recorded.`
          : `${handoff.providerName} opened, but history failed: ${result.message}`,
      );
      this.handoffIsError.set(!result.ok);

      if (result.ok) {
        await this.loadRecentTasks();
        await this.loadTaskDetail(taskId);
      }
    } finally {
      this.handoffBusy.set(false);
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

  protected async loadPromptTemplates(): Promise<void> {
    this.promptTemplatesLoading.set(true);

    try {
      this.promptTemplates.set(await this.taskPersistence.loadPromptTemplates());
    } finally {
      this.promptTemplatesLoading.set(false);
    }
  }

  protected async loadProviderPreferences(): Promise<void> {
    this.providerPreferencesLoading.set(true);

    try {
      this.providerPreferences.set(await this.taskPersistence.loadProviderPreferences());
    } finally {
      this.providerPreferencesLoading.set(false);
    }
  }

  protected async saveDefaultWorkMode(): Promise<void> {
    if (!this.auth.signedIn()) {
      this.settingsMessage.set('Sign in before saving settings.');
      this.settingsMessageIsError.set(true);
      return;
    }

    this.settingsSaving.set(true);

    try {
      const defaultWorkMode = this.settingsForm.getRawValue().defaultWorkMode;
      const result = await this.auth.updateDefaultWorkMode(defaultWorkMode);

      this.settingsMessage.set(result.message);
      this.settingsMessageIsError.set(!result.ok);

      if (result.ok && !this.taskDraft().rawPrompt.trim()) {
        this.taskForm.controls.workMode.setValue(defaultWorkMode);
      }
    } finally {
      this.settingsSaving.set(false);
    }
  }

  protected async saveProviderPreference(): Promise<void> {
    if (!this.auth.signedIn()) {
      this.providerPreferenceMessage.set('Sign in before saving provider preferences.');
      this.providerPreferenceMessageIsError.set(true);
      return;
    }

    this.providerPreferenceSaving.set(true);

    try {
      const value = this.providerPreferenceForm.getRawValue();
      const result = await this.taskPersistence.saveProviderPreference({
        category: value.category,
        workMode: value.workModeScope === 'ANY' ? null : value.workModeScope,
        providerOrder: this.providerPreferenceOrder(),
      });

      this.providerPreferenceMessage.set(result.message);
      this.providerPreferenceMessageIsError.set(!result.ok);

      if (result.ok && result.preference) {
        this.providerPreferences.update((preferences) => [
          ...preferences.filter((preference) => preference.id !== result.preference!.id),
          result.preference!,
        ]);
      }
    } finally {
      this.providerPreferenceSaving.set(false);
    }
  }

  protected moveProviderPreference(providerId: ProviderId, direction: -1 | 1): void {
    const providerOrder = [...this.providerPreferenceOrder()];
    const currentIndex = providerOrder.indexOf(providerId);
    const targetIndex = currentIndex + direction;

    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= providerOrder.length) {
      return;
    }

    [providerOrder[currentIndex], providerOrder[targetIndex]] = [
      providerOrder[targetIndex],
      providerOrder[currentIndex],
    ];
    this.providerPreferenceOrder.set(providerOrder);
  }

  protected resetProviderPreferenceOrder(): void {
    const value = this.providerPreferenceForm.getRawValue();
    const workModeScope = value.workModeScope;
    const fallbackWorkMode =
      workModeScope === 'ANY' ? this.settingsForm.getRawValue().defaultWorkMode : workModeScope;

    this.providerPreferenceOrder.set(
      this.preferenceDefaultProviderOrder(value.category, fallbackWorkMode),
    );
    this.providerPreferenceMessage.set('Provider order reset to the default preview.');
    this.providerPreferenceMessageIsError.set(false);
  }

  protected selectTemplate(templateId: string): void {
    this.selectedTemplateId.set(templateId);
    this.templateMessage.set('');
    this.templateMessageIsError.set(false);
  }

  protected async applySelectedTemplate(): Promise<void> {
    const template = this.selectedTemplate();

    if (!template) {
      this.templateMessage.set('Select a template before applying.');
      this.templateMessageIsError.set(true);
      return;
    }

    if (!this.taskDraft().rawPrompt.trim()) {
      this.taskForm.controls.rawPrompt.markAsTouched();
      this.templateMessage.set('Write a task before applying a template.');
      this.templateMessageIsError.set(true);
      return;
    }

    this.appliedTemplate.set(template);

    const taskId = this.activeTaskId();
    if (!taskId) {
      this.templateMessage.set('Template applied. Save the task to record the template event.');
      this.templateMessageIsError.set(false);
      return;
    }

    await this.recordAppliedTemplate(taskId);
    await this.loadTaskDetail(taskId);
  }

  protected clearAppliedTemplate(): void {
    this.appliedTemplate.set(null);
    this.templateMessage.set('Template cleared. The default prepared prompt is active.');
    this.templateMessageIsError.set(false);
  }

  protected clearHistoryFilters(): void {
    this.historyFilterForm.setValue({
      search: '',
      category: 'ALL',
      workMode: 'ALL',
      status: 'ALL',
    });
  }

  protected reuseTask(task: RecentTask): void {
    this.taskForm.patchValue({
      title: task.title ?? '',
      rawPrompt: task.raw_prompt,
      workMode: task.work_mode,
      category: task.category,
    });

    this.activeTaskId.set(task.id);
    this.appliedTemplate.set(null);
    this.selectedTemplateId.set('');
    this.taskSaveMessage.set('Task loaded for reuse. Save it again when ready.');
    this.taskSaveIsError.set(false);
  }

  protected async viewTaskDetail(task: RecentTask): Promise<void> {
    await this.loadTaskDetail(task.id);
  }

  protected closeTaskDetail(): void {
    this.selectedTaskDetail.set(null);
    this.taskDetailMessage.set('');
  }

  protected scrollToSection(sectionId: string): void {
    document.getElementById(sectionId)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  protected providerName(providerId: ProviderId | null): string {
    if (!providerId) {
      return 'No provider';
    }

    return PROVIDER_NAMES[providerId] ?? providerId;
  }

  protected workModeScopeLabel(workModeScope: WorkModeScope): string {
    return workModeScope === 'ANY' ? 'Any mode' : this.workModeLabels[workModeScope];
  }

  protected historyEventLabel(eventType: string): string {
    return TASK_HISTORY_EVENT_LABELS[eventType] ?? eventType;
  }

  protected formatDateTime(value: string): string {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(value));
  }

  private async loadTaskDetail(taskId: string): Promise<void> {
    this.taskDetailLoading.set(true);
    this.taskDetailMessage.set('');

    try {
      const detail = await this.taskPersistence.loadTaskDetail(taskId);
      this.selectedTaskDetail.set(detail);

      if (!detail) {
        this.taskDetailMessage.set('Task detail could not be loaded.');
      }
    } finally {
      this.taskDetailLoading.set(false);
    }
  }

  private async recordAppliedTemplate(taskId: string): Promise<void> {
    const template = this.appliedTemplate();

    if (!template) {
      return;
    }

    const result = await this.taskPersistence.recordTaskHistoryEvent({
      taskId,
      eventType: 'TEMPLATE_APPLIED',
      details: {
        source: 'new_task_workspace',
        templateId: template.id,
        templateName: template.name,
        category: template.category,
        workMode: template.work_mode,
      },
    });

    this.templateMessage.set(
      result.ok
        ? `Template applied and recorded: ${template.name}.`
        : `Template applied, but history failed: ${result.message}`,
    );
    this.templateMessageIsError.set(!result.ok);
  }

  private findProviderPreference(
    category: TaskCategory,
    workMode: WorkMode,
  ): ProviderPreference | null {
    return (
      this.providerPreferences().find(
        (preference) => preference.category === category && preference.work_mode === workMode,
      ) ??
      this.providerPreferences().find(
        (preference) => preference.category === category && preference.work_mode === null,
      ) ??
      null
    );
  }

  private preferenceDefaultProviderOrder(
    category: TaskCategory,
    workMode: WorkMode,
  ): ProviderId[] {
    const recommendedOrder = this.recommender.defaultProviderOrder(category, workMode);
    const remainingProviders = PROVIDER_IDS.filter(
      (providerId) => !recommendedOrder.includes(providerId),
    );

    return [...recommendedOrder, ...remainingProviders];
  }

  private sameProviderOrder(first: ProviderId[], second: ProviderId[]): boolean {
    return first.length === second.length && first.every((providerId, index) => providerId === second[index]);
  }

  private renderTemplate(templateBody: string, task: TaskDraftValue): string {
    const replacements: Record<string, string> = {
      rawPrompt: task.rawPrompt.trim(),
      category: this.taskCategoryLabels[task.category],
      workMode: this.workModeLabels[task.workMode],
      provider: this.recommendation().primaryProviderName,
    };

    return templateBody.replace(/\{\{(rawPrompt|category|workMode|provider)\}\}/g, (_, key) => {
      return replacements[key] ?? '';
    });
  }

  private async copyText(text: string): Promise<void> {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.setAttribute('readonly', '');
    textarea.style.position = 'fixed';
    textarea.style.left = '-9999px';
    document.body.appendChild(textarea);
    textarea.select();

    const copied = document.execCommand('copy');
    document.body.removeChild(textarea);

    if (!copied) {
      throw new Error('Prompt could not be copied.');
    }
  }
}
