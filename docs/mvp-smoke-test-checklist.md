# MVP Smoke-Test Checklist

This checklist verifies the current Chara Hub MVP against a real local Supabase-backed setup.

Use this after automated build/test checks pass. The goal is to find real workflow bugs before calling the MVP ready.

For the latest recorded run, see [MVP Smoke-Test Run](mvp-smoke-test-run.md).

---

## Table of Contents

1. [Before Testing](#before-testing)
2. [Automated Checks](#automated-checks)
3. [Local App Startup](#local-app-startup)
4. [Auth Smoke Test](#auth-smoke-test)
5. [New Task Smoke Test](#new-task-smoke-test)
6. [Template Smoke Test](#template-smoke-test)
7. [Save And History Smoke Test](#save-and-history-smoke-test)
8. [Handoff Smoke Test](#handoff-smoke-test)
9. [Provider Preference Smoke Test](#provider-preference-smoke-test)
10. [Backend Status Smoke Test](#backend-status-smoke-test)
11. [Regression Notes](#regression-notes)
12. [Pass Criteria](#pass-criteria)

---

# Before Testing

Start clean:

```cmd
git status --short --branch
git log --oneline --decorate -8
```

Confirm local config exists:

```text
frontend/public/config.js
```

Confirm `frontend/public/config.js` contains safe frontend values only:

```js
window.CHARA_HUB_CONFIG = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabasePublishableKey: 'your-publishable-key',
  backendApiUrl: 'http://localhost:8080'
};
```

Do not put service role keys, database passwords, cookies, or secret keys in frontend config.

[Back to Table of Contents](#table-of-contents)

---

# Automated Checks

Run these before browser smoke testing:

```cmd
cd frontend
npm.cmd run build
npm.cmd test -- --watch=false

cd ..\backend
cmd /c mvnw.cmd test

cd ..
git diff --check
```

Expected result:

| Check | Expected |
| --- | --- |
| Frontend build | Pass |
| Frontend tests | Pass |
| Backend tests | Pass |
| Diff whitespace check | Pass |

[Back to Table of Contents](#table-of-contents)

---

# Local App Startup

Terminal 1:

```cmd
cd frontend
npm.cmd start
```

Expected frontend URL:

```text
http://localhost:4200/
```

Terminal 2:

```cmd
cd backend
cmd /c mvnw.cmd spring-boot:run
```

Expected backend status URL:

```text
http://localhost:8080/api/status
```

If the backend is not needed for the current check, the frontend should still be usable without it.

[Back to Table of Contents](#table-of-contents)

---

# Auth Smoke Test

Checklist:

- Open `http://localhost:4200/`.
- Confirm Supabase config status does not report missing config.
- Sign in with a valid test account.
- Refresh the browser.
- Confirm the signed-in shell still loads.
- Sign out.
- Sign back in.

Pass criteria:

- Sign-in works.
- Refresh does not break the session unexpectedly.
- Sign-out returns to the auth shell.

[Back to Table of Contents](#table-of-contents)

---

# New Task Smoke Test

Use this sample prompt:

```text
Fix this Angular form validation bug and explain the smallest safe patch.
```

Checklist:

- Enter a task title.
- Paste the sample prompt.
- Set work mode to `Chara-Work`.
- Confirm detected category is `coding / logical`.
- Manually change category, then change it back.
- Confirm provider recommendation updates.
- Confirm recommendation detail shows strengths, alternatives, confidence, and handoff type.
- Confirm prepared prompt preview updates.

Pass criteria:

- Category detection is understandable.
- Manual category override works.
- Recommendation and prepared prompt stay in sync.

[Back to Table of Contents](#table-of-contents)

---

# Template Smoke Test

Checklist:

- Select a built-in template that matches the task.
- Apply the template.
- Confirm the prepared prompt includes task, category, work mode, and provider context.
- Change work mode or category.
- Confirm matching template list and preview still behave predictably.

Pass criteria:

- Template application does not erase the raw task.
- Prepared prompt updates without broken placeholders.
- No `{{rawPrompt}}`, `{{category}}`, `{{workMode}}`, or `{{provider}}` placeholder remains in the final prepared prompt.

[Back to Table of Contents](#table-of-contents)

---

# Save And History Smoke Test

Checklist:

- Save the task.
- Confirm the task appears in recent saved tasks.
- Use search text to find the saved task.
- Filter by category, work mode, and status.
- Open task detail.
- Confirm saved prompt, recommendation, and event timeline appear.
- Click reuse.
- Confirm the form is populated from the saved task.

Pass criteria:

- Saved task appears without needing a full page reload.
- Search and filters narrow the list correctly.
- Detail and timeline match the saved task.
- Reuse fills the current form with the expected values.

[Back to Table of Contents](#table-of-contents)

---

# Handoff Smoke Test

Checklist:

- Save a task first.
- Click copy prepared prompt.
- Confirm the UI reports the copy action.
- Open the same saved task detail.
- Confirm `COPIED_PROMPT` appears in the timeline.
- For a URL provider, click open provider.
- Confirm a new browser tab opens.
- Confirm `OPENED_PROVIDER` appears in the timeline.
- For a manual provider such as Codex or Claude Code, confirm manual handoff guidance appears instead of a broken URL action.

Pass criteria:

- Copy works.
- URL provider opens correctly.
- Manual providers do not pretend to open a URL.
- Handoff events are recorded only when appropriate.

[Back to Table of Contents](#table-of-contents)

---

# Provider Preference Smoke Test

Checklist:

- Open provider preference settings.
- Choose a category and work mode.
- Change provider order.
- Confirm unsaved-change state appears.
- Save preferences.
- Refresh preferences.
- Confirm saved order remains.
- Create or update a task matching that category/work mode.
- Confirm recommendation order reflects the saved preference.
- Reset or change preference back if the test account should stay clean.

Pass criteria:

- Unsaved-change state is accurate.
- Save and refresh do not lose the preference.
- Recommendation order changes according to saved preferences.

[Back to Table of Contents](#table-of-contents)

---

# Backend Status Smoke Test

Checklist:

- Start the backend.
- Open `http://localhost:8080/api/status` directly.
- Confirm response includes `service`, `mode`, and `ownsUserDataFlow`.
- Confirm `mode` is `passive`.
- Confirm `ownsUserDataFlow` is `false`.
- Set `backendApiUrl: 'http://localhost:8080'` in `frontend/public/config.js`.
- Refresh the frontend.
- Confirm the context panel shows backend passive status.

If this fails, use [Backend Status Troubleshooting](backend-status-troubleshooting.md).

Pass criteria:

- Direct backend endpoint works.
- Frontend status display works.
- Backend remains clearly passive/status-only.

[Back to Table of Contents](#table-of-contents)

---

# Regression Notes

Record smoke-test notes in the working branch or issue tracker before fixing anything.

Suggested format:

```text
Date:
Branch:
Tester:

Passed:
- [ ]

Failed:
- [ ]

Follow-up bugs:
- [ ]
```

Fix only bugs found during the smoke test. Do not use this slice to add new product scope.

[Back to Table of Contents](#table-of-contents)

---

# Pass Criteria

The MVP can be called ready for local personal use when:

- automated frontend checks pass
- automated backend checks pass
- auth smoke test passes
- New Task smoke test passes
- template smoke test passes
- save/history/reuse smoke test passes
- handoff smoke test passes
- provider preference smoke test passes
- backend status smoke test passes or is explicitly skipped as optional
- no high-risk regression remains open

If a smoke-test item fails, create a focused bug-fix branch for that failure instead of broadening the MVP.

[Back to Table of Contents](#table-of-contents)
