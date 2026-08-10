# CTS Website Launch Package

## Included
- index.html
- styles.css
- script.js
- assets/design-reference.png

## Before going live
1. Replace the text-based CTS masthead with the official CTS logo file if desired.
2. Verify the official CTS phone number, email address, location and domain spelling.
3. Create Stripe Payment Links and paste them into `stripeLinks` in script.js.
4. Connect the contact form to GoHighLevel, Netlify Forms, Formspree, or another CTS intake workflow.
5. Add privacy policy / terms pages if collecting leads or processing payments.
6. Test desktop, tablet and mobile layouts.

## Recommended deployment
Upload this folder to a GitHub repository, connect that repository to Netlify, then add the CTS-owned custom domain in Netlify and update DNS at the current domain registrar.

This is a clean static site and requires no build command.

Netlify setup:
1. Push this folder to GitHub.
2. Connect the GitHub repo in Netlify.
3. Set "Build command" to blank and "Publish directory" to `.`.
4. Enable Netlify Forms in the site settings if you want built-in form capture.
5. Add your custom domain and update DNS as directed by Netlify.

