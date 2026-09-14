import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Remote catalogue imagery is served directly; the platform's image
    // optimiser is bypassed so previews work without outbound fetches.
    unoptimized: true,
    remotePatterns: [{ protocol: "https", hostname: "images.pexels.com" }],
  },
};

export default nextConfig;
