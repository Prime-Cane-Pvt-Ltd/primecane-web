/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Email signup endpoint. Defaults to the Cloudflare Pages Function /api/subscribe. */
  readonly VITE_SIGNUP_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/* @fontsource packages ship CSS only (no type entry) — declare for side-effect imports */
declare module "@fontsource-variable/fraunces";
declare module "@fontsource-variable/hanken-grotesk";
