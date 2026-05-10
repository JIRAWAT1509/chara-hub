# Chara Hub

A personal AI workflow hub for choosing the right AI tool, preparing better prompts, and keeping task history in one place.

Chara Hub is not a new LLM. It is not a backend automation layer for consumer web chat subscriptions. It is a practical workflow platform for reducing context switching across tools like ChatGPT, Claude, Microsoft Copilot, Codex, Claude Code, and future local AI endpoints.

---

## Table of Contents

1. [What Is Chara Hub?](#what-is-chara-hub)
2. [Why This Project Exists](#why-this-project-exists)
3. [How It Works](#how-it-works)
4. [Core Use Cases](#core-use-cases)
5. [MVP Features](#mvp-features)
6. [Task Categories](#task-categories)
7. [Target AI Destinations](#target-ai-destinations)
8. [Tech Direction](#tech-direction)
9. [Project Boundaries](#project-boundaries)
10. [Local Development](#local-development)
11. [Current Status](#current-status)

---

# What Is Chara Hub?

Chara Hub is a web-first personal productivity tool for managing AI work.

The main idea is simple:

```text
Write the task once.
Let the hub classify it.
Get a recommended AI destination.
Apply a useful prompt template.
Copy or open the right tool.
Save the task for reuse later.
```

Instead of manually deciding where every prompt should go, Chara Hub acts as a routing and preparation layer for daily AI usage.

[Back to Table of Contents](#table-of-contents)

---

# Why This Project Exists

Using many AI tools is powerful, but messy.

Common problems:

- too many AI tabs and chat windows
- repeated prompt rewriting for different tools
- unclear choice between ChatGPT, Claude, Copilot, Codex, or Claude Code
- no central history of previous AI tasks
- no reusable prompt structure for repeated work
- no simple way to separate casual, serious work, and urgent work modes

Chara Hub exists to make that workflow more organized, repeatable, and provider-aware.

[Back to Table of Contents](#table-of-contents)

---

# How It Works

The expected MVP flow:

```text
1. User opens Chara Hub.
2. User writes or pastes a task.
3. The system classifies the task.
4. The system recommends a provider or tool.
5. The user optionally applies a built-in prompt template.
6. The user reviews a prepared prompt.
7. The user saves the task into history.
8. The user copies the prompt or opens the target AI tool.
9. The user can inspect and reuse saved tasks later.
```

Example:

```text
Input:
Fix this Angular form validation bug and explain the root cause.

Detected category:
coding / logical

Recommended destination:
Codex or Claude Code

Suggested profile:
Chara-Work

Suggested prompt style:
Analyze first, identify files, propose a small patch, then wait for approval.
```

The hub does not need to execute every task automatically. The first goal is to make the user's decision and handoff process faster and clearer.

[Back to Table of Contents](#table-of-contents)

---

# Core Use Cases

## 1. Daily AI Task Routing

Use Chara Hub as the starting point before choosing an AI tool.

```text
Task: "Help me rewrite this email to sound more professional."
Category: document / email
Recommended: Claude, ChatGPT, or Microsoft Copilot
```

## 2. Coding And Debugging Work

Prepare structured prompts for coding tools.

```text
Task: "Analyze this .NET API error and propose the smallest fix."
Category: coding / logical
Recommended: Codex or Claude Code
```

## 3. Company-Grounded Work

Route internal or Microsoft 365-related questions to grounded tools.

```text
Task: "Summarize this Teams meeting and find action items."
Category: company-grounded
Recommended: Microsoft Copilot / Teams AI
```

## 4. Prompt Reuse

Save useful prompts and reuse them later with a different provider, profile, or category.

## 5. Work Mode Control

Switch between different working profiles:

- `Chara` for casual/general tasks
- `Chara-Work` for serious coding, debugging, and architecture work
- `Chara-Rushing` for urgent or deadline-sensitive work

[Back to Table of Contents](#table-of-contents)

---

# MVP Features

The first version focuses on Hub mode only.

Current MVP features:

| Feature | Status |
| --- | --- |
| Simple login | Implemented |
| New Task workspace | Implemented |
| Task category detection | Implemented |
| Manual category override | Implemented |
| Provider recommendation | Implemented |
| Recommendation detail | Implemented |
| Prepared prompt preview | Implemented |
| Copy prompt action | Implemented |
| Open target action for URL providers | Implemented |
| Task history | Implemented |
| Task detail and event timeline | Implemented |
| Search and filters for saved tasks | Implemented |
| Reuse saved tasks | Implemented |
| Built-in template application | Implemented |
| Basic settings for default work mode | Implemented |
| Bundle budget cleanup | Implemented |
| Lightweight dashboard summary | Implemented |
| Provider preference settings | Implemented |
| Provider preference refresh and dirty-state polish | Implemented |
| Backend status endpoint | Implemented |
| Frontend backend status display | Implemented |
| JWT backend decision | Implemented |
| Local development guide | Implemented |
| First-run checklist | Implemented |
| Backend status troubleshooting | Implemented |
| MVP readiness review | Implemented |
| MVP smoke-test checklist | Implemented |
| MVP smoke-test run record | Public browser shell passed; authenticated workflow still pending |
| HTTPS local backend status CORS | Implemented |
| Login profile sync loop fix | Implemented |
| Backend-owned user data flow | Deferred |

The most important MVP screen is the New Task workspace because it proves the core product loop.

[Back to Table of Contents](#table-of-contents)

---

# Task Categories

Initial task categories:

| Category | Purpose |
| --- | --- |
| `general` | Everyday questions, simple help, casual usage |
| `reasoning` | Analysis, comparison, planning, decision support |
| `coding / logical` | Programming, debugging, architecture, technical reasoning |
| `document / email` | Writing, rewriting, summarizing, formal communication |
| `company-grounded` | Work that benefits from Microsoft 365, Teams, or internal context |

The classifier starts as rule-first logic so routing stays explainable, cheap, and easy to tune.

Later, a model-assisted classifier can be added only for low-confidence cases.

[Back to Table of Contents](#table-of-contents)

---

# Target AI Destinations

Initial supported destinations:

- ChatGPT
- Claude
- Microsoft Copilot / Teams AI
- Codex
- Claude Code
- optional local model endpoints later

Chara Hub recommends the destination. It does not try to bypass or automate paid consumer web subscriptions as backend infrastructure.

[Back to Table of Contents](#table-of-contents)

---

# Tech Direction

Current locked direction:

| Area | Choice |
| --- | --- |
| Frontend | Angular |
| Backend | Spring Boot |
| Database / Auth | Supabase |
| Product mode | Web-first |
| Desktop shell | Later phase |
| Classifier | Rule-first hybrid |
| MVP scope | Hub mode only |

High-level architecture:

```text
User
-> Angular Frontend
-> Supabase Auth
-> Supabase Postgres
```

Current Spring Boot mode:

```text
passive
```

Spring Boot currently exposes backend status/capability information. It does not own user data flow yet.

Later phase:

```text
User
-> Angular Frontend
-> Spring Boot API
-> Supabase
-> Optional local agent per machine
```

[Back to Table of Contents](#table-of-contents)

---

# Project Boundaries

Chara Hub should do:

- organize AI tasks
- classify prompts
- recommend providers
- prepare prompt templates
- store task history
- reduce context switching
- support future desktop or local-agent expansion

Chara Hub should not do in MVP:

- build a new LLM
- replace official Codex or Claude Code
- automate consumer paid web chat subscriptions
- run unsafe remote commands
- read or write local files across devices
- become a full agent platform before the hub workflow is proven

This boundary matters because the first version should solve a real workflow problem, not turn into an overbuilt AI orchestration monster.

[Back to Table of Contents](#table-of-contents)

---

# Local Development

Use the local development guide for setup, safe config files, frontend/backend commands, verification, and Git safety:

- [First-Run Checklist](docs/first-run-checklist.md)
- [Local Development Guide](docs/local-dev-guide.md)
- [Backend Status Troubleshooting](docs/backend-status-troubleshooting.md)
- [MVP Readiness Review](docs/mvp-readiness-review.md)
- [MVP Smoke-Test Checklist](docs/mvp-smoke-test-checklist.md)
- [MVP Smoke-Test Run](docs/mvp-smoke-test-run.md)

[Back to Table of Contents](#table-of-contents)

---

# Current Status

Current phase:

```text
Core MVP workflow implementation
```

Current focus:

```text
Keep the single-shell Hub workflow stable, then activate Spring Boot only for concrete server-side responsibilities.
```

Implemented so far:

```text
1. Angular frontend scaffold.
2. Spring Boot backend scaffold.
3. Supabase Auth and database schema.
4. New Task workspace.
5. Rule-first task classification.
6. Provider recommendation and recommendation detail.
7. Prepared prompt preview.
8. Save, search, inspect, and reuse task history.
9. Copy/open handoff actions with history events.
10. Built-in prompt template selection and application.
11. Basic settings for default work mode.
12. Bundle cleanup by removing unused router runtime.
13. Lightweight dashboard summary.
14. Provider preference settings.
15. Backend status endpoint and activation decision.
16. Frontend backend status display.
17. JWT backend decision.
18. Local development guide.
19. Provider preference refresh and dirty-state polish.
20. First-run checklist.
21. Backend status troubleshooting.
22. MVP readiness review.
23. MVP smoke-test checklist.
24. MVP smoke-test run record: automated checks passed; public browser shell/backend-status check passed with local config.
25. HTTPS local backend status CORS.
26. Login profile sync loop fix after local browser smoke testing.
```

Recommended next implementation order:

```text
1. Keep JWT validation deferred until the backend owns a protected endpoint.
2. Add JWT validation before any backend endpoint owns user data.
3. Complete the authenticated MVP browser smoke test after Tao signs in locally.
4. Record pass/fail notes for auth, New Task, save/history/reuse, and provider preferences.
5. Fix only bugs found during smoke testing.
6. Plan frontend component/route split after the MVP smoke test is stable.
7. Move recommendation policy server-side only when frontend rules become hard to manage.
```

The project intentionally stays small. The goal is to make the core workflow useful before adding desktop shells, local agents, or advanced automation.

[Back to Table of Contents](#table-of-contents)
