import { Auth, setEnvDefaults } from "@auth/core";
import type { AuthConfig } from "@auth/core";
import { authConfig } from "@/lib/auth";

/**
 * Build a plain Web Request avoiding hardcoded origins.
 *
 * Next.js 15 normalizes 127.0.0.1 → localhost inside NextRequest.nextUrl.
 * By constructing a standard Web Request (not NextRequest) and passing it
 * directly to @auth/core's Auth(), we sidestep the normalization if it was
 * actually a 127.0.0.1 request, without breaking production Vercel URLs.
 */
function toWebRequest(req: Request): Request {
  const original = new URL(req.url);
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
  const protocol = req.headers.get("x-forwarded-proto") || "http";
  
  // If no host is found, just return the original request
  if (!host) return req;

  // Reconstruct the true URL from headers rather than Next.js's normalized URL
  const trueOrigin = `${protocol}://${host}`;
  const fixed = new URL(original.pathname + original.search, trueOrigin);

  const headers = new Headers(req.headers);
  headers.set("origin", trueOrigin);

  return new Request(fixed, {
    method: req.method,
    headers,
    body: req.method !== "GET" && req.method !== "HEAD" ? req.body : undefined,
    // @ts-expect-error -- duplex required for streaming body in undici/Node
    duplex: req.method !== "GET" && req.method !== "HEAD" ? "half" : undefined,
  });
}

/**
 * Call @auth/core directly instead of next-auth's handlers.
 * This avoids NextRequest URL normalization entirely.
 */
async function handler(req: Request): Promise<Response> {
  const config = { ...authConfig } as unknown as AuthConfig;
  config.trustHost = true;
  setEnvDefaults(process.env, config, true);

  return Auth(toWebRequest(req), config);
}

export { handler as GET, handler as POST };
