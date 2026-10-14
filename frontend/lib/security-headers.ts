/** Keep the static rendering model: Next.js flight scripts and the translation
 * widget need inline scripts/styles. This is a practical origin allowlist,
 * not a nonce-based strict CSP. */
export function securityHeaders(development: boolean, preview: boolean) {
  const toolbar = preview ? " https://vercel.live" : "";
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${development ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://cdn.gtranslate.net${toolbar}`,
    `style-src 'self' 'unsafe-inline'${toolbar}`,
    `img-src 'self' data: blob: https://res.cloudinary.com https://i.ytimg.com${toolbar}${preview ? " https://vercel.com" : ""}`,
    `font-src 'self'${preview ? " https://vercel.live https://assets.vercel.com" : ""}`,
    `connect-src 'self' https://challenges.cloudflare.com https://translate-pa.googleapis.com${development ? " ws: wss:" : ""}${toolbar}${preview ? " wss://ws-us3.pusher.com" : ""}`,
    "media-src 'self' blob: https://res.cloudinary.com",
    `frame-src 'self' https://challenges.cloudflare.com https://www.google.com https://www.youtube-nocookie.com https://www.youtube.com https://player.vimeo.com${toolbar}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'self'",
  ].join("; ");
  return [
    { key: "Content-Security-Policy", value: csp },
    { key: "X-Frame-Options", value: "SAMEORIGIN" },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    // Video embeds keep fullscreen/autoplay/encrypted-media permissions.
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  ];
}
