# Celeste chat widget setup

The floating chat widget on celestechsolutions.com posts to `/api/celeste`, a Netlify
function (`netlify/functions/celeste.ts`) that proxies to the Base44 Superagents API.
The API key stays server-side and is never exposed to the browser.

## 1. Set the environment variable

Netlify, Site configuration, Environment variables:

| Variable | Required | Value |
| --- | --- | --- |
| `BASE44_API_KEY` | Yes | Personal API key for a user with access to the Celeste agent. Copy it from the Celeste agent editor, Developer / API Docs panel. |
| `BASE44_BASE_URL` | No | Defaults to `https://app.base44.com/api/agents/6a512bd87e7e4c489690fbb6`. Set it only to point at a different agent. |

Workspace API keys are rejected by the Superagents API. Use a personal API key or a
personal access token with full access.

Redeploy after saving. Until the key is present the widget shows
"Celeste is offline right now" and the function logs
`Celeste is not configured: BASE44_API_KEY is missing`.

## 2. How the function talks to Base44

Verified against the Base44 Superagents API reference:

- `POST {base}/conversations` creates the conversation, or returns the existing one.
  Response: `{ id, title, metadata, created_date, updated_date }`.
- `POST {base}/conversations/{id}/messages` with body `{ "content": "..." }` returns
  `{ id, role, content, metadata, file_urls, tool_calls }`.
- Auth is `Authorization: Bearer <token>`.

Each visitor message is prefixed with a short website context line (page path and title)
so the agent knows which page the question came from.

## 3. Timeouts

The Base44 message endpoint keeps the request open while the agent works, which can take
longer than a Netlify synchronous function allows (10 seconds on most plans). If replies
time out, either keep the Celeste agent's instructions tight so turns stay short, or move
the function to a plan and runtime that allows a longer execution limit.

## 4. Limits in the function

- 20 messages per hour per IP address
- 2000 characters per message
- 60 second upstream abort
