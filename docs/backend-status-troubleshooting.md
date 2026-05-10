# Backend Status Troubleshooting

This guide explains how to diagnose the optional frontend-to-backend status check during local development.

The backend is still passive. This guide only covers `GET /api/status`; it does not move user data flow behind Spring Boot.

---

## Table of Contents

1. [Expected Local Setup](#expected-local-setup)
2. [Healthy Result](#healthy-result)
3. [Backend URL Not Configured](#backend-url-not-configured)
4. [Backend Not Running](#backend-not-running)
5. [Wrong Backend URL](#wrong-backend-url)
6. [CORS During Local Development](#cors-during-local-development)
7. [Direct Endpoint Check](#direct-endpoint-check)
8. [What Not To Change](#what-not-to-change)

---

# Expected Local Setup

Frontend:

```text
http://localhost:4200/
```

Backend:

```text
http://localhost:8080/api/status
```

Frontend config:

```js
window.CHARA_HUB_CONFIG = {
  supabaseUrl: 'https://your-project-ref.supabase.co',
  supabasePublishableKey: 'your-publishable-key',
  backendApiUrl: 'http://localhost:8080'
};
```

`backendApiUrl` should be the backend origin only. Do not include `/api/status` in the config value.

[Back to Table of Contents](#table-of-contents)

---

# Healthy Result

When the check works, the frontend should show a passive backend state similar to:

```text
chara-hub-api is passive.
```

The response should include:

| Field | Expected Value |
| --- | --- |
| `service` | `chara-hub-api` |
| `mode` | `passive` |
| `ownsUserDataFlow` | `false` |

[Back to Table of Contents](#table-of-contents)

---

# Backend URL Not Configured

Frontend message:

```text
Backend URL not configured.
```

Meaning:

- `frontend/public/config.js` is missing `backendApiUrl`, or
- config has not loaded in the browser session yet.

Fix:

1. Open `frontend/public/config.js`.
2. Add `backendApiUrl: 'http://localhost:8080'`.
3. Refresh the browser.

If you do not need backend status during frontend work, this state is acceptable. The Hub workflow still works.

[Back to Table of Contents](#table-of-contents)

---

# Backend Not Running

Common browser/frontend symptom:

```text
Failed to fetch
```

Fix:

```cmd
cd backend
cmd /c mvnw.cmd spring-boot:run
```

Then open:

```text
http://localhost:8080/api/status
```

If the browser cannot open that URL directly, the frontend cannot load it either.

[Back to Table of Contents](#table-of-contents)

---

# Wrong Backend URL

Common mistakes:

| Config Value | Problem |
| --- | --- |
| `http://localhost:8080/api/status` | The frontend appends `/api/status`, causing a duplicated path. |
| `https://localhost:8080` | Local backend runs over HTTP by default. |
| `http://localhost:4200` | This points at the frontend, not the backend. |
| empty or missing value | Frontend reports backend URL not configured. |

Correct value:

```js
backendApiUrl: 'http://localhost:8080'
```

[Back to Table of Contents](#table-of-contents)

---

# CORS During Local Development

The status endpoint allows these local frontend origins:

```text
http://localhost:4200
http://127.0.0.1:4200
http://localhost:4201
http://127.0.0.1:4201
https://localhost:4200
https://127.0.0.1:4200
https://localhost:4201
https://127.0.0.1:4201
```

If the Angular dev server runs on another port, either use one of the allowed ports or add the new development origin to the backend status CORS list.

Keep this narrow. Do not use wildcard CORS for future authenticated or user-data endpoints.

[Back to Table of Contents](#table-of-contents)

---

# Direct Endpoint Check

Browser check:

```text
http://localhost:8080/api/status
```

PowerShell check:

```cmd
Invoke-RestMethod http://localhost:8080/api/status
```

Expected important values:

```text
service: chara-hub-api
mode: passive
ownsUserDataFlow: false
```

[Back to Table of Contents](#table-of-contents)

---

# What Not To Change

Do not fix backend status issues by adding:

- Supabase service role keys
- database passwords
- datasource config
- Spring Data repositories
- JWT validation without a protected backend-owned endpoint
- wildcard CORS for future protected endpoints

The status endpoint is only a passive capability check.

[Back to Table of Contents](#table-of-contents)
