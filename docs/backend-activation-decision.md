# Backend Activation Decision

This document records when Spring Boot should become active in Chara Hub and what it should own first.

---

## Table of Contents

1. [Decision](#decision)
2. [Current Mode](#current-mode)
3. [Why Not Move Data Flow Yet](#why-not-move-data-flow-yet)
4. [Active Backend Surface](#active-backend-surface)
5. [Activation Criteria](#activation-criteria)
6. [Boundaries](#boundaries)
7. [Next Steps](#next-steps)

---

# Decision

Spring Boot should stay in passive mode for the current MVP.

The Angular app should continue to use Supabase directly for:

- authentication
- user profile bootstrap
- task persistence
- provider recommendation records
- prompt templates
- task history
- provider preferences

The backend becomes active only for health/capability discovery now. It should not own user data flow until there is a concrete server-side need.

[Back to Table of Contents](#table-of-contents)

---

# Current Mode

Current backend mode:

```text
passive
```

Meaning:

- Spring Boot can run.
- Spring Boot exposes a small status/capability endpoint.
- The Angular frontend can display backend status when `backendApiUrl` is configured.
- Spring Boot does not validate user JWTs yet.
- Spring Boot does not connect directly to Supabase Postgres yet.
- Spring Boot does not replace frontend Supabase reads/writes yet.

[Back to Table of Contents](#table-of-contents)

---

# Why Not Move Data Flow Yet

Moving task persistence behind Spring Boot now would add complexity without a strong payoff.

It would require:

- JWT validation
- backend authorization rules
- direct Postgres or Supabase API access
- CORS and deployment configuration
- error mapping between frontend, backend, and Supabase
- a migration path from existing frontend services

The current frontend workflow is still small and RLS-backed. Supabase already protects user-owned rows through policies. Until backend-only rules exist, direct Supabase access is acceptable for the MVP.

[Back to Table of Contents](#table-of-contents)

---

# Active Backend Surface

The first active backend endpoint is:

```http
GET /api/status
```

Purpose:

- prove the backend can expose a stable API
- document that the backend is intentionally passive
- advertise future activation criteria
- provide a simple integration point for frontend/backend checks

This endpoint does not require secrets, database config, or authentication.

[Back to Table of Contents](#table-of-contents)

---

# Activation Criteria

Spring Boot should become active in user workflows when at least one of these is true:

| Trigger | Why Backend Helps |
| --- | --- |
| JWT validation is needed | The backend must identify users before owning protected operations. |
| Recommendation rules need server control | Routing policy may need centralized tuning without frontend deploys. |
| Prompt templating becomes complex | Backend can enforce consistent template rendering and validation. |
| History writes need orchestration | Backend can make multi-table writes more consistent. |
| Backend-only integrations are added | Secrets and server credentials must not live in the frontend. |
| Direct database access becomes necessary | Spring can own repositories and service boundaries intentionally. |

[Back to Table of Contents](#table-of-contents)

---

# Boundaries

Do not add these until there is a concrete backend-owned flow:

- Supabase service role key
- database password
- datasource config
- Spring Data/JPA/JDBC repositories
- user-data endpoints without JWT validation
- automation for consumer paid AI web subscriptions

Frontend may continue to use:

- Supabase Project URL
- Supabase publishable key

[Back to Table of Contents](#table-of-contents)

---

# Next Steps

Recommended order:

1. Keep `/api/status` as the first backend contract.
2. Keep the frontend backend-status display lightweight and optional.
3. Keep JWT validation deferred until a protected backend-owned endpoint exists.
4. Add JWT validation before any backend endpoint reads or writes user-owned data.
5. Move recommendation policy server-side only when frontend rules become hard to manage.
6. Add database access only when the backend owns a real workflow.

See also:

- [JWT Backend Decision](jwt-backend-decision.md)
- [Local Development Guide](local-dev-guide.md)
- [Backend Status Troubleshooting](backend-status-troubleshooting.md)
- [MVP Readiness Review](mvp-readiness-review.md)

[Back to Table of Contents](#table-of-contents)
