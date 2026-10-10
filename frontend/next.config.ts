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
  async headers() {
    return [{
      // These files are versioned. Use a new directory when replacing them.
      source: "/images/header-flags/v1/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }, {
      source: "/videos/home-banner/v1/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }, {
      source: "/images/heroes/v1/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }, {
      source: "/images/heroes/v2/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }, {
      source: "/images/people/v1/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }, {
      source: "/documents/profile/v1/:path*",
      headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
    }];
  },
  async redirects() {
    return [
      { source: "/get-involved", destination: "/become-a-member", permanent: true },
      { source: "/get-help", destination: "/contact", permanent: true },
      { source: "/news/:path*", destination: "/blogs/:path*", permanent: true },
      { source: "/updates/:path*", destination: "/blogs/:path*", permanent: true },
      { source: "/reports", destination: "/about/progress-reports", permanent: true },
      { source: "/team", destination: "/about/our-team", permanent: true },
      { source: "/media", destination: "/gallery", permanent: true },
      { source: "/governance", destination: "/about", permanent: true },
      { source: "/report-a-violation", destination: "/file-a-complaint", permanent: true },
    ];
  },
  async rewrites() {
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${apiOrigin.origin}/api/:path*` }],
      afterFiles: [], fallback: [],
    };
  },
};

export default nextConfig;
