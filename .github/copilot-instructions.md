# CTS Website Agent Instructions

## Project overview
This repository contains a simple static marketing website for Celestial Technical Solutions. It is designed to be deployed directly to Netlify without a build step.

## Primary files
- index.html: page structure and content
- styles.css: visual design, layout, responsive behavior
- script.js: mobile menu behavior and placeholder integrations
- assets/: images and static media

## Working guidelines
- Keep the site lightweight and dependency-free.
- Prefer small, targeted edits over large rewrites.
- Preserve the existing brand tone: professional, technical, and enterprise-focused.
- Maintain responsive behavior for desktop, tablet, and mobile layouts.
- Do not introduce frameworks, bundlers, or package managers unless explicitly requested.
- If a feature requires external services (Stripe, CRM, form handling), leave placeholders or clear TODO notes rather than pretending they are live.
- Keep copy polished and suitable for a B2B technology audience.

## Validation
- Verify HTML, CSS, and JavaScript changes for obvious issues after editing.
- Since this is a static site, no build command is required; simple file-level validation is sufficient.
- When changing content, ensure anchors, button labels, and form fields remain consistent with the rest of the page.
