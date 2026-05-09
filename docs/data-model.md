# Chara Hub Data Model

This document defines the first domain model for Chara Hub.

The model supports task routing, provider recommendation, prompt templating, and history without turning the MVP into a full agent platform.

---

## Table of Contents

1. [Model Goals](#model-goals)
2. [Core Concepts](#core-concepts)
3. [User Profile](#user-profile)
4. [Work Mode](#work-mode)
5. [Task](#task)
6. [Task Status](#task-status)
7. [Task Category](#task-category)
8. [Provider](#provider)
9. [Provider Recommendation](#provider-recommendation)
10. [Prompt Template](#prompt-template)
11. [Task History](#task-history)
12. [Provider Preference](#provider-preference)
13. [MVP Relationships](#mvp-relationships)
14. [First Implementation Notes](#first-implementation-notes)
15. [Deferred Models](#deferred-models)

---

# Model Goals

The first data model should keep the MVP practical and explainable.

It should support:

- storing user-created AI tasks
- classifying tasks into clear categories
- recommending providers based on rules and user preferences
- applying reusable prompt templates
- keeping enough history to reuse previous work
- leaving room for future desktop or local-agent features without building them in MVP

[Back to Table of Contents](#table-of-contents)

---

# Core Concepts

The MVP model centers on one task moving through classification, recommendation, prompt preparation, and handoff.

```text
UserProfile
-> WorkMode
-> Task
-> Classification
-> ProviderRecommendation
-> PromptTemplate
-> TaskHistory
```

Chara Hub should store workflow context, not provider credentials or hidden automation state.

[Back to Table of Contents](#table-of-contents)

---

# User Profile

`UserProfile` represents the current user's workflow settings inside Chara Hub.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `displayName` | string | User-facing name |
| `defaultWorkMode` | WorkMode | Default mode for new tasks |
| `createdAt` | timestamp | Created time |
| `updatedAt` | timestamp | Last updated time |

MVP notes:

- Supabase Auth owns authentication identity.
- The app profile stores workflow preferences only.
- The app should not store provider passwords, cookies, API keys, or subscription secrets.

[Back to Table of Contents](#table-of-contents)

---

# Work Mode

`WorkMode` represents how serious or urgent the task is.

| Value | Purpose |
| --- | --- |
| `CHARA` | Casual and general usage |
| `CHARA_WORK` | Serious coding, debugging, architecture, and logical work |
| `CHARA_RUSHING` | Urgent or deadline-sensitive work |

The selected work mode affects provider recommendation, prompt style, and UI emphasis.

[Back to Table of Contents](#table-of-contents)

---

# Task

`Task` represents one user-submitted AI task.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `userProfileId` | UUID | Owner profile |
| `title` | string | Optional user title |
| `rawPrompt` | text | Original task text |
| `preparedPrompt` | text | Prompt after template injection |
| `workMode` | WorkMode | Selected mode |
| `category` | TaskCategory | Current category |
| `status` | TaskStatus | Draft, prepared, sent, or archived |
| `createdAt` | timestamp | Created time |
| `updatedAt` | timestamp | Last updated time |

The raw prompt should stay available even after a template is applied, so users can compare the original input with the prepared handoff prompt.

[Back to Table of Contents](#table-of-contents)

---

# Task Status

`TaskStatus` tracks the current lifecycle state of a task.

| Value | Purpose |
| --- | --- |
| `DRAFT` | User is still editing |
| `PREPARED` | Task is classified and the prompt is ready |
| `SENT` | User copied the prompt or opened a target provider |
| `ARCHIVED` | Task is hidden from normal active views |

The MVP should avoid complex workflow states until the main routing loop is proven.

[Back to Table of Contents](#table-of-contents)

---

# Task Category

`TaskCategory` is the main classifier output.

| Value | Purpose |
| --- | --- |
| `GENERAL` | Everyday questions and casual usage |
| `REASONING` | Planning, comparison, analysis, and decisions |
| `CODING_LOGICAL` | Coding, debugging, architecture, and technical logic |
| `DOCUMENT_EMAIL` | Writing, rewriting, summarizing, and formal messages |
| `COMPANY_GROUNDED` | Microsoft 365, Teams, and internal company context |

Categories should stay small and explainable in the MVP. New categories should be added only when routing behavior would clearly improve.

[Back to Table of Contents](#table-of-contents)

---

# Provider

`Provider` represents an AI destination the user may hand off to.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | string | Stable key such as `chatgpt`, `claude`, or `codex` |
| `name` | string | Display name |
| `providerType` | ProviderType | Web, coding tool, company-grounded, or local later |
| `handoffUrl` | string | Optional URL to open |
| `isEnabled` | boolean | Whether the provider is selectable |

Initial providers:

| Provider | Expected Use |
| --- | --- |
| ChatGPT | General, reasoning, and mixed tasks |
| Claude | Writing, reasoning, and long-context work |
| Microsoft Copilot / Teams AI | Company-grounded work |
| Codex | Coding and project work |
| Claude Code | Coding and project work |

Chara Hub recommends providers. It should not automate paid consumer web chat subscriptions as backend infrastructure.

[Back to Table of Contents](#table-of-contents)

---

# Provider Recommendation

`ProviderRecommendation` represents the recommendation result for a task.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `taskId` | UUID | Related task |
| `primaryProviderId` | string | Recommended provider |
| `alternativeProviderIds` | string[] | Other reasonable choices |
| `confidence` | number | Score from 0 to 1 |
| `reason` | text | Human-readable explanation |
| `createdAt` | timestamp | Created time |

MVP notes:

- Recommendation should be explainable.
- Rule-first logic should come before model-assisted routing.
- Low-confidence cases can be handled later by a model-assisted classifier.

[Back to Table of Contents](#table-of-contents)

---

# Prompt Template

`PromptTemplate` represents a reusable prompt structure.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `name` | string | Template name |
| `description` | string | Short description |
| `category` | TaskCategory | Best matching category |
| `workMode` | WorkMode | Optional recommended mode |
| `body` | text | Template content |
| `isBuiltIn` | boolean | Built-in or user-created |
| `isFavorite` | boolean | User favorite |
| `createdAt` | timestamp | Created time |
| `updatedAt` | timestamp | Last updated time |

Template bodies can use simple placeholders:

```text
{{rawPrompt}}
{{category}}
{{workMode}}
{{provider}}
```

The MVP should keep templating simple. Advanced conditional templates can wait until the basic workflow is useful.

[Back to Table of Contents](#table-of-contents)

---

# Task History

`TaskHistory` represents user actions taken on a task.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `taskId` | UUID | Related task |
| `eventType` | TaskHistoryEventType | What happened |
| `providerId` | string | Optional provider |
| `details` | JSON | Small event metadata |
| `createdAt` | timestamp | Created time |

Initial events:

| Value | Purpose |
| --- | --- |
| `CREATED` | Task was created |
| `CLASSIFIED` | Category was detected or changed |
| `TEMPLATE_APPLIED` | Template was applied |
| `COPIED_PROMPT` | User copied the prepared prompt |
| `OPENED_PROVIDER` | User opened the target provider |
| `ARCHIVED` | Task was archived |

History should be useful for reuse and debugging recommendations, not a noisy audit system in the MVP.

[Back to Table of Contents](#table-of-contents)

---

# Provider Preference

`ProviderPreference` represents user preference overrides for routing.

| Field | Type | Notes |
| --- | --- | --- |
| `id` | UUID | Primary key |
| `userProfileId` | UUID | Owner profile |
| `category` | TaskCategory | Category being configured |
| `workMode` | WorkMode | Optional mode-specific preference |
| `providerOrder` | string[] | Preferred provider IDs |
| `createdAt` | timestamp | Created time |
| `updatedAt` | timestamp | Last updated time |

Provider preferences let users keep routing personal while preserving a clear default decision matrix.

[Back to Table of Contents](#table-of-contents)

---

# MVP Relationships

The first version should keep relationships simple.

```text
UserProfile 1 -> many Task
Task 1 -> many ProviderRecommendation
Task 1 -> many TaskHistory
PromptTemplate many -> one TaskCategory
ProviderPreference many -> one UserProfile
```

The model intentionally avoids local agent, device, file, and command execution relationships in MVP.

[Back to Table of Contents](#table-of-contents)

---

# First Implementation Notes

Implementation guidance:

- Start with enums in backend code and matching frontend types.
- Keep provider keys stable and lowercase.
- Store history as append-only events where practical.
- Keep classifier and recommendation decisions explainable.
- Do not add local agent, device registry, file access, or command execution tables in MVP.
- Do not store provider account credentials.

[Back to Table of Contents](#table-of-contents)

---

# Deferred Models

These models are intentionally out of MVP:

- Device
- LocalAgent
- AgentPermission
- CommandExecution
- FileAccessAudit
- Multi-provider comparison run
- Team workspace

They can be revisited only after Hub mode proves useful.

[Back to Table of Contents](#table-of-contents)

