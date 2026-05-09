# Chara Hub Provider Decision Matrix

This document defines the first provider recommendation rules for Chara Hub.

The matrix helps the app recommend the right AI destination based on task category, work mode, provider strengths, and user preferences.

---

## Table of Contents

1. [Matrix Goals](#matrix-goals)
2. [Recommendation Flow](#recommendation-flow)
3. [Supported Providers](#supported-providers)
4. [Category Defaults](#category-defaults)
5. [Work Mode Adjustments](#work-mode-adjustments)
6. [Provider Strengths](#provider-strengths)
7. [Confidence Rules](#confidence-rules)
8. [Recommendation Examples](#recommendation-examples)
9. [MVP Boundaries](#mvp-boundaries)
10. [Future Improvements](#future-improvements)

---

# Matrix Goals

The provider decision matrix should make Chara Hub useful before adding complex AI routing.

It should:

- recommend a primary AI destination
- show reasonable alternatives
- explain why the recommendation was made
- respect task category and work mode
- allow user preference overrides later
- stay simple enough to tune manually

The MVP should use rule-first logic. Model-assisted routing can be added later only for low-confidence cases.

[Back to Table of Contents](#table-of-contents)

---

# Recommendation Flow

The first recommendation flow is intentionally simple.

```text
User prompt
-> Detect task category
-> Read selected work mode
-> Apply provider decision matrix
-> Apply user provider preferences
-> Return primary provider, alternatives, confidence, and reason
```

The user should always be able to manually override the recommendation.

[Back to Table of Contents](#table-of-contents)

---

# Supported Providers

Initial providers:

| Provider | Provider Key | Main Role |
| --- | --- | --- |
| ChatGPT | `chatgpt` | General-purpose reasoning, mixed work, everyday use |
| Claude | `claude` | Writing, long-context reasoning, document-heavy work |
| Microsoft Copilot / Teams AI | `microsoft_copilot` | Microsoft 365 and company-grounded work |
| Codex | `codex` | Coding, debugging, repository-aware engineering work |
| Claude Code | `claude_code` | Coding, debugging, and project-aware engineering work |

Provider keys should stay stable because they will be stored in tasks, recommendations, history, and preferences.

[Back to Table of Contents](#table-of-contents)

---

# Category Defaults

This table defines the default provider recommendation by task category.

| Task Category | Primary Provider | Alternatives | Reason |
| --- | --- | --- | --- |
| `GENERAL` | ChatGPT | Claude | Good for broad everyday questions and flexible mixed tasks |
| `REASONING` | ChatGPT | Claude | Strong fit for planning, comparison, and decision support |
| `CODING_LOGICAL` | Codex | Claude Code, ChatGPT | Best fit for coding, debugging, architecture, and repo-aware work |
| `DOCUMENT_EMAIL` | Claude | ChatGPT, Microsoft Copilot | Strong fit for writing, rewriting, summarization, and long-form text |
| `COMPANY_GROUNDED` | Microsoft Copilot / Teams AI | ChatGPT, Claude | Best fit when Microsoft 365, Teams, or internal company context matters |

These defaults should be treated as explainable starting points, not hard locks.

[Back to Table of Contents](#table-of-contents)

---

# Work Mode Adjustments

Work mode can adjust the default recommendation.

| Work Mode | Adjustment |
| --- | --- |
| `CHARA` | Prefer simple, general-purpose providers and lighter prompt templates |
| `CHARA_WORK` | Prefer stronger reasoning, coding, or structured-work providers |
| `CHARA_RUSHING` | Prefer the provider most likely to solve the task directly with minimal back-and-forth |

Recommended behavior:

| Category | `CHARA` | `CHARA_WORK` | `CHARA_RUSHING` |
| --- | --- | --- | --- |
| `GENERAL` | ChatGPT | ChatGPT | ChatGPT |
| `REASONING` | ChatGPT | ChatGPT or Claude | ChatGPT |
| `CODING_LOGICAL` | ChatGPT | Codex or Claude Code | Codex |
| `DOCUMENT_EMAIL` | ChatGPT or Claude | Claude | Claude |
| `COMPANY_GROUNDED` | Microsoft Copilot | Microsoft Copilot | Microsoft Copilot |

For urgent work, the app should favor clarity and direct handoff over showing too many alternatives.

[Back to Table of Contents](#table-of-contents)

---

# Provider Strengths

Provider strengths explain why a recommendation was made.

| Provider | Strengths | Weak Fit |
| --- | --- | --- |
| ChatGPT | General help, reasoning, mixed tasks, flexible conversation | Work that requires internal company context |
| Claude | Writing, editing, summarization, long-context document reasoning | Repository execution or machine-local actions |
| Microsoft Copilot / Teams AI | Microsoft 365, Teams, company-grounded context | Personal coding repo work outside company context |
| Codex | Coding, debugging, codebase-aware work, implementation planning | General writing or company-grounded Microsoft 365 tasks |
| Claude Code | Coding, debugging, project-aware work | General non-coding tasks or Microsoft 365-grounded work |

The app should display short user-facing reasons based on this table.

[Back to Table of Contents](#table-of-contents)

---

# Confidence Rules

Confidence should be simple and explainable in the MVP.

Suggested score ranges:

| Confidence | Meaning | Example |
| --- | --- | --- |
| `0.80 - 1.00` | Strong match | Coding task in `CHARA_WORK` mode recommends Codex |
| `0.60 - 0.79` | Good match with reasonable alternatives | Reasoning task could go to ChatGPT or Claude |
| `0.40 - 0.59` | Unclear match | Prompt has mixed coding and email-writing intent |
| `0.00 - 0.39` | Low confidence | Prompt is too short or lacks clear intent |

Initial scoring rules:

| Signal | Score Impact |
| --- | --- |
| Clear category keyword match | Increase confidence |
| Work mode agrees with category | Increase confidence |
| Multiple unrelated category signals | Decrease confidence |
| Very short prompt | Decrease confidence |
| User has a saved preference for the category | Increase recommendation confidence slightly |

Low-confidence recommendations should show alternatives more prominently.

[Back to Table of Contents](#table-of-contents)

---

# Recommendation Examples

Example 1:

```text
Input:
Fix this Angular form validation bug and explain the root cause.

Detected category:
CODING_LOGICAL

Work mode:
CHARA_WORK

Recommended provider:
Codex

Alternatives:
Claude Code, ChatGPT

Reason:
This is a coding and debugging task that benefits from project-aware analysis and implementation support.
```

Example 2:

```text
Input:
Rewrite this email to sound polite but direct.

Detected category:
DOCUMENT_EMAIL

Work mode:
CHARA

Recommended provider:
Claude

Alternatives:
ChatGPT

Reason:
This is a writing task where tone, clarity, and revision quality matter most.
```

Example 3:

```text
Input:
Summarize this Teams meeting and list action items.

Detected category:
COMPANY_GROUNDED

Work mode:
CHARA_WORK

Recommended provider:
Microsoft Copilot / Teams AI

Alternatives:
ChatGPT, Claude

Reason:
This task depends on Microsoft 365 or Teams context, so a company-grounded assistant is the best destination.
```

[Back to Table of Contents](#table-of-contents)

---

# MVP Boundaries

The provider decision matrix should not become a hidden automation layer.

In MVP, Chara Hub should not:

- automate paid consumer web chat subscriptions
- store provider credentials
- impersonate users across AI providers
- send prompts to multiple providers automatically
- execute local files or commands
- replace official Codex or Claude Code workflows

The matrix only recommends where the user should take the prepared prompt.

[Back to Table of Contents](#table-of-contents)

---

# Future Improvements

Possible later improvements:

- model-assisted classification for low-confidence prompts
- user-specific routing preferences
- provider availability settings
- provider performance feedback
- template effectiveness tracking
- local endpoint support
- desktop shell handoff behavior

These should be added after the core Hub mode workflow is useful.

[Back to Table of Contents](#table-of-contents)

