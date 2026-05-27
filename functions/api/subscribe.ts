/// <reference types="@cloudflare/workers-types" />

/**
 * POST /api/subscribe — launch-notification capture (spec §7B).
 *
 * Native Cloudflare Pages Function. Validates server-side, blocks bots via a
 * honeypot, rate-limits per IP, de-duplicates, and persists to the `SIGNUPS`
 * KV namespace. If KV is not yet bound it still accepts gracefully, so the form
 * is functional from day one and "wiring it up" is a one-click binding later.
 *
 * Bind KV in the Cloudflare dashboard:
 *   Settings → Functions → KV namespace bindings → variable name `SIGNUPS`.
 */

interface Env {
  /** Optional until bound in the dashboard. */
  SIGNUPS?: KVNamespace;
}

// Server-side validation — the client check is a convenience, not the gate.
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_EMAIL_LEN = 254;
const RATE_LIMIT = 20; // submissions per IP per hour
const RATE_WINDOW_SECONDS = 3600;

function json(status: number, body: Record<string, string>): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  // Single handler so non-POST methods get a clean 405 (and take precedence
  // over the SPA _redirects fallback) instead of serving the app shell.
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", {
      status: 405,
      headers: { Allow: "POST", "Cache-Control": "no-store" },
    });
  }

  if (!(request.headers.get("content-type") ?? "").includes("application/json")) {
    return json(415, { status: "error" });
  }

  const data = (await request.json().catch(() => null)) as {
    email?: unknown;
    hp?: unknown;
  } | null;
  if (!data) return json(400, { status: "invalid" });

  // Honeypot — a real visitor never fills this. Silently accept to deny signal.
  if (typeof data.hp === "string" && data.hp.trim() !== "") {
    console.log("[subscribe] honeypot triggered — dropping silently");
    return json(200, { status: "subscribed" });
  }

  const email = String(data.email ?? "").trim().toLowerCase();
  if (email.length > MAX_EMAIL_LEN || !EMAIL_RE.test(email)) {
    return json(400, { status: "invalid" });
  }

  // Graceful degradation until the KV namespace is bound. NOTE: while unbound,
  // signups are NOT persisted — bind the `SIGNUPS` KV namespace before launch
  // (see README / handoff notes). Logged as an error so it surfaces in logs.
  if (!env.SIGNUPS) {
    console.error(`[subscribe] SIGNUPS KV not bound — signup NOT persisted: ${email}`);
    return json(200, { status: "subscribed" });
  }

  const ip = request.headers.get("CF-Connecting-IP") ?? "unknown";

  // Lightweight per-IP rate limit.
  const rlKey = `rl:${ip}`;
  const count = Number.parseInt((await env.SIGNUPS.get(rlKey)) ?? "0", 10) || 0;
  if (count >= RATE_LIMIT) {
    console.log(`[subscribe] rate limit hit for ${ip}`);
    return json(429, { status: "error" });
  }
  await env.SIGNUPS.put(rlKey, String(count + 1), { expirationTtl: RATE_WINDOW_SECONDS });

  // De-duplicate.
  const key = `email:${email}`;
  if (await env.SIGNUPS.get(key)) return json(200, { status: "duplicate" });

  await env.SIGNUPS.put(
    key,
    JSON.stringify({
      email,
      ts: new Date().toISOString(),
      ua: request.headers.get("user-agent")?.slice(0, 200) ?? "",
    }),
  );
  return json(200, { status: "subscribed" });
};
