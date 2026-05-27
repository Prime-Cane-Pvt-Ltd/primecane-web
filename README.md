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

## Signup storage & retrieval

Signups are stored in a Cloudflare **KV namespace** bound as `SIGNUPS`, keyed by
`email:<address>` (deduplicated) with the signup time in metadata.

**Two one-time setup steps in the Cloudflare dashboard** (Pages → `primecane-web`):

1. **Bind KV** — *Settings → Bindings (Functions) → KV namespace* → create/select a
   namespace and bind it with the variable name **`SIGNUPS`**.
   *Until this is bound, signups are accepted by the form but NOT stored* (the function
   logs an error and still returns success so the page never looks broken).
2. **Set the admin key** — *Settings → Variables and Secrets* → add a **secret** named
   **`ADMIN_KEY`** with a long random value. This protects the export below.

### Where the emails are
- **Quick view:** Cloudflare dashboard → *Storage & Databases → KV →* the `SIGNUPS`
  namespace → every `email:…` key is one subscriber.
- **Download a CSV (recommended):** open
  `https://primecane.com/api/subscribers?key=YOUR_ADMIN_KEY` in a browser — it downloads
  `primecane-signups.csv` (email + signup date). Add `&format=json` for JSON.

## Also recommended before launch
- Add a **Cloudflare WAF Rate Limiting rule** on `/api/subscribe` (the in-function KV
  counter is best-effort only — KV is eventually consistent).
- Confirm the production domain is `primecane.com` (preview `*.pages.dev` deploys are
  `noindex`-ed automatically via `functions/_middleware.ts`).
- Optionally point the form at a different provider via `VITE_SIGNUP_ENDPOINT`
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
