import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Imagery is already downloaded and converted to WebP under public/images,
    // so it is served directly as static assets (edge-cached, no per-request
    // optimiser invocation) rather than re-encoded on the fly.
    unoptimized: true,
  },
};

export default nextConfig;
