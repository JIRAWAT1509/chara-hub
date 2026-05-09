# Chara Hub Frontend

This directory contains the Angular frontend application for Chara Hub.

The frontend is responsible for the user-facing Hub mode experience, including task input, classification review, provider recommendation, prompt template actions, and history navigation.

---

## Table of Contents

1. [What This Frontend Does](#what-this-frontend-does)
2. [Tech Stack](#tech-stack)
3. [Development Server](#development-server)
4. [Build](#build)
5. [Tests](#tests)
6. [Project Boundary](#project-boundary)

---

# What This Frontend Does

The Angular app provides the main Chara Hub workflow:

```text
Write a task
-> Review detected category
-> Review provider recommendation
-> Review prepared prompt
-> Save task
-> Copy or open the target AI destination
-> Inspect task detail and event timeline
-> Reuse previous tasks from history
```

The first useful screen should be the New Task workspace because it proves the core product loop.

Current implemented frontend scope:

| Area | Status |
| --- | --- |
| Supabase Auth shell | Implemented |
| New Task workspace | Implemented |
| Local classifier | Implemented |
| Provider recommendation detail | Implemented |
| Prepared prompt preview | Implemented |
| Save task to Supabase | Implemented |
| Copy/open handoff actions | Implemented |
| Handoff history events | Implemented |
| Recent history search/filter | Implemented |
| Task detail and timeline | Implemented |
| Built-in template application | Planned |

[Back to Table of Contents](#table-of-contents)

---

# Tech Stack

Current frontend direction:

| Area | Choice |
| --- | --- |
| Framework | Angular |
| Styling | SCSS |
| Routing | Angular Router |
| Package manager | npm |
| Server-side rendering | Disabled for MVP |

[Back to Table of Contents](#table-of-contents)

---

# Development Server

Run the development server from this directory:

```bash
npm start
```

The app should run at:

```text
http://localhost:4200/
```

[Back to Table of Contents](#table-of-contents)

---

# Build

Create a production build:

```bash
npm run build
```

Build output is generated under Angular's configured `dist/` directory.

[Back to Table of Contents](#table-of-contents)

---

# Tests

Run frontend tests:

```bash
npm test
```

The current scaffold uses Vitest through the Angular CLI test setup.

[Back to Table of Contents](#table-of-contents)

---

# Project Boundary

The frontend should stay focused on Hub mode in the MVP.

It should not:

- automate paid consumer AI web subscriptions
- execute local files or commands
- become a local agent console
- store provider credentials
- hide routing decisions from the user

The app should recommend destinations, prepare prompts, and make handoff clear.

[Back to Table of Contents](#table-of-contents)

