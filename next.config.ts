import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All product images are served from /public today. Add specific
    // hostnames here (e.g. Supabase Storage) once remote images are needed —
    // never a wildcard, to avoid the image optimizer being used as an
    // open proxy for arbitrary URLs.
    remotePatterns: [],
    // 92 is used by the hero background; Next.js requires every quality
    // value in use to be listed here or the production build fails.
    qualities: [75, 92],
  },
};

export default nextConfig;
