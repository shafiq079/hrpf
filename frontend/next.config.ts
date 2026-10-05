import type { NextConfig } from "next";

const apiOrigin = new URL(process.env.INTERNAL_API_URL ?? "http://127.0.0.1:5000");
if (!["http:", "https:"].includes(apiOrigin.protocol) || apiOrigin.username ||
    apiOrigin.password || apiOrigin.pathname !== "/" || apiOrigin.search || apiOrigin.hash) {
  throw new Error("INTERNAL_API_URL must be an HTTP(S) origin without credentials or a path");
}
const codespaceHost = process.env.CODESPACE_NAME
  ? `${process.env.CODESPACE_NAME}-3000.${process.env.GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN ?? "app.github.dev"}`
  : undefined;
const nextConfig: NextConfig = {
  allowedDevOrigins: codespaceHost ? [codespaceHost] : [],
  async rewrites() {
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${apiOrigin.origin}/api/:path*` }],
      afterFiles: [], fallback: [],
    };
  },
};

export default nextConfig;
