# Local Development Guide

This guide explains how to run Chara Hub locally without committing secrets or accidentally changing the project architecture.

For a shorter setup path, use the [First-Run Checklist](first-run-checklist.md).

For backend status problems, use [Backend Status Troubleshooting](backend-status-troubleshooting.md).

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Config Files](#local-config-files)
3. [Run The Frontend](#run-the-frontend)
4. [Run The Backend](#run-the-backend)
5. [Connect Frontend To Backend Status](#connect-frontend-to-backend-status)
6. [Verification Commands](#verification-commands)
7. [Git Safety](#git-safety)
8. [Common Windows Notes](#common-windows-notes)

---

# Prerequisites

Expected local tools:

| Tool | Purpose |
| --- | --- |
| Node.js / npm | Angular frontend |
| Java 17 | Spring Boot backend |
| Git | Branch workflow |
| Supabase project | Auth and database |

The project is currently web-first. Desktop shell and local agent mode are later phases.

[Back to Table of Contents](#table-of-contents)

---

# Local Config Files

Use example files as templates, then keep real local files untracked.

Frontend runtime config:

```text
frontend/public/config.example.js
frontend/public/config.js
```

Backend local config:

```text
backend/src/main/resources/application-local.example.properties
backend/src/main/resources/application-local.properties
```

Never commit:

- `frontend/public/config.js`
- `backend/src/main/resources/application-local.properties`
- `.env`
- Supabase database password
- Supabase secret key
- Supabase service role key
- cookies, tokens, certificates, credentials

[Back to Table of Contents](#table-of-contents)

---

# Run The Frontend

From the frontend directory:

```cmd
cd frontend
npm.cmd start
```

Default URL:

```text
http://localhost:4200/
```

If port `4200` is already in use, run:

```cmd
npm.cmd run start -- --host 127.0.0.1 --port 4201
```

[Back to Table of Contents](#table-of-contents)

---

# Run The Backend

From the backend directory:

```cmd
cd backend
cmd /c mvnw.cmd spring-boot:run
```

Default backend URL:

```text
http://localhost:8080/
```

Current backend status endpoint:

```text
http://localhost:8080/api/status
```

The backend is still passive/status-only. It does not own user data flow yet.

[Back to Table of Contents](#table-of-contents)

---

# Connect Frontend To Backend Status

To let the frontend display backend status, set `backendApiUrl` in `frontend/public/config.js`:

```js
window.CHARA_HUB_CONFIG = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabasePublishableKey: 'your-publishable-key',
  backendApiUrl: 'http://localhost:8080'
};
```

If `backendApiUrl` is missing, the app stays usable and shows that backend status is not configured.

This does not move auth or data flow to Spring Boot. Supabase still owns Auth and RLS-backed MVP data access.

For local status check issues, see [Backend Status Troubleshooting](backend-status-troubleshooting.md).

[Back to Table of Contents](#table-of-contents)

---

# Verification Commands

Frontend:

```cmd
cd frontend
npm.cmd run build
npm.cmd test -- --watch=false
```

Backend:

```cmd
cd backend
cmd /c mvnw.cmd test
```

Recommended before commit:

```cmd
git status --short --branch
git diff --check
```

[Back to Table of Contents](#table-of-contents)

---

# Git Safety

Do not use `git add .` in this repository. Private docs and local config files live near tracked files.

Prefer explicit file adds:

```cmd
git add README.md docs/local-dev-guide.md frontend/README.md
```

If you accidentally staged too much:

```cmd
git restore --staged .
git status --short --branch
```

If Git opens Vim for a merge message, avoid that by always passing a message:

```cmd
git merge --no-ff feature/name -m "Merge feature/name"
```

[Back to Table of Contents](#table-of-contents)

---

# Common Windows Notes

PowerShell may print an execution-policy warning like this:

```text
Microsoft.PowerShell_profile.ps1 cannot be loaded because running scripts is disabled
```

Treat the actual command exit status and build/test output as the source of truth. This warning is noisy but usually not the reason a build failed.

Git may also print:

```text
warning: LF will be replaced by CRLF
```

That is line-ending normalization noise on Windows. Do not treat it as a failed command.

[Back to Table of Contents](#table-of-contents)
