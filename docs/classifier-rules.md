# Chara Hub Classifier Rules

This document defines the first rule-based task classifier for Chara Hub.

The classifier detects the task category, estimates confidence, and gives the provider decision matrix enough context to recommend the right AI destination.

---

## Table of Contents

1. [Classifier Goals](#classifier-goals)
2. [Classification Flow](#classification-flow)
3. [Task Categories](#task-categories)
4. [Keyword Signals](#keyword-signals)
5. [Scoring Rules](#scoring-rules)
6. [Confidence Thresholds](#confidence-thresholds)
7. [Tie-Breaking Rules](#tie-breaking-rules)
8. [Manual Override Behavior](#manual-override-behavior)
9. [Classification Examples](#classification-examples)
10. [MVP Boundaries](#mvp-boundaries)
11. [Future Improvements](#future-improvements)

---

# Classifier Goals

The first classifier should be explainable, cheap, and easy to tune.

It should:

- classify a task into one primary category
- return a confidence score
- expose the signals that affected the decision
- support manual user override
- avoid hidden or surprising routing behavior
- work well enough before model-assisted classification exists

The MVP should prefer predictable rule-based behavior over clever model-only classification.

[Back to Table of Contents](#table-of-contents)

---

# Classification Flow

The first classifier flow is rule-first.

```text
Raw prompt
-> Normalize text
-> Match category keyword signals
-> Apply scoring rules
-> Resolve ties
-> Return category, confidence, and reason
```

The classification result then feeds the provider decision matrix.

```text
Classification result
-> Provider decision matrix
-> Provider recommendation
-> Prompt template suggestion
```

[Back to Table of Contents](#table-of-contents)

---

# Task Categories

Initial categories:

| Category | Purpose |
| --- | --- |
| `GENERAL` | Everyday questions, simple help, and casual usage |
| `REASONING` | Analysis, comparison, planning, and decision support |
| `CODING_LOGICAL` | Programming, debugging, architecture, and technical reasoning |
| `DOCUMENT_EMAIL` | Writing, rewriting, summarizing, and formal communication |
| `COMPANY_GROUNDED` | Work that benefits from Microsoft 365, Teams, or internal company context |

These categories should stay stable during the MVP unless routing quality clearly requires a new category.

[Back to Table of Contents](#table-of-contents)

---

# Keyword Signals

Keyword signals are starting points, not final truth.

The classifier should match words and phrases after normalizing case and trimming extra whitespace.

## General

Common signals:

| Signal Type | Examples |
| --- | --- |
| Casual help | `what is`, `how do i`, `explain`, `help me understand` |
| Everyday use | `idea`, `recommend`, `suggest`, `simple question` |
| Thai casual usage | `คืออะไร`, `ช่วยอธิบาย`, `แนะนำ`, `ถามหน่อย` |

## Reasoning

Common signals:

| Signal Type | Examples |
| --- | --- |
| Analysis | `analyze`, `compare`, `pros and cons`, `tradeoff` |
| Planning | `plan`, `strategy`, `roadmap`, `prioritize` |
| Decision support | `which should`, `best option`, `decide`, `evaluate` |
| Thai reasoning usage | `วิเคราะห์`, `เปรียบเทียบ`, `ข้อดีข้อเสีย`, `ควรเลือก` |

## Coding / Logical

Common signals:

| Signal Type | Examples |
| --- | --- |
| Coding | `code`, `bug`, `fix`, `debug`, `refactor`, `implement` |
| Frameworks | `Angular`, `.NET`, `Spring Boot`, `React`, `Vue`, `Flutter` |
| Project work | `repo`, `branch`, `commit`, `PR`, `diff`, `test` |
| Errors | `stack trace`, `exception`, `compile error`, `runtime error` |
| Thai coding usage | `แก้บั๊ก`, `โค้ด`, `error`, `พัง`, `ไล่ logic` |

## Document / Email

Common signals:

| Signal Type | Examples |
| --- | --- |
| Writing | `rewrite`, `draft`, `summarize`, `polish`, `tone` |
| Email | `email`, `message`, `reply`, `formal`, `professional` |
| Documents | `document`, `report`, `minutes`, `proposal` |
| Thai writing usage | `เขียนเมล`, `สรุป`, `ปรับภาษา`, `ทางการ`, `สุภาพ` |

## Company-Grounded

Common signals:

| Signal Type | Examples |
| --- | --- |
| Microsoft 365 | `Teams`, `Outlook`, `SharePoint`, `OneDrive`, `PowerPoint`, `Excel` |
| Company context | `meeting`, `action items`, `internal`, `policy`, `client` |
| Work grounding | `from this meeting`, `company data`, `my calendar`, `work chat` |
| Thai company usage | `ประชุม`, `งานบริษัท`, `ลูกค้า`, `ใน Teams`, `สรุป meeting` |

[Back to Table of Contents](#table-of-contents)

---

# Scoring Rules

Each category starts at `0`.

Suggested initial scoring:

| Rule | Score |
| --- | --- |
| Strong keyword or phrase match | `+3` |
| Medium keyword match | `+2` |
| Weak keyword match | `+1` |
| Framework, tool, or platform-specific match | `+2` |
| Work mode strongly supports category | `+1` |
| Prompt is very short and ambiguous | `-1` from all non-general categories |
| Multiple unrelated category groups are strong | confidence penalty after scoring |

Recommended work mode boosts:

| Work Mode | Boost |
| --- | --- |
| `CHARA` | `GENERAL +1` |
| `CHARA_WORK` | `CODING_LOGICAL +1`, `REASONING +1`, `COMPANY_GROUNDED +1` |
| `CHARA_RUSHING` | Boost the strongest detected category by `+1` |

The classifier should keep a short list of matched signals for explanation.

[Back to Table of Contents](#table-of-contents)

---

# Confidence Thresholds

Confidence should be derived from the winning score and the gap between the top categories.

Suggested thresholds:

| Result | Condition | Confidence |
| --- | --- | --- |
| Strong match | Winning score `>= 5` and gap `>= 3` | `0.85 - 1.00` |
| Good match | Winning score `>= 4` and gap `>= 2` | `0.70 - 0.84` |
| Mixed match | Winning score `>= 3` and gap `< 2` | `0.50 - 0.69` |
| Weak match | Winning score `1 - 2` | `0.35 - 0.49` |
| No clear match | No useful signals | `0.20 - 0.34` |

If no useful signals are found, default to `GENERAL` with low confidence.

[Back to Table of Contents](#table-of-contents)

---

# Tie-Breaking Rules

Tie-breaking should be predictable.

Recommended priority:

1. If `COMPANY_GROUNDED` has strong Microsoft 365 or internal-context signals, choose `COMPANY_GROUNDED`.
2. If `CODING_LOGICAL` has error, framework, repository, or implementation signals, choose `CODING_LOGICAL`.
3. If `DOCUMENT_EMAIL` has email, rewrite, summarize, or tone signals, choose `DOCUMENT_EMAIL`.
4. If the prompt asks for planning, comparison, or decisions, choose `REASONING`.
5. Otherwise choose `GENERAL`.

Reasoning:

- Company-grounded work depends heavily on external context, so routing it wrong is costly.
- Coding work benefits from tools that understand implementation context.
- Document and email tasks are common and should not be swallowed by generic reasoning.

[Back to Table of Contents](#table-of-contents)

---

# Manual Override Behavior

The user can override the detected category.

When a user changes the category manually, Chara Hub should:

- keep the original auto-detected category
- store the manual category as the active category
- rerun provider recommendation using the manual category
- record a history event
- optionally use the override later to tune preferences

Suggested data:

| Field | Purpose |
| --- | --- |
| `detectedCategory` | Original classifier result |
| `selectedCategory` | User-confirmed active category |
| `confidence` | Confidence from classifier |
| `matchedSignals` | Signals that explain the classifier result |

[Back to Table of Contents](#table-of-contents)

---

# Classification Examples

Example 1:

```text
Input:
Fix this Angular form validation bug and explain the root cause.

Matched signals:
Angular, form validation, bug, fix, root cause

Detected category:
CODING_LOGICAL

Confidence:
High
```

Example 2:

```text
Input:
Rewrite this email to sound polite but direct.

Matched signals:
rewrite, email, polite, direct

Detected category:
DOCUMENT_EMAIL

Confidence:
High
```

Example 3:

```text
Input:
Summarize this Teams meeting and list action items.

Matched signals:
summarize, Teams, meeting, action items

Detected category:
COMPANY_GROUNDED

Confidence:
High
```

Example 4:

```text
Input:
Should I build the MVP with Angular first or backend first?

Matched signals:
should I, MVP, Angular, backend, decision

Detected category:
REASONING

Confidence:
Medium

Note:
This has coding-related words, but the task asks for a project decision rather than implementation.
```

[Back to Table of Contents](#table-of-contents)

---

# MVP Boundaries

The classifier should not become an overbuilt AI router in the MVP.

In MVP, it should not:

- call an LLM for every classification
- hide its reasoning from the user
- send prompts to providers automatically
- override user-selected categories
- create too many categories
- depend on provider credentials

The classifier should stay boring, explainable, and easy to tune.

[Back to Table of Contents](#table-of-contents)

---

# Future Improvements

Possible later improvements:

- model-assisted classification for low-confidence prompts
- per-user classifier tuning
- language-aware keyword groups
- category feedback tracking
- provider success feedback
- template recommendation based on matched signals
- analytics for ambiguous prompts

These should come after the MVP workflow proves useful.

[Back to Table of Contents](#table-of-contents)

