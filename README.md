# CTS Website Launch Package

## Celeste AI sales assistant

Celeste is a shared chat widget mounted on every page. Browser code calls the same-origin `/api/celeste` route; the Netlify Function validates requests and proxies them to the Base44 Agent API. The Base44 API key is server-only. For required environment variables, API setup, and key rotation, see [CELESTE_INTEGRATION.md](CELESTE_INTEGRATION.md).

## Before going live
1. Replace the text-based CTS masthead with the official CTS logo file if desired.
2. Verify the official CTS phone number, email address, location and domain spelling.
3. Create Stripe Payment Links and paste them into `stripeLinks` in script.js.
4. Test desktop, tablet and mobile layouts and the Base44-backed chat.

## Recommended deployment
Upload this folder to a GitHub repository, connect that repository to Netlify, then add the CTS-owned custom domain in Netlify and update DNS at the current domain registrar.

This is a clean static site and requires no build command.

Netlify setup:
1. Push this folder to GitHub.
2. Connect the GitHub repo in Netlify.
3. Set "Build command" to blank and "Publish directory" to `.`.
4. Configure the Celeste environment variables described in `CELESTE_INTEGRATION.md`.
5. Add your custom domain and update DNS as directed by Netlify.

