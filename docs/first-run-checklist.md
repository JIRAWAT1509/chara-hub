# First-Run Checklist

This checklist is the short path for getting Chara Hub running locally for the first time.

For detailed explanations, use the full [Local Development Guide](local-dev-guide.md).

---

## Table of Contents

1. [Before You Start](#before-you-start)
2. [Repository State](#repository-state)
3. [Local Config](#local-config)
4. [Install Frontend Dependencies](#install-frontend-dependencies)
5. [Run The Frontend](#run-the-frontend)
6. [Run The Backend](#run-the-backend)
7. [Connect Backend Status](#connect-backend-status)
8. [Verify Before Committing](#verify-before-committing)
9. [Git Safety](#git-safety)
10. [Expected Current Architecture](#expected-current-architecture)

---

# Before You Start

Expected tools:

| Tool | Why It Is Needed |
| --- | --- |
| Git | Branch workflow and source control |
| Node.js / npm | Angular frontend |
| Java 17 | Spring Boot backend |
| Supabase project | Auth and MVP data storage |

[Back to Table of Contents](#table-of-contents)

---

# Repository State

Start from the repository root:

```cmd
cd C:\Users\HP VICTUS16\Works\personal\chara
git status --short --branch
git log --oneline --decorate -8
```

If starting a new feature:

```cmd
git switch main
git pull origin main
git switch -c feature/name
```

[Back to Table of Contents](#table-of-contents)

---

# Local Config

Create local config files from the safe examples:

```text
frontend/public/config.example.js
frontend/public/config.js

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

# Install Frontend Dependencies

From the frontend directory:

```cmd
cd frontend
npm.cmd install
```

Do not install new packages for normal first-run setup. The project should already define its dependencies in `package.json`.

[Back to Table of Contents](#table-of-contents)

---

# Run The Frontend

From the frontend directory:

```cmd
cd frontend
npm.cmd start
```

Expected URL:

```text
http://localhost:4200/
```

If port `4200` is busy:

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

Expected status endpoint:

```text
http://localhost:8080/api/status
```

The backend is currently passive/status-only. It does not own user data flow yet.

[Back to Table of Contents](#table-of-contents)

---

# Connect Backend Status

Set `backendApiUrl` in `frontend/public/config.js` only if you want the frontend to show backend status:

```js
window.CHARA_HUB_CONFIG = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabasePublishableKey: 'your-publishable-key',
  backendApiUrl: 'http://localhost:8080'
};
```

If `backendApiUrl` is missing, the frontend remains usable and reports that backend status is not configured.

[Back to Table of Contents](#table-of-contents)

---

# Verify Before Committing

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

Docs or general diff check:

```cmd
git diff --check
git status --short --branch
```

[Back to Table of Contents](#table-of-contents)

---

# Git Safety

Use explicit file adds:

```cmd
git add README.md docs/first-run-checklist.md docs/local-dev-guide.md frontend/README.md
```

Avoid:

```cmd
git add .
```

If too much was staged:

```cmd
git restore --staged .
git status --short --branch
```

Use commit and merge messages directly so Git does not open Vim:

```cmd
git commit -m "Add first-run checklist"
git merge --no-ff feature/first-run-checklist -m "Merge feature/first-run-checklist"
```

[Back to Table of Contents](#table-of-contents)

---

# Expected Current Architecture

Current local architecture:

```text
Angular frontend
-> Supabase Auth
-> Supabase Postgres
-> optional Spring Boot /api/status display
```

Do not add backend-owned user data flow until JWT validation is required for a protected backend endpoint.

[Back to Table of Contents](#table-of-contents)
