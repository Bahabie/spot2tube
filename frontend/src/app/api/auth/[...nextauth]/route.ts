import { Auth, setEnvDefaults } from "@auth/core";
import type { AuthConfig } from "@auth/core";
import { authConfig } from "@/lib/auth";

const AUTH_ORIGIN = "http://127.0.0.1:3000";

// Force AUTH_URL environment variable so setEnvDefaults cannot fall back to localhost
process.env.AUTH_URL = AUTH_ORIGIN;

/**
 * Build a plain Web Request with 127.0.0.1 forced as the hostname.
 *
 * Next.js 15 normalizes 127.0.0.1 → localhost inside NextRequest.nextUrl.
 * This causes a redirect_uri mismatch during the OAuth token exchange
 * because oauth4webapi computes the redirect_uri from the Host header.
 *
 * By constructing a standard Web Request (not NextRequest) and passing it
 * directly to @auth/core's Auth(), we completely sidestep the normalization.
 */
function toWebRequest(req: Request): Request {
  const original = new URL(req.url);

  // Replace localhost with 127.0.0.1 (keeps path + query intact)
  const fixed = new URL(original.pathname + original.search, AUTH_ORIGIN);

  const headers = new Headers(req.headers);
  headers.set("host", "127.0.0.1:3000");
  headers.set("x-forwarded-host", "127.0.0.1:3000");
  headers.set("x-forwarded-proto", "http");
  headers.set("origin", AUTH_ORIGIN);

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
  // Cast through unknown: NextAuthConfig uses next-auth's bundled @auth/core
  // types which are nominally incompatible with the top-level @auth/core.
  const config = { ...authConfig } as unknown as AuthConfig;
  setEnvDefaults(process.env, config, true);

  return Auth(toWebRequest(req), config);
}

export { handler as GET, handler as POST };
