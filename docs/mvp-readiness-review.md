# MVP Readiness Review

This review records the current MVP readiness state for Chara Hub after the first-run and backend status troubleshooting slices.

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
2026-05-10
```

[Back to Table of Contents](#table-of-contents)

---

# Current Verdict

Chara Hub is close to MVP-ready for local personal use.

Current readiness:

```text
MVP readiness: 90-95%
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

The main remaining work is not a new backend architecture. The main remaining work is a focused manual smoke test and small bug-fix pass against the real local Supabase project.

Use the [MVP Smoke-Test Checklist](mvp-smoke-test-checklist.md) for that manual validation pass.

[Back to Table of Contents](#table-of-contents)

---

# Verification Result

Commands run:

| Command | Result |
| --- | --- |
| `cd frontend && npm.cmd run build` | Passed |
| `cd frontend && npm.cmd test -- --watch=false` | Passed: 1 test file, 2 tests |
| `cd backend && cmd /c mvnw.cmd test` | Passed: 3 tests |

Frontend production build:

```text
Initial total: 441.08 kB raw / 105.40 kB estimated transfer
```

Backend tests include:

- application context load
- passive backend status response
- local frontend CORS for `/api/status`

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

These should be checked before calling the MVP done:

| Blocker | Why It Matters | Recommended Action |
| --- | --- | --- |
| Real Supabase smoke test | Automated tests do not prove real Auth/RLS/config behavior. | Run the app against Tao's local `config.js` and manually test the full workflow. |
| Manual saved-task flow check | Core value depends on save/history/reuse behaving correctly. | Create a task, save it, copy/open handoff, inspect timeline, then reuse it. |
| Provider preference persistence check | Recent work touched preference save/reset/refresh behavior. | Change provider order, save, refresh, and confirm recommendation order persists. |
| Backend status browser check | Unit tests prove CORS behavior, but not Tao's local browser/config state. | Run backend and frontend, set `backendApiUrl`, and confirm passive status appears. |

These are validation blockers, not architecture blockers.

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

Recommended next branch:

```text
feature/mvp-smoke-test-run
```

Recommended scope:

1. Run the manual smoke-test checklist against Tao's real local Supabase-backed app.
2. Record pass/fail notes.
3. Fix only bugs found during the smoke test.

This is the right next step because the code already builds and tests pass. The remaining risk is whether the real local flow works cleanly end to end.

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
