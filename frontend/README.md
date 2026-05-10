# Chara Hub Frontend

This directory contains the Angular frontend application for Chara Hub.

The frontend is responsible for the user-facing Hub mode experience, including task input, classification review, provider recommendation, prompt template actions, and history navigation.

---

## Table of Contents

1. [What This Frontend Does](#what-this-frontend-does)
2. [Tech Stack](#tech-stack)
3. [Development Server](#development-server)
4. [Runtime Config](#runtime-config)
5. [Local Development Guide](#local-development-guide)
6. [Build](#build)
7. [Tests](#tests)
8. [Project Boundary](#project-boundary)

---

# What This Frontend Does

The Angular app provides the main Chara Hub workflow:

```text
Write a task
-> Review detected category
-> Review provider recommendation
-> Apply a built-in prompt template when useful
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
| Built-in template application | Implemented |
| Basic default work mode setting | Implemented |
| Provider preference settings | Implemented |
| Bundle budget cleanup | Implemented |
| Backend status display | Implemented |

[Back to Table of Contents](#table-of-contents)

---

# Tech Stack

Current frontend direction:

| Area | Choice |
| --- | --- |
| Framework | Angular |
| Styling | SCSS |
| Routing | Not active in MVP shell |
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

# Runtime Config

The app reads runtime config from `public/config.js`.

Safe frontend values:

```js
window.CHARA_HUB_CONFIG = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabasePublishableKey: 'your-publishable-key',
  backendApiUrl: 'http://localhost:8080'
};
```

`backendApiUrl` is optional. When it is missing, the frontend shows that backend status is not configured and keeps the Hub workflow usable.

[Back to Table of Contents](#table-of-contents)

---

# Local Development Guide

For full local setup, backend status wiring, verification commands, and Git safety, see:

- [Local Development Guide](../docs/local-dev-guide.md)

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

