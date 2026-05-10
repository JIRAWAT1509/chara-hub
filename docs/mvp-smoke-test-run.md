# MVP Smoke-Test Run

This document records MVP smoke-test runs after the smoke-test checklist was added.

The latest run confirms automated checks, local runtime config presence, public backend-status behavior, and the authenticated Supabase-backed MVP workflow.

---

## Table of Contents

1. [Run Summary](#run-summary)
2. [Automated Checks](#automated-checks)
3. [Local Config Check](#local-config-check)
4. [Browser Smoke-Test Status](#browser-smoke-test-status)
5. [Required Next Action](#required-next-action)
6. [Follow-Up Fixes](#follow-up-fixes)
7. [What Not To Do](#what-not-to-do)

---

# Run Summary

Run date:

```text
2026-05-11
```

Branch:

```text
feature/authenticated-smoke-test-fixes
```

Result:

```text
Automated checks passed.
Public browser smoke test passed.
Authenticated Supabase workflow smoke test passed after one frontend readiness fix.
```

[Back to Table of Contents](#table-of-contents)

---

# Automated Checks

| Check | Command | Result |
| --- | --- | --- |
| Frontend production build | `cd frontend && npm.cmd run build` | Passed |
| Frontend tests | `cd frontend && npm.cmd test -- --watch=false` | Passed: 1 test file, 3 tests |
| Backend tests | `cd backend && cmd /c mvnw.cmd test` | Passed: 4 tests |

Frontend build output:

```text
Initial total: 441.22 kB raw / 105.41 kB estimated transfer
```

Backend test coverage included:

- application context load
- passive backend status response
- HTTP local frontend CORS for `/api/status`
- HTTPS local frontend CORS for `/api/status`

[Back to Table of Contents](#table-of-contents)

---

# Local Config Check

Checked local config presence:

| File | Present |
| --- | --- |
| `frontend/public/config.js` | Yes |
| `backend/src/main/resources/application-local.properties` | No |

The frontend config exists locally and must remain uncommitted.

The backend local config is not required for the current passive status endpoint.

[Back to Table of Contents](#table-of-contents)

---

# Browser Smoke-Test Status

Playwright opened the local frontend in Microsoft Edge at:

```text
http://localhost:4200/
```

Observed public shell state:

- auth screen rendered
- Supabase runtime config was detected by the UI
- backend status panel rendered
- `GET http://localhost:8080/api/status` returned `200`
- backend status response included `access-control-allow-origin: http://localhost:4200`
- browser console had no errors or warnings beyond Angular development-mode logging

Authenticated checklist sections completed after Tao signed in locally:

- Auth smoke test
- New Task smoke test against real Supabase session
- Template smoke test against real Supabase data
- Save and history smoke test
- Handoff event persistence smoke test
- Provider preference persistence smoke test

The smoke test created one saved task titled `Smoke test task` in Tao's local Supabase project. Provider preference order was temporarily changed to verify persistence, then reset and saved back to the default order.

Bug found during smoke testing:

```text
After entering a valid task prompt, Save task and Copy prepared prompt stayed disabled.
```

Cause:

```text
The Angular computed values read taskForm.valid, but taskForm.valid is not a signal.
The computed values did not track task form value changes.
```

Fix:

```text
taskReadyToSave and handoffReady now track taskValue() before reading taskForm.valid.
```

Console/network result:

- browser console had no application errors after the fix
- the previous Angular `NG0956` warning was removed by changing small repeated tag lists to track by index
- Supabase task, recommendation, history, and provider preference requests returned successful `200`, `201`, or `204` responses

[Back to Table of Contents](#table-of-contents)

---

# Required Next Action

Next product work:

- keep this smoke-test fix branch small
- merge it to `main`
- start planning the frontend component split before any larger UI work

Do not paste credentials into docs, commits, screenshots, or chat.

[Back to Table of Contents](#table-of-contents)

---

# Follow-Up Fixes

After this run record:

| Item | Status |
| --- | --- |
| Local `frontend/public/config.js` | Created by Tao and must stay uncommitted. |
| Supabase API URL | Corrected to use the project API URL, not the dashboard URL. |
| HTTPS local backend status CORS | Fixed and merged to `main` in `e9ee6e5`. |
| Login profile sync loop | Fixed and merged to `main` in `e9ee6e5`. |
| Progress docs after CORS fix | Merged to `main` in `34935be`. |
| Public browser shell smoke test | Passed on `feature/mvp-browser-smoke-test`. |
| Authenticated browser smoke test | Passed on `feature/authenticated-smoke-test-fixes`. |
| Task action readiness bug | Fixed on `feature/authenticated-smoke-test-fixes`. |

Next action:

```text
Plan the frontend component split now that the MVP browser smoke test is stable.
```

[Back to Table of Contents](#table-of-contents)

---

# What Not To Do

Do not commit:

- `frontend/public/config.js`
- `backend/src/main/resources/application-local.properties`
- Supabase database password
- Supabase service role key
- Supabase secret key
- cookies, tokens, certificates, credentials
- `.playwright-cli/` screenshots or browser artifacts

Do not add backend-owned user data flow, JWT validation, or datasource config just to unblock the smoke test.

[Back to Table of Contents](#table-of-contents)
