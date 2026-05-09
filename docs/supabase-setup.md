# Chara Hub Supabase Setup

This document defines the initial Supabase setup direction for Chara Hub.

Supabase provides authentication and Postgres database infrastructure for the MVP, while the Angular frontend and Spring Boot backend keep the product workflow clear and controlled.

---

## Table of Contents

1. [Setup Goals](#setup-goals)
2. [Project Settings](#project-settings)
3. [Dashboard Options](#dashboard-options)
4. [Required Values](#required-values)
5. [Environment Files](#environment-files)
6. [Frontend Boundary](#frontend-boundary)
7. [Backend Boundary](#backend-boundary)
8. [Security Rules](#security-rules)
9. [Next Implementation Steps](#next-implementation-steps)
10. [References](#references)

---

# Setup Goals

The first Supabase setup should give the project a safe foundation without committing secrets or overbuilding database integration too early.

It should:

- create one Supabase project for the MVP
- use a nearby region for lower latency
- keep API exposure controlled
- enable Row Level Security by default
- store real credentials only in local environment files or deployment secrets
- avoid wiring backend database access before schema decisions are ready

[Back to Table of Contents](#table-of-contents)

---

# Project Settings

Recommended project settings:

| Field | Value |
| --- | --- |
| Project name | `chara-hub` |
| Region | Southeast Asia / Singapore |
| Plan | Free for MVP |
| Database password | Strong generated password stored in a password manager |

Singapore is the recommended region for this project because the primary user is in Thailand and Supabase recommends choosing the closest region for best performance.

[Back to Table of Contents](#table-of-contents)

---

# Dashboard Options

Recommended options during project creation:

| Option | Value | Reason |
| --- | --- | --- |
| GitHub integration | Disabled for now | Schema migrations are not ready yet |
| Enable Data API | Enabled | Useful for Supabase client libraries and future frontend auth/data workflows |
| Automatically expose new tables | Disabled | New tables should require explicit grants before API access |
| Enable automatic RLS | Enabled | New public tables should get Row Level Security automatically |

This combination keeps the Data API available while reducing accidental table exposure.

[Back to Table of Contents](#table-of-contents)

---

# Required Values

After creating the project, keep these values locally.

| Value | Where It Belongs | Notes |
| --- | --- | --- |
| Project ref | Local env / deployment config | Found in the Supabase project URL |
| Project URL | Frontend and backend config | Not a secret |
| Publishable key | Frontend and backend config | Safe for browser use when RLS is configured correctly |
| Database JDBC URL | Backend-only config | Do not expose in Angular |
| Database username | Backend-only config | Do not expose in Angular |
| Database password | Backend-only secret | Never commit |

Do not paste real secret values into public docs, commits, pull requests, or chat logs.

[Back to Table of Contents](#table-of-contents)

---

# Environment Files

The repository includes safe examples:

```text
.env.example
backend/src/main/resources/application-local.example.properties
```

For local development, create untracked local files:

```text
.env
backend/src/main/resources/application-local.properties
```

The real local files should contain actual project values and must stay ignored by Git.

[Back to Table of Contents](#table-of-contents)

---

# Frontend Boundary

The Angular frontend may use:

- Supabase Project URL
- Supabase publishable key

The frontend must not use:

- database password
- secret key
- service role key
- direct JDBC connection string

Frontend access must rely on Supabase Auth, grants, and Row Level Security policies.

[Back to Table of Contents](#table-of-contents)

---

# Backend Boundary

The Spring Boot backend may later use:

- Supabase Project URL
- backend-only database connection values
- JWT validation configuration
- server-side business rules

The backend should not hardcode credentials in `application.properties`.

Database dependencies and datasource configuration should be added only when the first schema and connection strategy are ready.

[Back to Table of Contents](#table-of-contents)

---

# Security Rules

Baseline security rules:

- Commit examples, not real secrets.
- Keep `.env` and local application config ignored.
- Use the publishable key only for public clients.
- Keep elevated keys backend-only.
- Disable automatic table exposure.
- Enable RLS on tables exposed through the Data API.
- Add explicit grants and policies per table.

The default posture should be private until intentionally exposed.

[Back to Table of Contents](#table-of-contents)

---

# Next Implementation Steps

Recommended next steps:

1. Copy `.env.example` to `.env` locally.
2. Fill only local `.env` with Supabase values.
3. Copy `application-local.example.properties` to `application-local.properties` only when backend config is needed.
4. Define the first database schema from `docs/data-model.md`.
5. Create Supabase migrations after the schema is reviewed.
6. Add frontend Supabase Auth dependency only when building login.
7. Add backend database dependencies only when the backend actually connects to Postgres.

[Back to Table of Contents](#table-of-contents)

---

# References

Supabase documentation:

- Data API: https://supabase.com/docs/guides/database/data-api
- Securing the Data API: https://supabase.com/docs/guides/api/securing-your-api
- Hardening the Data API: https://supabase.com/docs/guides/api/hardening-data-api
- Row Level Security: https://supabase.com/docs/guides/database/postgres/row-level-security
- Available regions: https://supabase.com/docs/guides/platform/regions
- API keys: https://supabase.com/docs/guides/api/api-keys

[Back to Table of Contents](#table-of-contents)

