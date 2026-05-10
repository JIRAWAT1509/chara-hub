# JWT Backend Decision

This document records whether Chara Hub should add backend JWT validation now.

---

## Table of Contents

1. [Decision](#decision)
2. [Reasoning](#reasoning)
3. [Current Backend Trust Boundary](#current-backend-trust-boundary)
4. [When To Add JWT Validation](#when-to-add-jwt-validation)
5. [Implementation Shape Later](#implementation-shape-later)
6. [Current Next Step](#current-next-step)

---

# Decision

Do not add backend JWT validation yet.

Spring Boot should remain passive/status-only until the backend owns a protected user-data endpoint or server-side policy that cannot safely live in the frontend.

Current backend surface:

```http
GET /api/status
```

This endpoint is public, does not read user-owned data, and does not need authentication.

[Back to Table of Contents](#table-of-contents)

---

# Reasoning

Adding JWT validation now would create security plumbing without a protected workflow.

It would add:

- Spring Security configuration
- JWT decoder configuration
- Supabase issuer/audience decisions
- local environment requirements
- frontend Authorization header handling
- more failure states during local development

None of that protects meaningful user data while the frontend still owns Supabase Auth and RLS-backed direct data access.

[Back to Table of Contents](#table-of-contents)

---

# Current Backend Trust Boundary

Current mode:

```text
passive
```

Current rule:

```text
Public status/capability endpoints may exist without JWT.
Any endpoint that reads or writes user-owned data must require JWT first.
```

The Angular app may continue to use Supabase directly for:

- authentication
- task persistence
- task history
- prompt templates
- provider preferences
- provider recommendation records

[Back to Table of Contents](#table-of-contents)

---

# When To Add JWT Validation

Add JWT validation when one of these is about to be implemented:

| Trigger | Why JWT Becomes Necessary |
| --- | --- |
| Backend reads user tasks | The backend must know which user owns the rows. |
| Backend writes task history | The backend must prevent cross-user writes. |
| Backend saves provider preferences | Preference writes must be tied to the authenticated user. |
| Backend owns recommendation policy per user | User-specific policy requires authenticated identity. |
| Backend calls a secret-backed integration | The server must authorize who can trigger it. |

[Back to Table of Contents](#table-of-contents)

---

# Implementation Shape Later

When JWT becomes necessary, implement it as a small vertical slice:

1. Add Spring Security resource-server dependencies.
2. Configure Supabase JWT issuer/JWK settings through local config.
3. Keep `/api/status` public.
4. Add one protected endpoint, such as:

```http
GET /api/me
```

5. Have Angular call the protected endpoint with the Supabase access token.
6. Add backend tests for public vs protected endpoints.

Do not add datasource config, repositories, or service role keys in the same slice unless that exact endpoint needs them.

[Back to Table of Contents](#table-of-contents)

---

# Current Next Step

Recommended next product slice:

```text
Keep JWT deferred, then improve onboarding and local troubleshooting around the current single-shell workflow.
```

Good candidates:

- first-run setup checklist
- lightweight docs or UI polish only where it reduces setup friction

[Back to Table of Contents](#table-of-contents)
