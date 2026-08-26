import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Product photos uploaded from /admin land in Supabase Storage — listed
    // explicitly (never a wildcard) so the image optimizer can't be used as
    // an open proxy for arbitrary URLs.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "gpuaouvbjrffltehafsg.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    // 92 is used by the hero background; Next.js requires every quality
    // value in use to be listed here or the production build fails.
    qualities: [75, 92],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-XSS-Protection",
            value: "1; mode=block",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
