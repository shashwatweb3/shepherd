/** @type {import('next').NextConfig} */

const CSP = [
  "default-src 'self'",
  // Next.js inlines hydration scripts; framer-motion sets inline styles at runtime
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline'",
  // font files are served from the same origin (local font), plus data: for font face declarations
  "font-src 'self' data:",
  // avatars.githubusercontent.com for any future og-image use
  "img-src 'self' data: https://avatars.githubusercontent.com",
  // API calls Shepherd makes from the browser: none (all GitHub/OSV calls are server-side)
  "connect-src 'self'",
  // no plugins, no frames, no workers from CDNs
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  // blocks Shepherd from being embedded in iframes on other sites (clickjacking)
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  // Stops browsers from MIME-sniffing a response away from the declared Content-Type
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Legacy clickjacking protection (modern browsers use frame-ancestors in CSP)
  { key: "X-Frame-Options", value: "DENY" },
  // Tells browsers not to send the full URL as the Referer header to third parties
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Disables browser features Shepherd has no business touching
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  // Content Security Policy
  { key: "Content-Security-Policy", value: CSP },
];

const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
    ],
  },

  async headers() {
    return [
      {
        // Apply to every route
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
