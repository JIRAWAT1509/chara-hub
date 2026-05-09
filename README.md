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
5. The user applies a prompt template if needed.
6. The user copies the prompt or opens the target AI tool.
7. The task is saved into history.
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

- simple login
- prompt inbox
- new task workspace
- task category detection
- manual category override
- provider recommendation
- prompt template injection
- copy prompt action
- open target action
- task history
- reusable templates
- profile / work mode selection
- basic settings for provider preferences

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
Planning and foundation
```

Current focus:

```text
Define the product shape, MVP workflow, architecture, data model, classifier rules, and provider decision matrix before scaffolding the app.
```

Recommended next implementation order:

```text
1. Finalize public README.
2. Define data model.
3. Define provider decision matrix.
4. Define classifier rules.
5. Scaffold Angular frontend.
6. Scaffold Spring Boot backend.
7. Connect Supabase auth/database.
8. Build the New Task workspace first.
```

The project intentionally starts small. The goal is to make the core workflow useful before adding desktop shells, local agents, or advanced automation.

[Back to Table of Contents](#table-of-contents)
