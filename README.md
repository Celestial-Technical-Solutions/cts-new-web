# CTS Website Launch Package

## Celeste AI sales assistant

Celeste is a shared, accessible chat widget served on every page. Browser code calls the same-origin `/api/celeste` route; the Netlify Function validates requests and calls the xAI chat completions API. No provider key is sent to the browser. Conversation state stays in page memory. If a visitor asks CTS to follow up, their contact details and a summary are submitted—with explicit consent—to the existing Netlify Forms service as `celeste-lead`.

### Configure the AI provider secret

In Netlify, open **Site configuration → Environment variables** (or **Project configuration → Environment variables**) and add:

- Provider: xAI Grok. The browser sends messages to the Netlify function; the xAI key is used only by the server-side provider adapter.
- `XAI_API_KEY` — required secret/sensitive Netlify Function environment variable.
- `CELESTE_AI_MODEL` — optional xAI model override; defaults to `grok-3`. Set it to a model available to your xAI account if that model is unavailable.
- The xAI endpoint is fixed server-side at `https://api.x.ai/v1`; OpenAI key variables and a base URL override are not used.

Add these under Netlify **Project configuration → Environment variables**, ensure `XAI_API_KEY` is scoped to Functions/runtime, and redeploy after changes. Never put the key in HTML, browser JavaScript, a client bundle, or committed files.

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

