# MVP Smoke-Test Run

This document records the first MVP smoke-test run after the smoke-test checklist was added.

The run confirms automated checks and records why the browser Supabase-backed smoke test could not be completed in this workspace yet.

---

## Table of Contents

1. [Run Summary](#run-summary)
2. [Automated Checks](#automated-checks)
3. [Local Config Check](#local-config-check)
4. [Browser Smoke-Test Status](#browser-smoke-test-status)
5. [Required Next Action](#required-next-action)
6. [What Not To Do](#what-not-to-do)

---

# Run Summary

Run date:

```text
2026-05-10
```

Branch:

```text
feature/mvp-smoke-test-run
```

Result:

```text
Automated checks passed.
Browser smoke test blocked by missing local frontend config.
```

[Back to Table of Contents](#table-of-contents)

---

# Automated Checks

| Check | Command | Result |
| --- | --- | --- |
| Frontend production build | `cd frontend && npm.cmd run build` | Passed |
| Frontend tests | `cd frontend && npm.cmd test -- --watch=false` | Passed: 1 test file, 2 tests |
| Backend tests | `cd backend && cmd /c mvnw.cmd test` | Passed: 3 tests |

Frontend build output:

```text
Initial total: 441.08 kB raw / 105.40 kB estimated transfer
```

Backend test coverage included:

- application context load
- passive backend status response
- local frontend CORS for `/api/status`

[Back to Table of Contents](#table-of-contents)

---

# Local Config Check

Checked local config presence:

| File | Present |
| --- | --- |
| `frontend/public/config.js` | No |
| `backend/src/main/resources/application-local.properties` | No |

The frontend config is required for a real Supabase-backed browser smoke test.

The backend local config is not required for the current passive status endpoint.

[Back to Table of Contents](#table-of-contents)

---

# Browser Smoke-Test Status

The browser smoke test was not completed because `frontend/public/config.js` is missing.

Blocked checklist sections:

- Auth smoke test
- New Task smoke test against real Supabase session
- Template smoke test against real Supabase data
- Save and history smoke test
- Handoff event persistence smoke test
- Provider preference persistence smoke test
- Frontend backend status display with local runtime config

This is a local setup blocker, not an app-code regression.

[Back to Table of Contents](#table-of-contents)

---

# Required Next Action

Create `frontend/public/config.js` locally from `frontend/public/config.example.js`.

The file should contain only frontend-safe values:

```js
window.CHARA_HUB_CONFIG = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabasePublishableKey: 'your-publishable-key',
  backendApiUrl: 'http://localhost:8080'
};
```

Then rerun:

```cmd
cd frontend
npm.cmd start
```

Optional backend status check:

```cmd
cd backend
cmd /c mvnw.cmd spring-boot:run
```

Then follow:

- [MVP Smoke-Test Checklist](mvp-smoke-test-checklist.md)
- [Backend Status Troubleshooting](backend-status-troubleshooting.md)

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

Do not add backend-owned user data flow, JWT validation, or datasource config just to unblock the smoke test.

[Back to Table of Contents](#table-of-contents)
