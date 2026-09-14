import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // All imagery is self-hosted under public/images and optimised per request
    // (responsive srcset + AVIF/WebP).
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
