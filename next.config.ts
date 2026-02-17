import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: false,
  },
  // Next.js 16: turbopack artık üst seviyede (experimental.turbo kaldırıldı)
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
