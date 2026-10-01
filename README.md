# CTS Website Launch Package

## Celeste AI sales assistant

Celeste is a shared, accessible chat widget served on every page. Browser code calls the same-origin `/api/celeste` route; the Netlify Function validates requests and calls an OpenAI-compatible chat completions API. No provider key is sent to the browser. Conversation state stays in page memory. If a visitor asks CTS to follow up, their contact details and a summary are submitted—with explicit consent—to the existing Netlify Forms service as `celeste-lead`.

### Configure the AI provider secret

In Netlify, open **Site configuration → Environment variables** (or **Project configuration → Environment variables**) and add:

- Preferred provider: OpenAI's API for ChatGPT models. A ChatGPT web subscription is separate from API access and does not provide an API key or API usage credits.
- `CELESTE_AI_API_KEY` — preferred OpenAI API key; mark it secret/sensitive.
- `XAI_API_KEY` — optional xAI API key. If `CELESTE_AI_API_KEY` is unset and this key is present, Celeste defaults to xAI's `https://api.x.ai/v1` endpoint.
- `CELESTE_AI_MODEL` — model identifier enabled for that key.
- `CELESTE_AI_BASE_URL` — optional HTTPS OpenAI-compatible API base URL. Defaults to `https://api.openai.com/v1` for OpenAI, or `https://api.x.ai/v1` when using only `XAI_API_KEY`.

Set these for the Functions runtime and redeploy after changing them. Never put credentials in HTML, JavaScript, committed files, or client-exposed build variables. For local `netlify dev`, use environment variables in your shell or a root `.env` file that is excluded from version control; do not publish or commit it.

The in-memory per-IP limit is best-effort and may reset across serverless instances. For stronger production abuse protection, add a shared rate-limit service or edge/WAF rule. Review the configured AI provider's data handling and retention terms before using it with prospect information.

## Before going live
1. Replace the text-based CTS masthead with the official CTS logo file if desired.
2. Verify the official CTS phone number, email address, location and domain spelling.
3. Create Stripe Payment Links and paste them into `stripeLinks` in script.js.
4. Enable Netlify Forms in the site settings so requested Celeste follow-ups can be received.
5. Configure a Netlify Forms notification for `celeste-lead` to reach the CTS team (for example, info@celestechsolutions.com).
6. Test desktop, tablet and mobile layouts, the function, and a consented test lead.

## Recommended deployment
Upload this folder to a GitHub repository, connect that repository to Netlify, then add the CTS-owned custom domain in Netlify and update DNS at the current domain registrar.

This is a clean static site and requires no build command.

Netlify setup:
1. Push this folder to GitHub.
2. Connect the GitHub repo in Netlify.
3. Set "Build command" to blank and "Publish directory" to `.`.
4. Configure the Celeste environment variables above and enable Netlify Forms.
5. Add your custom domain and update DNS as directed by Netlify.

