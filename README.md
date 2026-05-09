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
10. [Current Status](#current-status)

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
5. The user reviews a prepared prompt.
6. The user saves the task into history.
7. The user copies the prompt or opens the target AI tool.
8. The user can inspect and reuse saved tasks later.
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

Planned MVP features:

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
| Built-in template application | Planned |
| Basic settings for preferences | Planned |

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
-> Spring Boot API
-> Supabase
```

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

# Current Status

Current phase:

```text
Core MVP workflow implementation
```

Current focus:

```text
Make the New Task workflow useful end to end, then expose built-in templates and settings without expanding into agent mode.
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
```

Recommended next implementation order:

```text
1. Add built-in template selection/application.
2. Add basic settings for default work mode and provider preferences.
3. Decide when Spring Boot should become active in the workflow.
4. Add routed pages only after the single-shell MVP is stable.
```

The project intentionally stays small. The goal is to make the core workflow useful before adding desktop shells, local agents, or advanced automation.

[Back to Table of Contents](#table-of-contents)
