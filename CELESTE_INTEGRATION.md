# Celeste Integration

Celeste is a static-site chat widget backed by a Netlify serverless function. The browser sends messages only to the same-origin `/api/celeste` route. The function adds page context and calls the Base44 Agent API; the Base44 key is never included in browser code.

## Environment variables

Set both variables in the server-side environment for local development and deployment:

- `BASE44_API_KEY`: the API key for the Celeste Base44 Superagent. Obtain it from the agent editor's Developer/API Docs panel or the agent's API settings.
- `BASE44_BASE_URL`: the complete Base URL copied from that panel. It must end in `/api/agents/6a512bd87e7e4c489690fbb6` (use the exact host and path shown by Base44).

For local work, fill in the ignored `.env.local` file. `.env.example` contains placeholders only. With Netlify CLI, export those values before starting the local site and function, for example:

```sh
set -a
source .env.local
set +a
netlify dev
```

Configure the same two names as encrypted/server-side environment variables in the deployment platform. Do not define `BASE44_API_KEY` as a public/client variable (`NEXT_PUBLIC_*`, `VITE_*`, or equivalent).

- Netlify: Site configuration → Environment variables. Scope both values to Functions/runtime.
- Vercel: Project Settings → Environment Variables. Add both for the server runtime; this repository still needs a Vercel server route if moved off Netlify.
- Cloudflare: configure both as Worker secrets/environment bindings for the server handler; a Cloudflare adapter is required if moved off Netlify.
- VPS: configure both in the server process environment or its secret manager, not in static files served to visitors.

## Proxy behavior

`netlify/functions/celeste.ts` handles `POST /api/celeste` and accepts `message`, optional `conversationId`, `pagePath`, and `pageTitle`. It enforces a 2,000-character message limit and a limit of 20 requests per IP per hour. Upstream calls have a 60-second timeout. Invalid requests receive 400, throttled requests receive 429, and Base44/configuration failures receive a friendly 502. Logs contain only error metadata, never request text or the API key.

When a conversation ID is not supplied, the function checks `GET {BASE44_BASE_URL}/conversations` and creates one with `POST {BASE44_BASE_URL}/conversations` if needed. It then posts the user message to `POST {BASE44_BASE_URL}/conversations/{conversationId}/messages`, prefixed with the current page path and title. It does not call the optional memory endpoint.

The rate limiter is process-local and best-effort: serverless instances can have independent counters or restart. For a strict global production limit, add a shared rate-limit store or enforce an edge/WAF limit as well.

## Confirm Base44 field names

The Base44 Developer/API Docs panel is authoritative for request and response JSON fields. The response adapter is isolated in the typed `mapAgentResponse` function in `netlify/functions/celeste.ts` and includes a TODO to confirm those fields. The message request currently uses `{ content: ... }`, and conversation creation sends no body; verify these against the panel before production traffic. Adjust the request body and that mapping to the documented contract if the panel differs.

## Rotate the API key

1. Generate or rotate the key in Base44.
2. Replace `BASE44_API_KEY` in each server-side environment, keeping the value out of chat, source control, and browser settings.
3. Redeploy/restart the function so it receives the new value.
4. Revoke the old key in Base44 and verify the chat with a non-sensitive test message.

Never publish or commit `.env.local`. It is ignored by Git.
