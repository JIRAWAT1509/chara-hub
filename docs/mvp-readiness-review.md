# MVP Readiness Review

This review records the current MVP readiness state for Chara Hub after the first-run, backend status troubleshooting, public browser smoke-test, and authenticated browser smoke-test slices.

The purpose is to decide what is actually blocking an MVP handoff, without prematurely moving user data flow behind Spring Boot.

---

## Table of Contents

1. [Review Date](#review-date)
2. [Current Verdict](#current-verdict)
3. [Verification Result](#verification-result)
4. [Ready Areas](#ready-areas)
5. [Remaining MVP Blockers](#remaining-mvp-blockers)
6. [Deferred Work](#deferred-work)
7. [Recommended Next Slice](#recommended-next-slice)
8. [Release Discipline](#release-discipline)

---

# Review Date

```text
2026-05-11
```

[Back to Table of Contents](#table-of-contents)

---

# Current Verdict

Chara Hub is close to MVP-ready for local personal use.

Current readiness:

```text
MVP readiness: 96-98%
```

The core Hub loop is implemented:

```text
Sign in
-> create task
-> classify task
-> recommend provider
-> apply template
-> prepare prompt
-> save task
-> copy/open handoff
-> inspect history
-> reuse previous task
```

The main remaining work is not a new backend architecture. The main remaining work is keeping the MVP stable while splitting the large Angular shell into clearer components.

Use the [MVP Smoke-Test Checklist](mvp-smoke-test-checklist.md) for future regression checks.

The first recorded run is available in [MVP Smoke-Test Run](mvp-smoke-test-run.md).

[Back to Table of Contents](#table-of-contents)

---

# Verification Result

Commands run:

| Command | Result |
| --- | --- |
| `cd frontend && npm.cmd run build` | Passed |
| `cd frontend && npm.cmd test -- --watch=false` | Passed: 1 test file, 3 tests |
| `cd backend && cmd /c mvnw.cmd test` | Passed: 4 tests |
| Playwright public browser shell at `http://localhost:4200/` | Passed |
| Playwright authenticated workflow at `http://localhost:4200/` | Passed after fixing task action readiness |
| First frontend component split public shell check | Passed |
| New Task workspace split authenticated smoke check | Passed |
| Template and handoff split automated checks | Passed |

Frontend production build:

```text
Initial total: 441.22 kB raw / 105.41 kB estimated transfer
```

Backend tests include:

- application context load
- passive backend status response
- HTTP local frontend CORS for `/api/status`
- HTTPS local frontend CORS for `/api/status`

Browser smoke coverage so far:

- auth screen rendered
- Supabase runtime config detected
- backend status panel rendered
- `GET http://localhost:8080/api/status` returned `200`
- no browser console errors or warnings beyond Angular development-mode logging
- signed-in dashboard loaded
- task category detection and provider recommendation updated from task input
- template selection and application worked
- task save created task, recommendation, and history records
- saved task detail and timeline loaded
- copy handoff recorded a history event and marked the task as sent
- reuse loaded the saved task back into the task form
- provider preference save changed the active recommendation, then reset/save restored default order
- first component split kept the public auth shell and backend status panel rendering correctly
- New Task workspace split kept task form binding, prompt character count, routing result panels, prepared prompt preview, and action readiness working correctly
- template and handoff split kept Angular build and unit tests passing while preserving App-owned workflow actions

[Back to Table of Contents](#table-of-contents)

---

# Ready Areas

| Area | Status | Notes |
| --- | --- | --- |
| Auth shell | Ready for local MVP | Uses Supabase Auth from frontend config. |
| New Task workflow | Ready for local MVP | Main product loop exists in the single-shell UI. |
| Classification | Ready for MVP | Rule-first and explainable. |
| Provider recommendation | Ready for MVP | Includes detail, alternatives, preference application, and weak-fit notes. |
| Prompt templates | Ready for MVP | Built-in templates can be applied and recorded. |
| Task history | Ready for MVP | Save, list, search, filter, detail, timeline, and reuse exist. |
| Handoff actions | Ready for MVP | Copy/open actions and history events exist. |
| Settings | Ready for MVP | Default work mode and provider preference settings exist. |
| Dashboard summary | Ready for MVP | Lightweight summary exists without adding routed navigation. |
| Backend status | Ready for MVP | Passive `/api/status` works and is optional from the frontend. |
| Local docs | Ready for MVP | First-run, local dev, and backend status troubleshooting docs exist. |

[Back to Table of Contents](#table-of-contents)

---

# Remaining MVP Blockers

These are the remaining risks before broader usage:

| Blocker | Why It Matters | Recommended Action |
| --- | --- | --- |
| Large single Angular shell | The MVP works, but `app.ts` / `app.html` still own too much orchestration and markup. | Continue behavior-preserving component splits for settings, history, and auth. |
| Smoke-test data cleanup | The authenticated run created one task titled `Smoke test task`. | Keep it as test evidence or remove it manually later if the UI gets delete support. |
| Backend status browser check | Public HTTP browser check passed; HTTPS remains useful if Tao runs the dev server over HTTPS. | Recheck only if switching the frontend origin to HTTPS or a different port. |

These are maintenance risks, not architecture blockers.

[Back to Table of Contents](#table-of-contents)

---

# Deferred Work

These should remain deferred unless a concrete need appears:

| Work | Decision |
| --- | --- |
| Backend-owned user data flow | Deferred until a protected backend endpoint exists. |
| JWT validation | Required before any backend endpoint reads or writes user-owned data. |
| Spring datasource/repositories | Deferred until Spring owns a real workflow. |
| Server-side recommendation policy | Defer until frontend rules become hard to manage. |
| Routed pages | Defer until the single-shell workflow needs real navigation. |
| Desktop shell | Later phase. |
| Local agent mode | Much later phase. |

[Back to Table of Contents](#table-of-contents)

---

# Recommended Next Slice

Recommended next branch after merging the template and handoff split:

```text
feature/frontend-settings-preferences-split
```

Recommended scope:

1. Extract settings/default work mode and provider preference controls.
2. Preserve the existing task workflow behavior.
3. Keep Angular Router deferred unless real route-level navigation is chosen.
4. Run the same build/test/browser smoke checks after the split.

This is the right next step because settings/provider preferences are still a large inline area, but can be split without changing persistence or routing behavior.

[Back to Table of Contents](#table-of-contents)

---

# Release Discipline

Before calling the MVP ready:

```cmd
cd frontend
npm.cmd run build
npm.cmd test -- --watch=false

cd ..\backend
cmd /c mvnw.cmd test

cd ..
git diff --check
git status --short --branch
```

Do not use `git add .`. Use explicit file paths so private docs and local config stay out of commits.

[Back to Table of Contents](#table-of-contents)
