/// <reference types="@cloudflare/workers-types" />

/**
 * Keep Cloudflare Pages *preview* deployments (*.pages.dev) out of search
 * indexes, so only the production apex (primecane.com) is indexable.
 */
export const onRequest: PagesFunction = async ({ request, next }) => {
  const res = await next();
  const host = new URL(request.url).hostname;
  if (host.endsWith(".pages.dev")) {
    const tagged = new Response(res.body, res);
    tagged.headers.set("X-Robots-Tag", "noindex, nofollow");
    return tagged;
  }
  return res;
};
