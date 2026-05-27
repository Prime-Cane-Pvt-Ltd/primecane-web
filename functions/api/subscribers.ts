/// <reference types="@cloudflare/workers-types" />

/**
 * GET /api/subscribers — export the launch-notification list.
 *
 * Protected by the `ADMIN_KEY` secret. Returns a CSV download by default
 * (open the URL in a browser and it downloads), or JSON with `?format=json`.
 *
 *   https://primecane.com/api/subscribers?key=YOUR_ADMIN_KEY
 *   https://primecane.com/api/subscribers?key=YOUR_ADMIN_KEY&format=json
 *
 * Or with a header:  Authorization: Bearer YOUR_ADMIN_KEY
 */

interface Env {
  SIGNUPS?: KVNamespace;
  ADMIN_KEY?: string;
}

/** Constant-time string compare (avoids leaking the key via timing). */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function csvCell(v: string): string {
  return /[",\n]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v;
}

const NO_INDEX = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex, nofollow" };

export const onRequest: PagesFunction<Env> = async ({ request, env }) => {
  if (request.method !== "GET") {
    return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET", ...NO_INDEX } });
  }

  const url = new URL(request.url);
  const provided =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    url.searchParams.get("key") ??
    "";

  // Auth is enforced before any data access.
  if (!env.ADMIN_KEY || provided.length === 0 || !safeEqual(provided, env.ADMIN_KEY)) {
    return new Response("Unauthorized", { status: 401, headers: NO_INDEX });
  }
  if (!env.SIGNUPS) {
    return new Response("Storage not configured", { status: 503, headers: NO_INDEX });
  }

  // List every subscriber key (paginated), reading the date from metadata.
  const subscribers: { email: string; ts: string }[] = [];
  let cursor: string | undefined;
  do {
    const page = await env.SIGNUPS.list<{ ts?: string }>({ prefix: "email:", cursor, limit: 1000 });
    for (const k of page.keys) {
      subscribers.push({ email: k.name.slice("email:".length), ts: k.metadata?.ts ?? "" });
    }
    cursor = page.list_complete ? undefined : page.cursor;
  } while (cursor);

  subscribers.sort((a, b) => a.ts.localeCompare(b.ts));

  if (url.searchParams.get("format") === "json") {
    return new Response(JSON.stringify({ count: subscribers.length, subscribers }, null, 2), {
      headers: { "Content-Type": "application/json; charset=utf-8", ...NO_INDEX },
    });
  }

  const csv = [
    "email,signed_up_at",
    ...subscribers.map((s) => `${csvCell(s.email)},${csvCell(s.ts)}`),
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="primecane-signups.csv"',
      ...NO_INDEX,
    },
  });
};
