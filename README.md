# Prime Cane (Pvt) Ltd — Coming Soon

A modern, fully-animated single-page "coming soon" site for **primecane.com** — a sugar
mill in Chiredzi, Zimbabwe. Captures launch-notification signups while the full site is
in development.

## Stack

- **React 19 + Vite + TypeScript**
- **Tailwind CSS v4** (CSS-first brand tokens in `src/index.css`)
- **Motion** (Framer Motion) for all animation
- Self-hosted **Fraunces** + **Hanken Grotesk** via `@fontsource`
- **Cloudflare Pages** hosting + **Pages Functions** for the signup API
- Deploys automatically on push to `main` (build output: `dist/`)

## Develop

```bash
npm install
npm run dev          # Vite dev server (http://localhost:3000)
npm run build        # type-check + production build → dist/
npm run preview      # preview the production build
npm run lint         # eslint
npm test             # Playwright e2e (builds + previews automatically)
```

To run the signup **API** locally (Pages Function), serve the build with Wrangler:

```bash
npm run build
npx wrangler pages dev dist
```

## Brand assets (local one-off)

The hero image, favicons and OG card are generated from the brand source files in
`~/Downloads` and committed to the repo, so CI never needs the sources:

```bash
npm run assets       # requires poppler (pdfimages) + the brand PDF in ~/Downloads
```

Outputs: `src/assets/hero/*` (responsive WebP/JPEG + LQIP blur) and `public/*`
(favicons, `og-image.png`).

## Change the launch date

Edit the single constant `LAUNCH_DATE` in `src/lib/constants.ts`. The countdown and the
screen-reader summary both derive from it.

## ⚠️ Before launch — required

1. **Bind the signup KV namespace.** In the Cloudflare dashboard:
   *Pages → this project → Settings → Functions → KV namespace bindings* → add a binding
   with variable name **`SIGNUPS`**. **Until this is bound, signups are accepted by the
   form but NOT stored** (the function logs an error and returns success so the page
   stays functional). Verify a test signup appears in KV before going public.
2. *(Recommended)* Add a **Cloudflare WAF Rate Limiting rule** on `/api/subscribe`. The
   built-in KV counter in the function is best-effort only (KV is eventually consistent).
3. Confirm the production domain is `primecane.com` (preview `*.pages.dev` deploys are
   `noindex`-ed automatically via `functions/_middleware.ts`).
4. Optionally point the form at a different provider by setting `VITE_SIGNUP_ENDPOINT`
   (see `.env.example`).

## Project layout

```
functions/api/subscribe.ts   Signup API (honeypot, validation, KV persist, rate limit)
functions/_middleware.ts     noindex for *.pages.dev previews
scripts/process-assets.mjs   Local image/favicon/OG pipeline (sharp + poppler)
src/sections/                Hero, WhatWeBuild, Products, Chiredzi, Footer
src/components/               Preloader, Countdown, SignupForm, Logo, Marquee, …
src/lib/                      constants (copy + LAUNCH_DATE), motion variants, hooks
tests/e2e/                    Playwright smoke + axe accessibility suite
```
