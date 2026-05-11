# Frontend Component Split Plan

This document records the frontend component splits after the authenticated MVP smoke test passed.

The goal is to reduce risk in `app.ts` and `app.html` without changing product behavior, adding routes, or starting a design-system migration.

---

## Completed Slices

First branch:

```text
feature/frontend-component-split-plan
```

First extracted components:

| Component | Responsibility |
| --- | --- |
| `BrandHeaderComponent` | Renders the Chara Hub title and runtime config status. |
| `DashboardSummaryComponent` | Renders signed-in dashboard counts, latest task, and workspace shortcuts. |
| `BuildContextPanelComponent` | Renders build/backend status and owns passive backend status refresh. |

Second branch:

```text
feature/frontend-task-workspace-split
```

Second extracted components:

| Component | Responsibility |
| --- | --- |
| `NewTaskFormComponent` | Renders task title, prompt, work mode, category controls, and prompt character count. |
| `TaskRoutingResultsComponent` | Renders detected category and provider recommendation result panels, including preference notes and alternatives. |

Third branch:

```text
feature/frontend-template-handoff-split
```

Third extracted components:

| Component | Responsibility |
| --- | --- |
| `PromptTemplatePanelComponent` | Renders template loading, matching template selection, apply/clear controls, selected template detail, and template messages. |
| `PreparedPromptPreviewComponent` | Renders the prepared prompt preview fallback and generated prompt text. |
| `HandoffPanelComponent` | Renders provider handoff guidance, copy/open controls, unsaved handoff note, and handoff messages. |

Fourth branch:

```text
feature/frontend-settings-preferences-split
```

Fourth extracted component:

| Component | Responsibility |
| --- | --- |
| `WorkflowSettingsPanelComponent` | Renders default work mode settings and provider preference routing-order controls. |

`App` still owns the forms, signals, persistence calls, task workflow, and page orchestration.

---

## Why This Split

This is intentionally a small structural slice:

- it avoids changing the user workflow
- it keeps Supabase/Auth/task persistence logic in one place for now
- it proves component boundaries before splitting larger forms
- it keeps Angular Router deferred
- it avoids combining the split with PrimeNG or Tailwind migration

`App` now uses `ViewEncapsulation.None` so the existing shell styles continue to apply after moving markup into child components. This preserves visual behavior during the first split.

---

## Verified

Commands/checks:

| Check | Result |
| --- | --- |
| `cd frontend && npm.cmd test -- --watch=false` | Passed: 1 test file, 3 tests |
| `cd frontend && npm.cmd run build` | Passed |
| Playwright public shell at `http://localhost:4200/` | Passed |
| Playwright authenticated New Task form smoke check | Passed |
| Browser console | No application errors or warnings |
| Backend status request | `GET http://localhost:8080/api/status` returned `200` |

Frontend build output:

```text
Initial total: 453.86 kB raw / 107.78 kB estimated transfer
```

Authenticated browser smoke check confirmed the extracted New Task controls still update:

- task title input
- prompt textarea
- prompt character count
- detected category panel
- provider recommendation panel
- prepared prompt preview
- Save, Copy, and Open handoff action readiness

The template/handoff split was also verified with frontend tests and production build. Browser smoke should be rerun if template application or copy/open behavior changes again.

The settings/provider preferences split was verified with frontend tests and production build.

---

## Next Split Candidates

Recommended order:

1. Extract auth form.
2. Extract history list and task detail.
3. Extract auth form.
4. Decide whether routing is needed after component boundaries are clean.

Keep each extraction behavior-preserving. Run build, tests, and a browser smoke test after each meaningful slice.

---

## Boundaries

Do not add in this slice:

- Angular Router navigation
- PrimeNG
- Tailwind
- backend-owned user data flow
- JWT validation
- database migrations

Those are separate decisions.
