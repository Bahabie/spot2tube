import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin dev server to 127.0.0.1 so Host headers match OAuth redirect URIs.
  // This prevents macOS from resolving localhost to ::1 (IPv6) or
  // leaking 'localhost' into Host headers.
  serverExternalPackages: [],

  async headers() {
    return [
      {
        // Force correct Host header on all API routes in development.
        source: "/api/:path*",
        headers: [
          {
            key: "X-Forwarded-Host",
            value: "127.0.0.1:3000",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
