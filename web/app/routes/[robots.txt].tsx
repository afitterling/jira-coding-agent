import type { LoaderFunctionArgs } from "@remix-run/node";

// Default secure robots.txt: disallow all crawlers from indexing the site.
// Also serves as the catch-all so /robots.txt no longer 404s in the Remix handler.
export function loader(_args: LoaderFunctionArgs) {
  const body = "User-agent: *\nDisallow: /\n";
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400",
    },
  });
}
