import { handlers } from "@/lib/auth";
import { NextRequest } from "next/server";

const AUTH_HOST = "127.0.0.1:3000";

/**
 * Intercept the NextRequest to force 127.0.0.1 as the hostname.
 * Next.js 15 normalizes 127.0.0.1 → localhost internally, which
 * causes a redirect_uri mismatch during the OAuth token exchange
 * (oauth4webapi reads the Host header to compute redirect_uri).
 */
function sanitizeRequest(req: NextRequest): NextRequest {
  const url = req.nextUrl.clone();

  if (url.hostname === "localhost") {
    url.hostname = "127.0.0.1";
    url.port = "3000";

    const headers = new Headers(req.headers);
    headers.set("host", AUTH_HOST);
    headers.set("x-forwarded-host", AUTH_HOST);
    headers.set("x-forwarded-proto", "http");

    return new NextRequest(url, {
      method: req.method,
      headers,
      body: req.method === "POST" ? req.body : undefined,
      duplex: req.method === "POST" ? "half" : undefined,
    });
  }

  return req;
}

export async function GET(req: NextRequest) {
  return handlers.GET(sanitizeRequest(req));
}

export async function POST(req: NextRequest) {
  return handlers.POST(sanitizeRequest(req));
}
