# Chara Hub Database Schema

This document explains the first Supabase database schema for Chara Hub.

The schema is designed for the MVP Hub mode: task routing, provider recommendation, prompt templates, and task history.

---

## Table of Contents

1. [Schema Goals](#schema-goals)
2. [Migration File](#migration-file)
3. [Schema Strategy](#schema-strategy)
4. [Tables](#tables)
5. [Auth And Ownership](#auth-and-ownership)
6. [Row Level Security](#row-level-security)
7. [Seed Data](#seed-data)
8. [MVP Boundaries](#mvp-boundaries)
9. [Next Steps](#next-steps)

---

# Schema Goals

The first schema should be useful, reviewable, and safe by default.

It should:

- store user profiles tied to Supabase Auth users
- store user tasks and their classification state
- store provider recommendations and task history
- store built-in and user-created prompt templates
- store user provider preferences
- enable Row Level Security on app tables
- avoid storing provider credentials or secrets

[Back to Table of Contents](#table-of-contents)

---

# Migration File

Initial migration:

```text
supabase/migrations/20260509195000_initial_schema.sql
```

This migration creates the MVP tables, indexes, update timestamp triggers, Row Level Security policies, grants, and initial seed data.

[Back to Table of Contents](#table-of-contents)

---

# Schema Strategy

The MVP uses the Supabase `public` schema with explicit grants and Row Level Security.

This is intentionally simpler than introducing separate `api` and `private` schemas during the first build.

Current project settings should remain:

| Setting | Value |
| --- | --- |
| Enable Data API | Enabled |
| Automatically expose new tables | Disabled |
| Enable automatic RLS | Enabled |

Tables are exposed only through explicit grants, and row access is controlled by RLS policies.

[Back to Table of Contents](#table-of-contents)

---

# Tables

Initial tables:

| Table | Purpose |
| --- | --- |
| `user_profiles` | Stores app-level user preferences linked to Supabase Auth |
| `providers` | Stores supported AI destinations |
| `tasks` | Stores user-submitted AI tasks |
| `provider_recommendations` | Stores recommendation results for tasks |
| `prompt_templates` | Stores built-in and user-created prompt templates |
| `task_history` | Stores important task events |
| `provider_preferences` | Stores user routing preferences |

The table names use lowercase snake case to match Postgres conventions.

[Back to Table of Contents](#table-of-contents)

---

# Auth And Ownership

Supabase Auth owns the real user identity.

`user_profiles.id` references:

```text
auth.users.id
```

User-owned tables reference `user_profiles.id` through `user_profile_id`.

This keeps app workflow data attached to the authenticated Supabase user without storing passwords or provider credentials in Chara Hub tables.

[Back to Table of Contents](#table-of-contents)

---

# Row Level Security

RLS is enabled on every app table.

Main policy shape:

| Table | Access Pattern |
| --- | --- |
| `user_profiles` | Users can read, insert, and update their own profile |
| `providers` | Authenticated users can read enabled providers |
| `tasks` | Users can read, insert, and update their own tasks |
| `provider_recommendations` | Users can read recommendations for their own tasks |
| `prompt_templates` | Users can read built-in templates and their own templates |
| `task_history` | Users can read and insert history for their own tasks |
| `provider_preferences` | Users can read, insert, and update their own preferences |

The first migration does not grant anonymous table access.

[Back to Table of Contents](#table-of-contents)

---

# Seed Data

The migration seeds initial providers:

| Provider ID | Name |
| --- | --- |
| `chatgpt` | ChatGPT |
| `claude` | Claude |
| `microsoft_copilot` | Microsoft Copilot / Teams AI |
| `codex` | Codex |
| `claude_code` | Claude Code |

The migration also seeds a small set of built-in prompt templates for coding, writing, and reasoning tasks.

[Back to Table of Contents](#table-of-contents)

---

# MVP Boundaries

The first schema does not include:

- device registry
- local agent tables
- command execution audit
- file access audit
- provider credentials
- multi-provider run comparison
- team workspace models

Those models belong to later phases after Hub mode is useful.

[Back to Table of Contents](#table-of-contents)

---

# Next Steps

Recommended next steps:

1. Review the SQL migration.
2. Apply it to the Supabase project only after review.
3. Add frontend auth flow.
4. Add typed frontend models for task/category/provider data.
5. Add backend DB dependencies only when the backend needs direct Postgres access.

[Back to Table of Contents](#table-of-contents)

